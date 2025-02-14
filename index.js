const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const session = require('./features/session');
const { handleMessages } = require('./features/handle_messages');
const express = require('express');
const axios = require('axios');

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

client.on('qr', qr => {
    console.log(qr)
    qrcode.generate(qr, { small: true });

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

    // Number where you want to send the message.
    // const number = "+6281216913886";

    // // // Your message.
    // const text = "Hey john";

    // // Getting chatId from the number.
    // // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
    // const chatId = number.substring(1) + "@c.us";

    // // Sending message.
    // client.sendMessage(chatId, text);
    // const number = "+6281216913886";

    // // // Your message.
    // // Your message.
    // const messageText = "Oii";

    // // Getting chatId from the number.
    // // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
    // const chatId = number.substring(1) + "@c.us";

    // // Function to send a message
    // const sendMessage = () => {
    //     client.sendMessage(chatId, messageText);
    // };

    // // Set an interval to send the message every 5 seconds (5000 milliseconds)
    // const intervalId = setInterval(sendMessage, 1000);

    // // Stop the interval after a certain number of iterations (e.g., 20 times)
    // // This prevents the loop from running indefinitely
    // let iterations = 0;
    // const maxIterations = 10;

    // const stopInterval = () => {
    //     clearInterval(intervalId);
    // };

    // // Set a timeout to stop the interval after a certain number of iterations
    // setTimeout(stopInterval, maxIterations * 1000);
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
    const chat = await msg.getChat();

    let phoneNumber = cmd[0];

    if(phoneNumber === "status"){
        return
    }

    const claim_template = "Halo, saya ingin klaim akun dengan kode transaksi"
    const get_uuid = text.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);

    if(text.includes(claim_template) && get_uuid){
        const claim_code = get_uuid[0]

        const data_cred = await postData("http://127.0.0.1:3000/api/transactions/claim_code", {transaction_code:claim_code})

        if(data_cred.message){
            chat.sendMessage(`data tidak ditemukan dengan kode tersebut.`)
            return
        }

        const email = data_cred.email
        const password = data_cred.password
        const profile = data_cred.profile
        const pin = data_cred.pin

        const pesan = `Terima kasih telah bertransaksi melalui Golden Digital. Berikut data credential anda:
        - email : ${email}
        - password : ${password}
        - profile : ${profile}
        - pin : ${pin}
        `



        chat.sendMessage(pesan)
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

    

    if(Object.prototype.hasOwnProperty.call(session, phoneNumber)){
        if(csSession.has(phoneNumber) ){
            if(text === "0"){
                delete session[phoneNumber]
                csSession.delete(phoneNumber)
            }else{
                return
            }
        }else if(session[phoneNumber].question_id === "16" && text === "1"){
            csSession.add(phoneNumber)

            chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")

            return
        }else if(session[phoneNumber].question_id === "99" && text === "1"){
            csSession.add(phoneNumber)

            chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")

            return
        }else if(session[phoneNumber].question_id === "99" && text === "3"){
            delete session[phoneNumber]

            const textEnd = `Terima kasih telah menggunakan layanan kami, ditunggu orderan
            lainnya:)

            Kami menyediakan berbagai akun premium lainnya dan terdapat banyak promo menarik yang dapat diakses pada: https://golden-digital.vercel.app/

            Salam Hangat, Golden Digital:`

            chat.sendMessage(textEnd)

            return
        }
    }

    if(phoneNumber === "6285183200149"){
        if (!onConv.has(phoneNumber)){
            onConv.add(phoneNumber)
            await handleMessages(msg)
            onConv.delete(phoneNumber)
        }
        
    }else{
        return "Customer Is Blocked"
    }

    

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
        session[number].question_id = "99"
        session[number].question = "Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih"
        session[number].answer_option = "option"
        session[number].option = ["2"]
        res.json({ success: true, message: 'Pesan berhasil dikirim!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Jalankan server Express
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

client.initialize();
