const qrcode = require('qrcode'); // Menggunakan qrcode untuk gambar
const { Client, LocalAuth } = require('whatsapp-web.js');
const session = require('./features/session');
const { handleMessages } = require('./features/handle_messages');
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const port = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Post data to an API
async function postData(url, body) {
    try {
        const response = await axios.post(url, body);
        return response.data;
    } catch (error) {
        console.error("Error posting data:", error);
        return null;
    }
}

const client = new Client({
    authStrategy: new LocalAuth()
});

let qrCodeImageUrl = ''; // Variabel untuk menyimpan URL gambar QR Code

client.on('qr', async qr => {
    console.log(qr)
    // Menghasilkan gambar QR Code dalam format Data URL
    qrCodeImageUrl = await qrcode.toDataURL(qr);
    console.log('QR Code siap, akses di http://localhost:3000/qrcode');

    // console.log(qr);
});

client.on('authenticated', () => {
    console.log('Client is authenticated!');
});

client.on('auth_failure', () => {
    console.log('Client is auth_failure!');
});


client.on('ready', async msg => {
    console.log('Client is ready!');
});

const onConv = new Set()
const csSession = new Set()

client.on('message', async msg => {

    const text = msg._data.body;

    console.log(msg);

    //  bot/{desimal}/{angka 1-10000}/{angka 1-10}
    const regexBot = /^bot\/\d+\/\d+\/\d+(\/.*)?$/;

    const message_from = msg._data.from;
    const cmd = message_from.split("@");
    const message_to = msg._data.to;
    const cmd1 = message_to.split("@");
    const chat = await msg.getChat();

    let phoneNumber = cmd[0];
    let shopNumber = cmd1[0];

    if(phoneNumber === "status" | msg._data.type != "chat"){
        return
    }

    const claim_template = "Halo, saya ingin klaim akun dengan kode transaksi"
    const get_uuid = text.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);

    if(text.includes(claim_template) && get_uuid){
        const claim_code = get_uuid[0]

        const data_cred = await postData("https://devgoldendigital.my.id/api/transactions/claim_code", {transaction_code:claim_code})
        // const data_cred = await postData("http://127.0.0.1:8000/api/transactions/claim_code", {transaction_code:claim_code})
        console.log(data_cred);
        if(data_cred.message){
            chat.sendMessage(`data tidak ditemukan dengan kode tersebut.`)
            return
        }

        const email = data_cred.email
        const password = data_cred.password
        const profile = data_cred.profile
        const pin = data_cred.pin
        const template = data_cred.template

        const pesan = `Terima kasih telah bertransaksi melalui Golden Digital. Berikut data credential anda:\n- email : ${email}\n- password : ${password}\n- profile : ${profile}\n- pin : ${pin}\n\n${template}`



        await chat.sendMessage(pesan)
        await chat.sendMessage("Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih");
        // Check if the session object for the shopNumber and custNumber exists
        if (!Object.prototype.hasOwnProperty.call(session, shopNumber)) {
            session[shopNumber] = {};
        }

        if (!Object.prototype.hasOwnProperty.call(session[shopNumber], phoneNumber)) {
            session[shopNumber][phoneNumber] = {
                question_id: 0,
                question: "",
                answer: "",
                number: phoneNumber,
                answer_option: "0",
                option: [],
                media_type: "", 
                media_path: "",
                name: "",
                upgrade:"",
                variant: "",
                produk_id: "",
                produk_name: "",
                produk_code: "",
                price: "",
                updated_at: new Date(),
                created_at: new Date(),
            };
        }    
        session[shopNumber][phoneNumber].question_id = "99"
        session[shopNumber][phoneNumber].question = "Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih"
        session[shopNumber][phoneNumber].answer_option = "option"
        session[shopNumber][phoneNumber].option = ["2"]
        return
    }

    const chat_ts = msg._data.t * 1000
    const currentTimestamp = Date.now(); // Timestamp saat ini
    // Hitung selisih waktu dalam milidetik
    const diff = currentTimestamp - chat_ts;

    if(diff > 60*1000){
        console.log("diff", diff);
        return
    }

    // Check if the session object for the shopNumber and custNumber exists
    if (!Object.prototype.hasOwnProperty.call(session, shopNumber)) {
        session[shopNumber] = {};
    }

    if(Object.prototype.hasOwnProperty.call(session[shopNumber], phoneNumber)){
        if(csSession.has(phoneNumber) ){
            if(text === "pl"){
                delete session[shopNumber][phoneNumber]
                csSession.delete(phoneNumber)
            }else{
                return
            }
        }else if(session[shopNumber][phoneNumber].question_id === "16" && text === "1"){
            csSession.add(phoneNumber)

            chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")

            return
        }else if(session[shopNumber][phoneNumber].question_id === "99" && text === "1"){
            csSession.add(phoneNumber)

            chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")

            return
        }else if(session[shopNumber][phoneNumber].question_id === "99" && text === "3"){
            delete session[shopNumber][phoneNumber]

            const textEnd = `Terima kasih telah menggunakan layanan kami, ditunggu orderan lainnya:)\n\nKami menyediakan berbagai akun premium lainnya dan terdapat banyak promo menarik yang dapat diakses pada: https://www.goldendigital.web.id/ \n\nSalam Hangat, Golden Digital:`

            chat.sendMessage(textEnd)

            return
        }
    }

    const listNumber = ["628977548890"]

    if(listNumber.includes(phoneNumber)){
        if (!onConv.has(phoneNumber)){
            onConv.add(phoneNumber)
            await handleMessages(msg)
            onConv.delete(phoneNumber)
        }
        
    }else{
        return "Customer Is Blocked"
    }
    // if (!onConv.has(phoneNumber)){
    //     onConv.add(phoneNumber)
    //     await handleMessages(msg)
    //     onConv.delete(phoneNumber)
    // }
    

});

