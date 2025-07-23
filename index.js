const qrcode = require('qrcode'); // Menggunakan qrcode untuk gambar
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const session = require('./features/session');
const { handleMessages } = require('./features/handle_messages');
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data'); // ini dari package npm 'form-data'
const { convert } = require('html-to-text');



const app = express();
const port = 3001;

// Middleware untuk parsing JSON
app.use(express.json());

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, 5000));
}

function generateCustomId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function cekFormat16(text) {
  
  return text.startsWith("16");
}

function cekFormatCS(teks) {
  const regex = /PRODUK YANG DI BELI\s*:\s*.+\s+(?:VARIAN.*\s+)?EMAIL AKUN PRODUK\s*:\s*.+/i;
  return regex.test(teks);
}

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

async function postData(url, body) {
    try {
        const response = await axios.post(url, body);
        return response.data;
    } catch (error) {
        console.error("Error posting data: -----------------------------------------------------------------------", error);
        return null;
    }
}

const clients = {};
const qrCodes = {};
const lastChat = {};

const onConv = new Set()
const csSession = new Set()

function isClaimFormatValid(teks) {
  const lines = teks.trim().split(/\r?\n/).map(line => line.trim());

  // Cari indeks baris yang berisi "Halo,"
  const haloIndex = lines.findIndex(line => line.toLowerCase() === "halo,");
  
  if (haloIndex === -1 || lines.length < haloIndex + 6) {
    return false;
  }

  const formLines = lines.slice(haloIndex, haloIndex + 6);

  return (
    formLines[0].toLowerCase() === "halo," &&
    formLines[1].toLowerCase().startsWith("nama") &&
    formLines[2].toLowerCase().startsWith("email") &&
    formLines[3].toLowerCase().includes("ingin klaim akun pembelian") &&
    formLines[4].toLowerCase().startsWith("nama shopee") &&
    formLines[5].toLowerCase().startsWith("kode") &&
    formLines[5].toLowerCase().includes("admin")
  );
}

function formatNetflixText(rawHtml) {
  const text = convert(rawHtml, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'p', format: 'paragraph' },
      { selector: 'br', format: 'lineBreak' }
    ]
  });

  return text.trim();
}



function createClient(clientId) {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }

    });

    client.on('qr', async (qr) => {
        const qrImage = await qrcode.toDataURL(qr);
        qrCodes[clientId] = qrImage;
        console.log(`QR untuk ${clientId} tersedia di /qrcode/${clientId}`);
    });

    client.on('ready', () => {
        console.log(`Client ${clientId} is ready!`);
    });

    client.on('authenticated', () => {
        console.log(`Client ${clientId} authenticated`);
    });

    client.on('auth_failure', () => {
        console.log(`Client ${clientId} authentication failed`);
    });

    // ✅ Tangani pesan masuk
    client.on('message', async msg => {
        const text = msg._data.body;
    
        console.log(msg);

        //  bot/{desimal}/{angka 1-10000}/{angka 1-10}
        const regexBot = /^bot\/\d+\/\d+\/\d+(\/.*)?$/;

        console.log(1);
        
        const message_from = msg._data.from;
        const cmd = message_from.split("@");
        const message_to = msg._data.to;
        const cmd1 = message_to.split("@");
        const chat = await msg.getChat();
        
        console.log(2);
        let phoneNumber = cmd[0];
        let shopNumber = cmd1[0];

        if (!Object.prototype.hasOwnProperty.call(lastChat, shopNumber)) {
            lastChat[shopNumber] = {};
        }
        lastChat[shopNumber][phoneNumber] = new Date()
        const listNumber = ["6282245083753"]

        if(!listNumber.includes(phoneNumber)){
            return
        }
        
        if(phoneNumber === "status"){
            return
        }
        console.log(3);

        try{
            if(isClaimFormatValid(text)) {

                // const namaMatch = text.match(/nama\s*:\s*(\w+)/i);
                // const emailMatch = text.match(/email\s*:\s*([\w.-]+@[\w.-]+\.\w+)/i);
                // const kodeMatch = text.match(/kode\s+dari\s+admin\s*:\s*(.+)/i);
                const namaMatch = text.match(/nama\s*:\s*([^\n(]+)/i);
                const emailMatch = text.match(/email\s*:\s*([^\n(]+)/i);
                const kodeMatch = text.match(/kode\s+dari\s+admin\s*:\s*([^\n(]+)/i);
                
                // Jika salah satu tidak ditemukan, return null
                if (!namaMatch || !emailMatch || !kodeMatch) {
                    await sleep(10000)
                    chat.sendMessage(`Mohon isi nama, email, dan kode dari admin agar bisa melakukan klaim akun.`)
                    return 
                }else{
                    const kodeAkunClaim = kodeMatch[1].trim();
                    const emailClaim = emailMatch[1].trim();
                    const namaClaim = namaMatch[1].trim();

                    const data_cred = await postData("https://devgoldendigital.my.id/api/transactions/claim_account_code", {account_code:kodeAkunClaim})
                    console.log(data_cred);
                    if(data_cred.matching_account.length === 0){
                        await sleep(10000)
                        chat.sendMessage(`Transaksi masih dalam proses, mohon ditunggu.`)
                        return
                    }else{
                        const bodyClaimShopee = {
                            "id_produk": data_cred.matching_account[0].id_produk,
                            "nama_customer": namaClaim,
                            "email_customer": emailClaim,
                            "wa": phoneNumber
                        }
                        const data_cred_2 = await postData("https://devgoldendigital.my.id/api/shopee-claims", bodyClaimShopee)

                        if(data_cred_2===null){
                            await sleep(10000)
                            chat.sendMessage(`Mohon isi nama, email, dan kode dari admin agar bisa melakukan klaim akun.`)
                            return 
                        }

                        // const data_cred = await postData("http://
                        const pesan = data_cred.matching_account[0].template
                        await sleep(10000)
                        await chat.sendMessage(formatNetflixText(pesan))
                        await chat.sendMessage("MOHON KONFIRMASI PENGIRIMAN SETELAH 24 JAM DAN ULASAN PRODUK BINTANG 5 UNTUK SYARAT FULLGARANSI!\nApakah terdapat kendala? (CUKUP KETIK ANGKA UNTUK MELANJUTKAN)\n\n1. Ya\n2. Tidak, Kembali ke Menu Utama");
                        
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
                        session[shopNumber][phoneNumber].question = "MOHON KONFIRMASI PENGIRIMAN SETELAH 24 JAM DAN ULASAN PRODUK BINTANG 5 UNTUK SYARAT FULLGARANSI!\nApakah terdapat kendala? (CUKUP KETIK ANGKA UNTUK MELANJUTKAN)\n\n1. Ya\n2. Tidak, Kembali ke Menu Utama"
                        session[shopNumber][phoneNumber].answer_option = "option"
                        session[shopNumber][phoneNumber].option = ["1","2"]
                        return
                    }
                }
            }
        }catch(e){
            console.log("Error parsing claim format: ", e);
            
        }
        
        

        const claim_template = "Halo, saya ingin klaim akun dengan kode transaksi"
        try{

            if(text.includes(claim_template)){
                const get_uuid = text.match(/kode transaksi\s+(\S+)/i)
                const claim_code = get_uuid[1].trim()
    
                const data_cred = await postData("https://devgoldendigital.my.id/api/transactions/claim_transaction_code", {transaction_code:claim_code})
                // const data_cred = await postData("http://127.0.0.1:8000/api/transactions/claim_code", {transaction_code:claim_code})
                // console.log(data_cred);
                if(data_cred === null){
                    await sleep(10000)
                    chat.sendMessage(`Transaksi masih dalam proses, mohon ditunggu.`)
                    return
                }
    
           
                const template = data_cred.template
    
                const pesan = template
    
    
                await sleep(10000)
                await chat.sendMessage(formatNetflixText(pesan))
                await chat.sendMessage("Apakah terdapat kendala? (CUKUP KETIK ANGKA UNTUK MELANJUTKAN)\n\n1. Ya\n2. Tidak, Kembali ke Menu Utama");
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
                session[shopNumber][phoneNumber].question = "Apakah terdapat kendala? (CUKUP KETIK ANGKA UNTUK MELANJUTKAN)\n\n1. Ya\n2. Tidak, Kembali ke Menu Utama"
                session[shopNumber][phoneNumber].answer_option = "option"
                session[shopNumber][phoneNumber].option = ["1","2"]
                return
            }
        }catch(e){}

        if (!Object.prototype.hasOwnProperty.call(session, shopNumber)) {
            session[shopNumber] = {};
        }
        
        if (Object.prototype.hasOwnProperty.call(session[shopNumber], phoneNumber)) {
            console.log(4);
            // console.log(session[shopNumber][phoneNumber].question_id +"  ------------------------------------------"+text.toLowerCase());
            // console.log(session[shopNumber][phoneNumber].question_id === "6");
            
            if(session[shopNumber][phoneNumber].question_id === "6"){

                // console.log("masuksini ++++++++++++++++++++++++++++++++++++++++++++++++++");
                // if(text.toLowerCase() != "tes masook"){
                //     console.log("masuksini ++++++++++++++++++++++++++++++++++++++++++++++++++");
                    
                //     await chat.sendMessage("MOHON KIRIMKAN BUKTI TRANSFER ANDA")
                //     return
                // }

                if (msg.hasMedia) {

                    console.log("have media 1 -----------------------------------------------------");
                    const media = await msg.downloadMedia();
                    console.log("have media 2 -----------------------------------------------------");
                    

                    const extension = media.mimetype.split('/')[1];
                    const folderPath = path.join(__dirname, 'assets', 'bukti');

                    // Buat folder 'assets/bukti' jika belum ada
                    if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, { recursive: true });
                    }

                    const fileName = `bukti_${Date.now()}.${extension}`;
                    const filePath = path.join(folderPath, fileName);

                    // Simpan file base64 ke folder assets/bukti
                    fs.writeFileSync(filePath, media.data, 'base64');
                    console.log(`File tersimpan di: ${filePath}`);

                    const transaction_code = generateCustomId();

                    // Kalau mau lanjut upload ke API dengan form-data
                    const form = new FormData();
                    form.append('external_id', session[shopNumber][phoneNumber].produk_code);
                    form.append('amount', session[shopNumber][phoneNumber].price);
                    form.append('id_price', session[shopNumber][phoneNumber].produk_id);
                    form.append('id_customer', 0);
                    form.append('id_promo', 0);
                    form.append('customer_name', session[shopNumber][phoneNumber].name);
                    form.append('email_customer', session[shopNumber][phoneNumber].email);
                    form.append('id_payment', session[shopNumber][phoneNumber].id_payment);
                    form.append('phone_customer', phoneNumber);
                    form.append('transaction_code', transaction_code);
                    form.append('payment_status', "PENDING");
                    form.append('payment_method', "QRIS");
                    form.append('claim_point', 'false');
                    form.append('image_path', fs.createReadStream(filePath));

                    

                    try {
                        const response = await axios.post('https://devgoldendigital.my.id/api/create-invoice', form,{
                            headers: {
                                ...form.getHeaders(),
                            }
                        });
                        console.log('Upload sukses:', response.data.invoice.transaction_code);
                        await msg.reply(`Transaksi anda berhasil dibuat, mohon kirim kembali format chat dibawah ini:\n\n Halo, saya ingin klaim akun dengan kode transaksi ${response.data.invoice.transaction_code} \n\n format chat tersebut dikirim per menit hingga Anda mendapatkan akun Anda`);
                        return
                    } catch (error) {
                        console.error('Upload gagal:', error.message);
                        await msg.reply('Gagal mengirim gambar ke server.');
                    }
                }else{
                    await sleep(10000)
                    await chat.sendMessage("MOHON KIRIMKAN BUKTI TRANSFER ANDA")
                    return
                }
                
            }
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
                if(text.toLowerCase() === "kembali ke menu utama"){
                    delete session[shopNumber][phoneNumber]
                    csSession.delete(phoneNumber)
                }else{
                    return
                }
            }else if(cekFormat16(session[shopNumber][phoneNumber].question_id)){
                if(text.toLowerCase() === "mau upgrade"){
                    await sleep(10000)
                    await chat.sendMessage("1. Pembelian by Whatsapp/Website\n2. Pembelian by Shopee/Sumber Lain\n\n0. Kembali ke Menu Utama");
                    session[shopNumber][phoneNumber].question_id = "22"
                    session[shopNumber][phoneNumber].question = "1. Pembelian by Whatsapp/Website\n2. Pembelian by Shopee/Sumber Lain\n\n0. Kembali ke Menu Utama"
                    session[shopNumber][phoneNumber].answer_option = "option"
                    session[shopNumber][phoneNumber].option = ["1","2","0"]
                    return
                }else if(text.toLowerCase() === "hubungi cs"){
                    csSession.add(phoneNumber)
                    await sleep(10000)
                    chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")
                    return
                }

            }else if(session[shopNumber][phoneNumber].question_id === "23"){
                if(isValidEmail(text)){                    
                    csSession.add(phoneNumber)
                    await sleep(10000)
                    chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")
                }else{
                    await sleep(10000)
                    chat.sendMessage("Mohon masukan format email yang benar.")
                }

                return
            // }else if(session[shopNumber][phoneNumber].question_id === "99" && text === "1"){
            //     csSession.add(phoneNumber)
            //     await sleep(10000)
            //     chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")

            //     return
            // }else if(session[shopNumber][phoneNumber].question_id === "99" && text === "3"){
            //     delete session[shopNumber][phoneNumber]

            //     const textEnd = `Terima kasih telah menggunakan layanan kami, ditunggu orderan lainnya:)\n\nKami menyediakan berbagai akun premium lainnya dan terdapat banyak promo menarik yang dapat diakses pada: https://temangabutmu.com/ \n\nSalam Hangat, Golden Digital:`
            //     await sleep(10000)
            //     chat.sendMessage(textEnd)

            //     return
            }
        }

        

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

    client.initialize();
    clients[clientId] = client;
}

const authFolder = path.join(__dirname, '.wwebjs_auth');

// Auto-connect semua client yang sudah punya folder
function autoLoadClients() {
    if (!fs.existsSync(authFolder)) return;

    const clientIds = fs.readdirSync(authFolder).filter(name =>
        fs.statSync(path.join(authFolder, name)).isDirectory()
    );

    clientIds.forEach(clientId => {
        console.log(`Auto-loading client: ${clientId.split("-")[1]}`);
        createClient(clientId.split("-")[1]);
    });
}

autoLoadClients(); // panggil saat server start


app.get('/qrcode/:clientId', (req, res) => {
    const clientId = req.params.clientId;

    // Cek apakah client sudah ada
    if (!clients[clientId]) {
        createClient(clientId); // Buat client baru jika belum ada
        return res.send(`Membuat client baru untuk ${clientId}, tunggu QR code... <br> Silakan refresh halaman ini sebentar lagi.`);
    }

    // QR code tersedia?
    if (qrCodes[clientId]) {
        res.send(`<h3>QR Code untuk ${clientId}</h3><img src="${qrCodes[clientId]}" alt="QR Code" />`);
    } else {
        res.send(`QR Code untuk ${clientId} belum tersedia. Silakan tunggu dan refresh.`);
    }
});

app.listen(port, () => {
    console.log(`Server jalan di http://localhost:${port}`);
});


// Post data to an API


// const client = new Client({
//     authStrategy: new LocalAuth()
// });

// let qrCodeImageUrl = ''; // Variabel untuk menyimpan URL gambar QR Code

// client.on('qr', async qr => {
//     console.log(qr)
//     // Menghasilkan gambar QR Code dalam format Data URL
//     qrCodeImageUrl = await qrcode.toDataURL(qr);
//     console.log('QR Code siap, akses di http://localhost:3000/qrcode');

//     // console.log(qr);
// });

// client.on('authenticated', () => {
//     console.log('Client is authenticated!');
// });

// client.on('auth_failure', () => {
//     console.log('Client is auth_failure!');
// });


// client.on('ready', async msg => {
//     console.log('Client is ready!');
// });



// client.on('message', async msg => {

//     const text = msg._data.body;
    
//     console.log(msg);

//     //  bot/{desimal}/{angka 1-10000}/{angka 1-10}
//     const regexBot = /^bot\/\d+\/\d+\/\d+(\/.*)?$/;

//     console.log(1);
    
//     const message_from = msg._data.from;
//     const cmd = message_from.split("@");
//     const message_to = msg._data.to;
//     const cmd1 = message_to.split("@");
//     const chat = await msg.getChat();
    
//     console.log(2);
//     let phoneNumber = cmd[0];
//     let shopNumber = cmd1[0];
    
//     if(phoneNumber === "status"){
//         return
//     }
//     console.log(3);
    
    
    

//     const claim_template = "Halo, saya ingin klaim akun dengan kode transaksi"
//     const get_uuid = text.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);

//     if(text.includes(claim_template) && get_uuid){
//         const claim_code = get_uuid[0]

//         const data_cred = await postData("https://devgoldendigital.my.id/api/transactions/claim_code", {transaction_code:claim_code})
//         // const data_cred = await postData("http://127.0.0.1:8000/api/transactions/claim_code", {transaction_code:claim_code})
//         console.log(data_cred);
//         if(data_cred.message){
//             chat.sendMessage(`Transaksi masih dalam proses, mohon ditunggu.`)
//             return
//         }

//         const email = data_cred.email
//         const password = data_cred.password
//         const profile = data_cred.profile
//         const pin = data_cred.pin
//         const template = data_cred.template

//         const pesan = `Terima kasih telah bertransaksi melalui Golden Digital. Berikut data credential anda:\n- email : ${email}\n- password : ${password}\n- profile : ${profile}\n- pin : ${pin}\n\n${template}`



//         await chat.sendMessage(pesan)
//         await chat.sendMessage("Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih");
//         // Check if the session object for the shopNumber and custNumber exists
//         if (!Object.prototype.hasOwnProperty.call(session, shopNumber)) {
//             session[shopNumber] = {};
//         }

//         if (!Object.prototype.hasOwnProperty.call(session[shopNumber], phoneNumber)) {
//             session[shopNumber][phoneNumber] = {
//                 question_id: 0,
//                 question: "",
//                 answer: "",
//                 number: phoneNumber,
//                 answer_option: "0",
//                 option: [],
//                 media_type: "", 
//                 media_path: "",
//                 name: "",
//                 upgrade:"",
//                 variant: "",
//                 produk_id: "",
//                 produk_name: "",
//                 produk_code: "",
//                 price: "",
//                 updated_at: new Date(),
//                 created_at: new Date(),
//             };
//         }    
//         session[shopNumber][phoneNumber].question_id = "99"
//         session[shopNumber][phoneNumber].question = "Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih"
//         session[shopNumber][phoneNumber].answer_option = "option"
//         session[shopNumber][phoneNumber].option = ["2"]
//         return
//     }

//     if (!Object.prototype.hasOwnProperty.call(session, shopNumber)) {
//         session[shopNumber] = {};
//     }
    
//     if (Object.prototype.hasOwnProperty.call(session[shopNumber], phoneNumber)) {
//         console.log(4);
//         // console.log(session[shopNumber][phoneNumber].question_id +"  ------------------------------------------"+text.toLowerCase());
//         // console.log(session[shopNumber][phoneNumber].question_id === "6");
        
//         if(session[shopNumber][phoneNumber].question_id === "6"){

//             // console.log("masuksini ++++++++++++++++++++++++++++++++++++++++++++++++++");
//             // if(text.toLowerCase() != "tes masook"){
//             //     console.log("masuksini ++++++++++++++++++++++++++++++++++++++++++++++++++");
                
//             //     await chat.sendMessage("MOHON KIRIMKAN BUKTI TRANSFER ANDA")
//             //     return
//             // }

//             if (msg.hasMedia) {

//                 console.log("have media 1 -----------------------------------------------------");
//                 const media = await msg.downloadMedia();
//                 console.log("have media 2 -----------------------------------------------------");
                

//                 const extension = media.mimetype.split('/')[1];
//                 const folderPath = path.join(__dirname, 'assets', 'bukti');

//                 // Buat folder 'assets/bukti' jika belum ada
//                 if (!fs.existsSync(folderPath)) {
//                     fs.mkdirSync(folderPath, { recursive: true });
//                 }

//                 const fileName = `bukti_${Date.now()}.${extension}`;
//                 const filePath = path.join(folderPath, fileName);

//                 // Simpan file base64 ke folder assets/bukti
//                 fs.writeFileSync(filePath, media.data, 'base64');
//                 console.log(`File tersimpan di: ${filePath}`);

//                 const transaction_code = uuidv4();

//                 // Kalau mau lanjut upload ke API dengan form-data
//                 const form = new FormData();
//                 form.append('external_id', session[shopNumber][phoneNumber].produk_code);
//                 form.append('amount', session[shopNumber][phoneNumber].price);
//                 form.append('id_price', session[shopNumber][phoneNumber].produk_id);
//                 form.append('id_customer', 0);
//                 form.append('id_promo', 0);
//                 form.append('customer_name', session[shopNumber][phoneNumber].name);
//                 form.append('email_customer', session[shopNumber][phoneNumber].email);
//                 form.append('phone_customer', phoneNumber);
//                 form.append('transaction_code', transaction_code);
//                 form.append('payment_status', "PENDING");
//                 form.append('payment_method', "QRIS");
//                 form.append('claim_point', 'false');
//                 form.append('image_path', fs.createReadStream(filePath));

//                 try {
//                     const response = await axios.post('https://devgoldendigital.my.id/api/create-invoice', form,{
//                         headers: {
//                             ...form.getHeaders(),
//                         }
//                     });
//                     console.log('Upload sukses:', response.data.invoice.transaction_code);
//                     await msg.reply(`Transaksi anda berhasil dibuat, mohon kirim kembali format chat dibawah ini:\n\n Halo, saya ingin klaim akun dengan kode transaksi ${response.data.invoice.transaction_code} \n\n format chat tersebut dikirim per menit hingga Anda mendapatkan akun Anda`);
//                     return
//                 } catch (error) {
//                     console.error('Upload gagal:', error.message);
//                     await msg.reply('Gagal mengirim gambar ke server.');
//                 }
//             }else{
//                 await chat.sendMessage("MOHON KIRIMKAN BUKTI TRANSFER ANDA")
//                 return
//             }
            
//         }
//     }

//     const chat_ts = msg._data.t * 1000
//     const currentTimestamp = Date.now(); // Timestamp saat ini
//     // Hitung selisih waktu dalam milidetik
//     const diff = currentTimestamp - chat_ts;

//     if(diff > 60*1000){
//         console.log("diff", diff);
//         return
//     }

//     // Check if the session object for the shopNumber and custNumber exists
//     if (!Object.prototype.hasOwnProperty.call(session, shopNumber)) {
//         session[shopNumber] = {};
//     }

//     if(Object.prototype.hasOwnProperty.call(session[shopNumber], phoneNumber)){
//         if(csSession.has(phoneNumber) ){
//             if(text === "pl"){
//                 delete session[shopNumber][phoneNumber]
//                 csSession.delete(phoneNumber)
//             }else{
//                 return
//             }
//         }else if(session[shopNumber][phoneNumber].question_id === "16" && text === "1"){
//             csSession.add(phoneNumber)

//             chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")

//             return
//         }else if(session[shopNumber][phoneNumber].question_id === "99" && text === "1"){
//             csSession.add(phoneNumber)

//             chat.sendMessage("Baik, sedang disambungkan ke CS, mohon ditunggu.")

//             return
//         }else if(session[shopNumber][phoneNumber].question_id === "99" && text === "3"){
//             delete session[shopNumber][phoneNumber]

//             const textEnd = `Terima kasih telah menggunakan layanan kami, ditunggu orderan lainnya:)\n\nKami menyediakan berbagai akun premium lainnya dan terdapat banyak promo menarik yang dapat diakses pada: https://temangabutmu.com/ \n\nSalam Hangat, Golden Digital:`

//             chat.sendMessage(textEnd)

//             return
//         }
//     }

//     const listNumber = ["6281215964125"]

//     if(listNumber.includes(phoneNumber)){
//         if (!onConv.has(phoneNumber)){
//             onConv.add(phoneNumber)
//             await handleMessages(msg)
//             onConv.delete(phoneNumber)
//         }
        
//     }else{
//         return "Customer Is Blocked"
//     }
//     // if (!onConv.has(phoneNumber)){
//     //     onConv.add(phoneNumber)
//     //     await handleMessages(msg)
//     //     onConv.delete(phoneNumber)
//     // }
    

// });

// // API untuk mengirim pesan
// app.post('/send-message', async (req, res) => {
//     const { number, message } = req.body;

//     if (!number || !message) {
//         return res.status(400).json({ error: 'Nomor dan pesan harus diisi!' });
//     }

//     const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

//     try {
//         await client.sendMessage(formattedNumber, message);
//         res.json({ success: true, message: 'Pesan berhasil dikirim!' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // API untuk mengirim pesan Succes Transaksi
// app.post('/send-message-success', async (req, res) => {
//     const { number, message } = req.body;

//     if (!number || !message) {
//         return res.status(400).json({ error: 'Nomor dan pesan harus diisi!' });
//     }

//     const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

//     try {
//         await client.sendMessage(formattedNumber, message);
//         await client.sendMessage(formattedNumber, "Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih");
//         if (!Object.prototype.hasOwnProperty.call(session, phoneNumber)) {
//             session[number] = {
//                 question_id: 0,
//                 question: "",
//                 answer: "",
//                 number: number,
//                 answer_option: "0",
//                 option: [],
//                 media_type: "", 
//                 media_path: "",
//                 name: "",
//                 upgrade:"",
//                 variant: "",
//                 produk_id: "",
//                 produk_name: "",
//                 produk_code: "",
//                 price: "",
//                 updated_at: new Date(),
//                 created_at: new Date(),
//             };
//         }
//         session[number].question_id = "99"
//         session[number].question = "Baik Kak, apakah ada yang dapat saya bantu lagi?\n1. Berbicara dengan Customer Service\n2. Kembali ke Menu Utama\n3. Tidak terima kasih"
//         session[number].answer_option = "option"
//         session[number].option = ["2"]
//         res.json({ success: true, message: 'Pesan berhasil dikirim!' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// app.get('/qrcode', (req, res) => {
//     if (qrCodeImageUrl) {
//         res.send(`<img src="${qrCodeImageUrl}" alt="QR Code" />`);
//     } else {
//         res.send('QR Code belum tersedia. Tunggu sebentar...');
//     }
// });

cron.schedule('* * * * *', () => {
    console.log('Cron job berjalan setiap menit');
    const treshHold = Date.now() - 5 * 60 * 1000;
    // Iterasi melalui session dan hapus key yang updated_at > 1 jam
    
    for (const keys in session) {
        for(const key in session[keys]){
            console.log(key);
            console.log(treshHold);
            if (lastChat[keys][key] < treshHold) {
                console.log(`Menghapus session: ${key}`);
                delete session[keys][key];
                onConv.delete(key)
                csSession.delete(key)
            }
        }
    }


    // Tambahkan fungsi yang ingin dijalankan di sini
});

// Jalankan server Express
// app.listen(port, () => {
//     console.log(`Server berjalan di http://localhost:${port}`);
// });

// client.initialize();