// API untuk mengirim pesan
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: 'Nomor dan pesan harus diisi!' });
    }

    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

    try {
        await client.sendMessage(formattedNumber, message);
        res.json({ success: true, message: 'Pesan berhasil dikirim!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API untuk mengirim pesan Succes Transaksi
app.post('/send-message-success', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: 'Nomor dan pesan harus diisi!' });
    }

    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

    try {
        await client.sendMessage(formattedNumber, message);
        await client.sendMessage(formattedNumber, "Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih");
        if (!Object.prototype.hasOwnProperty.call(session, phoneNumber)) {
            session[number] = {
                question_id: 0,
                question: "",
                answer: "",
                number: number,
                answer_option: "0",
                option: [],
                media_type: "", 
                media_path: "",
                name: "",
                upgrade:"",
                variant: "",
                produk_id: "",
                produk_name: "",
                produk_code: "",
                price: "",
                updated_at: new Date(),
                created_at: new Date(),
            };
        }
        session[number].question_id = "99"
        session[number].question = "Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih"
        session[number].answer_option = "option"
        session[number].option = ["2"]
        res.json({ success: true, message: 'Pesan berhasil dikirim!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/qrcode', (req, res) => {
    if (qrCodeImageUrl) {
        res.send(`<img src="${qrCodeImageUrl}" alt="QR Code" />`);
    } else {
        res.send('QR Code belum tersedia. Tunggu sebentar...');
    }
});

cron.schedule('* * * * *', () => {
    console.log('Cron job berjalan setiap menit');
    const treshHold = Date.now() - 60 * 60 * 1000;
    // Iterasi melalui session dan hapus key yang updated_at > 1 jam
    
    for (const keys in session) {
        for(const key in session[keys]){
            console.log(key);
            console.log(treshHold);
            if (session[keys][key].updated_at < treshHold) {
                console.log(`Menghapus session: ${key}`);
                delete session[keys][key];
            }
        }
    }


    // Tambahkan fungsi yang ingin dijalankan di sini
});

// Jalankan server Express
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

client.initialize();
