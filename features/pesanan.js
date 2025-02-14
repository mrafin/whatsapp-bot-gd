const axios = require("axios");
const { checkNumberHandler } = require("./cekNomor");
const { error } = require("qrcode-terminal");
require('dotenv').config();

const listOrder = async (text, msg) => {
    const chat = await msg.getChat();
    
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){
            let phoneNumber = phone_number;
            return chat.sendMessage(await listOrderRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const listOrderRequest = async (msg, phoneNumber) => {
    const result = {
        success: false,
        data: null,
        message: "",
        table: "",
    }

    // console.log('mbuhhhhhhhhhhhhhhhhhhhhhh')

    return await axios({
        method: "POST",
        url: `${process.env.BE_HOST}order/list-order`,
        data: {
            customer: phoneNumber
        },
    }).then((response) => {
        // console.log(response.data.data)
        // console.log(response.data);
        const dataOrder = response.data.data.order;
        // console.log(dataOrder[0] == null);
        // console.log(dataOrder)
        let dateOrder = dataOrder[0].created_at
        if(dataOrder[0].updated_at != null){
            dateOrder = dataOrder[0].updated_at
        }
        let total = 0;
        result.success = 'SUCCESS';
        result.table = `Tanggal : ${formatDateTime(dateOrder)}\n`;
        result.table += `ID ORDER : ${dataOrder[0].id_order}\n`
        result.table += "Nama Barang\tHarga\tQuantity\t\tDiskon\n";
        result.table += "---------------------------------------------------------\n";
        for (let i = 0; i < dataOrder.length; i++) {
            total += parseFloat(dataOrder[i].price)
            if(dataOrder[i].promo[0] == undefined){
                result.table += `${dataOrder[i].menu[0].name}\tRp.${dataOrder[i].menu[0].price}\t${dataOrder[i].quantity}\n`;
            }else{
                result.table += `${dataOrder[i].menu[0].name}\tRp.${dataOrder[i].menu[0].price}\t${dataOrder[i].quantity}\t${dataOrder[i].promo[0].discount}%\n`;
            }
        }
        result.table += "---------------------------------------------------------\n";
        result.table += `TOTAL : Rp.${total}\n\n`
        result.table += `Untuk Melakukan Pembayaran\n`;
        result.table += `bayar/{alamat}/{kode pos}\n\n`;
        result.table += `Untuk Menambah Pemesanan\n`;
        result.table += `pilih/{Nama Produk}/{jumlah Barang}\n\n`;
        result.table += `Untuk Merubah Pesanan\n`;
        result.table += `rubah/{Nama Produk}/{jumlah Barang}\n\n`;
        result.table += `Untuk Menghapus Pesanan\n`;
        result.table += `hapus/{Nama Produk}\n\n`;
        result.table += `Untuk Melakukan Pembayaran\n`;
        result.table += `bayar/{alamat}/{kode pos}\n\n`;
        result.table += `Contoh Penggunaan: \n`
        result.table += `pilih/sambal ijo/10\n`;
        result.table += `rubah/sambal ijo/10\n`;
        result.table += `hapus/sambal ijo\n`;
        result.table += `bayar/dharmahusada indah 18 surabaya/64920\n\n`;
        result.table += 'untuk melihat semua list perintah:\nhelp';
        
        return result.table;
    }).catch((error) => {
        console.log(error)
        result.table = `${error.response.data.meta.message}\n\n`
        result.table += `untuk melihat pesanan yang sudah dibayar\nriwayat\n\n`
        result.table += `untuk melihat pesanan yang sudah dibayar sesuai tannggal\nriwayat/{tanggal}-{bulan}-{tahun}\n\n`
        result.table += `contoh penggunaan:\nriwayat/12-03-2023`
        
        return result.table
        
    })
}

const orderHandler = async (text, msg) => {
    const chat = await msg.getChat();
    
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){
            let phoneNumber = phone_number;
            return chat.sendMessage(await orderRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const orderRequest = async (msg, phoneNumber) => {
    const body = msg._data.body;
    const cmd = body.split("/");

    const data = {
        product: cmd[1],
        quantity: cmd[2],
    }

    const result = {
        success: false,
        data: null,
        message: "",
        table: "",
    }

    return await axios({
        method: "POST",
        url: `${process.env.BE_HOST}order/store-order`,
        data: {
            product: data.product,
            quantity: data.quantity,
            customer: phoneNumber
        },
    }).then((response) => {
        // console.log(response.data.data.date_order)
        if(response.data.meta.status == 'failed'){
            return response.data.meta.message;
        }else{
            const dataOrder = response.data.data.order;
            // console.log(dataOrder);
            
            let total = 0;
            result.success = 'SUCCESS';
            result.table = `Tanggal : ${formatDateTime(response.data.data.date_order)}\n`;
            result.table += `ID ORDER : ${dataOrder[0].id_order}\n`
            result.table += "Nama Barang\tHarga\tQuantity\t\tDiskon\n";
            result.table += "---------------------------------------------------------\n";
            for (let i = 0; i < dataOrder.length; i++) {
                total += parseFloat(dataOrder[i].price)
                if(dataOrder[i].promo[0] == undefined){
                    result.table += `${dataOrder[i].menu[0].name}\tRp.${dataOrder[i].menu[0].price}\t${dataOrder[i].quantity}\n`;
                }else{
                    result.table += `${dataOrder[i].menu[0].name}\tRp.${dataOrder[i].menu[0].price}\t${dataOrder[i].quantity}\t${dataOrder[i].promo[0].discount}%\n`;
                }
            }
            result.table += "---------------------------------------------------------\n";
            result.table += `TOTAL : Rp.${total}\n\n`
            result.table += `Untuk Melakukan Pembayaran\n`;
            result.table += `bayar/{alamat}/{kode pos}\n\n`;
            result.table += `Untuk Menambah Pemesanan\n`;
            result.table += `pilih/{Nama Produk}/{jumlah Barang}\n\n`;
            result.table += `Untuk Merubah Pesanan\n`;
            result.table += `rubah/{Nama Produk}/{jumlah Barang}\n\n`;
            result.table += `Untuk Menghapus Pesanan\n`;
            result.table += `hapus/{Nama Produk}\n\n`;
            result.table += `Contoh Penggunaan: \n`
            result.table += `pilih/sambal ijo/10\n`;
            result.table += `rubah/sambal ijo/10\n`;
            result.table += `hapus/sambal ijo\n`;
            result.table += `bayar/dharmahusada indah 18 surabaya/64920\n\n`;
            result.table += 'untuk melihat semua list perintah:\nhelp';
            
            
            return result.table;
        }
    }).catch((error) => {
        console.log(error.response.data)
        
    })
}

const updateOrderHandler = async (text, msg) => {
    const chat = await msg.getChat();
    
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){

            let phoneNumber = phone_number;
            return chat.sendMessage(await updateOrderRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
        
    }
}

const updateOrderRequest = async (msg, phoneNumber) => {
    const body = msg._data.body;
    const cmd = body.split("/");

    const data = {
        product: cmd[1],
        quantity: cmd[2],
    }

    const result = {
        success: false,
        data: null,
        message: "",
        table: "",
    }

    return await axios({
        method: "POST",
        url: `${process.env.BE_HOST}order/update-order`,
        data: {
            product: data.product,
            quantity: data.quantity,
            customer: phoneNumber
        },
    }).then((response) => {
        // console.log(response.data.data.order);
        if(response.data.meta.status == 'failed'){
            return response.data.meta.message;
        }else{
            const dataOrder = response.data.data.order;
            // console.log(dataOrder);
            
            let total = 0;
            result.success = 'SUCCESS';
            result.table = `ID ORDER : ${dataOrder[0].id_order}\n`
            result.table += "Nama Barang\tHarga\tQuantity\t\tDiskon\n";
            result.table += "---------------------------------------------------------\n";
            for (let i = 0; i < dataOrder.length; i++) {
                total += parseFloat(dataOrder[i].price)
                if(dataOrder[i].promo[0] == undefined){
                    result.table += `${dataOrder[i].menu[0].name}\tRp.${dataOrder[i].menu[0].price}\t${dataOrder[i].quantity}\n`;
                }else{
                    result.table += `${dataOrder[i].menu[0].name}\tRp.${dataOrder[i].menu[0].price}\t${dataOrder[i].quantity}\t${dataOrder[i].promo[0].discount}%\n`;
                }
            }
            result.table += "---------------------------------------------------------\n";
            result.table += `TOTAL : Rp.${total}\n\n`
            result.table += `Untuk Melakukan Pembayaran\n`;
            result.table += `bayar/{alamat}/{kode pos}\n\n`;
            result.table += `Untuk Menambah Pemesanan\n`;
            result.table += `pilih/{Nama Produk}/{jumlah Barang}\n\n`;
            result.table += `Untuk Merubah Pesanan\n`;
            result.table += `rubah/{Nama Produk}/{jumlah Barang}\n\n`;
            result.table += `Untuk Menghapus Pesanan\n`;
            result.table += `Contoh Penggunaan: \n`
            result.table += `pilih/sambal ijo/10\n`;
            result.table += `rubah/sambal ijo/10\n`;
            result.table += `hapus/sambal ijo\n`;
            result.table += `bayar/dharmahusada indah 18 surabaya/64920\n\n`;
            result.table += 'untuk melihat semua list perintah:\nhelp';
            
            return result.table;
        }
    }).catch((error) => {
        console.log(error.response)
    })
}

const deteleOrderHandler = async (text, msg) => {
    const chat = await msg.getChat();
    
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){

            let phoneNumber = phone_number;
            return chat.sendMessage(await deleteOrderRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const deleteOrderRequest = async (msg, phoneNumber) => {
    const body = msg._data.body;
    const cmd = body.split("/");
    const product = cmd[1];

    const result = {
        status: false,
        message: "",
        data: "",
        table: "",
    }

    return await axios({
        method: "POST",
        url: `${process.env.BE_HOST}order/delete`,
        data: {
            customer: phoneNumber,
            product: product
        }
    }).then((response) => {
        result.status = "SUCCESS",
        // result.message = 
        result.data = response.data
        result.table = `Berhasil Menghapus ${product}\n\n`
        result.table += `Untuk Melihat Semua Pesanan\n`;
        result.table += `pesanan`;
        return result.table
    }).catch((error) => {
        console.log(error.response);
    })
}

const checkPaymentHandler = async (text, msg) => {
    const chat = await msg.getChat();
    
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){

            let phoneNumber = phone_number;
            return chat.sendMessage(await checkPaymentRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const checkPaymentRequest = async (msg, phoneNumber) => {
    
    const data = {
        phoneNumber: phoneNumber
    }

    const result = {
        success: false,
        data: null,
        message: "",
        table: "",
    }

    return await axios({
        method: 'POST',
        url: `${process.env.BE_HOST}order/checkout`,
        data: {
            customer: data.phoneNumber,
        }
    }).then((response) => {
        
        let data = response.data.data.data;
        console.log(data);
        
        // console.log(data[2])

        // result.success = 'SUCCESS';
        // result.table = 'METODE PEMBAYARAN\n'
        //     result.table += "--------------------------\n";
        //     for (let i = 0; i < data.length; i++) {
        //         result.table += `${data[i]}\n`;
        //     }
        //     result.table += "--------------------------\n";
        //     result.table += "Cara Memilih Metode pembayaran ex: /bayar/bni";
        //     // result.table += "Cara Checkout bayar/{metode pembayaran}/{virtual account}/{Alamat}/{Kode Pos}"

            
        //     return result.table;
    }).catch((error) => {
        console.log(error.response.data)
    })
}

const paymentCheckoutHandler = async (text, msg) => {
    const chat = await msg.getChat();
    
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){

            let phoneNumber = phone_number;
            return chat.sendMessage(await paymentCheckoutRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const paymentCheckoutRequest = async (msg, phoneNumber) => {
    const body = msg._data.body;
    const cmd = body.split("/");

    const data = {
        Address: cmd[1],
        zipCode: cmd[2],
        phoneNumber: phoneNumber
    }

    return await axios({
        method: 'POST',
        url: `${process.env.BE_HOST}order/checkout`,
        data: {
            customer: data.phoneNumber,
            address: data.Address,
            zip_code: data.zipCode
        }
    }).then((response) => {
        
        let data = response.data.data;
        console.log(data);
        let table = `Silahkan Melakukan Pembayaran Melalui link dibawah ini\n${data.link}\n\n`
        table += `untuk melihat pesanan yang berhasil dibayar:\n`
        table += `riwayat\n\n`
        table += `untuk melihat pesanan yang berhasil dibayar sesuai tanggal:\n`
        table += `riwayat/{tanggal}\n\n`
        table += `contoh penggunaan:\n`
        table += `riwayat\nriwayat/12-05-2023`
        return table
        // return `Silahkan Melakukan Pembayaran Melalui link dibawah ini\n${data.link}\n\nuntuk melihat semua list perintah:\nhelp`;
    }).catch((error) => {
        console.log(error.response.data.meta.message)
        let tabel = 'anda belum melakukan pemesanan, untuk melakukan pemesanan:\npilih/{nama barang}/{jumlah barang}\n\ncontoh penggunaan:\npilih/sambal ijo/10\n\nuntuk melihat semua list perintah:\nhelp';
        return tabel;
    })
}

function formatDateTime(inputDate) {
    const date = new Date(inputDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}`;

    return formattedDate;
}

const checkOrderStatusHandler = async (text, msg) => {
    const chat = await msg.getChat();
    
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){

            let phoneNumber = phone_number;
            return chat.sendMessage(await checkOrderStatusRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const checkOrderStatusRequest = async (msg, phoneNumber) => {
    const data = {
        phoneNumber: phoneNumber
    }

    const result = {
        table: "",
        status: false
    }

    return await axios({
        method: 'POST',
        url: `${process.env.BE_HOST}order/check-order-status`,
        data: {
            customer: data.phoneNumber
        }
    }).then((response) => {
        let dataOrder = response.data.data.data_order
        let dataDetail = response.data.data.data_detail
        result.status = true
        if (dataOrder.length === 0) {
            result.table = "Anda tidak memiliki pesanan.";
            return result.table;
        }
        result.table = `Anda memiliki ${dataOrder.length} pesanan.\n\n`;
        for (let i = 0; i < dataOrder.length; i++) {
            result.table += `Tanggal : ${formatDateTime(dataOrder[i].created_at)}\n`;
            result.table += `ID ORDER : ${dataOrder[i].id}\n`;
            result.table += `Nomor Resi: ${dataOrder[i].resi_number}\n`;
            result.table += "Nama Barang\tHarga\tQuantity\t\tDiskon\n";
            result.table += "---------------------------------------------------------\n";

            let total = 0;
            
            for (let j = 0; j < dataDetail.length; j++) {
                if (dataDetail[j].id_order === dataOrder[i].id) {
                    total += parseFloat(dataDetail[j].menu[0].price);
                    if (dataDetail[j].promo[0] === undefined) {
                        result.table += `${dataDetail[j].menu[0].name}\tRp.${dataDetail[j].menu[0].price}\t${dataDetail[j].quantity}\n`;
                    } else {
                        result.table += `${dataDetail[j].menu[0].name}\tRp.${dataDetail[j].menu[0].price}\t${dataDetail[j].quantity}\t${dataDetail[j].promo[0].discount}%\n`;
                    }
                }
            }
            
            result.table += "---------------------------------------------------------\n";
            result.table += dataOrder.length -1  === i? `TOTAL : Rp.${total}` : `TOTAL : Rp.${total}\n\n\n`
        }

        result.table += `\n\nUntuk Melakukan Tracking Pesanan\n`;
        result.table += `tracking/{nomor resi}\n\n`;
        result.table += `Contoh Penggunaan: \n`
        result.table += `tracking/12388499392\n\n`;
        result.table += 'untuk melihat semua list perintah:\nhelp';
        return result.table;
    }).catch((error) => {
        console.log(error.response);
    })
}

const checkOrderStatusPerDateHandler = async (text, msg) => {
    const chat = await msg.getChat();

    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){

            let phoneNumber = phone_number;
            return chat.sendMessage(await checkOrderStatusPerDateRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const checkOrderStatusPerDateRequest = async (msg, phoneNumber) => {
    const body = msg._data.body;
    const cmd = body.split("/");
    const date = cmd[1];

    const regex = /^\d{1,2}-\d{2}-\d{4}$/;
    const isMatch = regex.test(date);

    if(!isMatch){
        return `Perintah salah \n\ncommand yang benar\nriwayat/12-03-2023`
    }
    

    const result = {
        status: false,
        message: "",
        data: "",
    }

    return await axios({
        method: "POST",
        url: `${process.env.BE_HOST}order/list-order-per-date`,
        data: {
            customer: phoneNumber,
            date: date
        }
    }).then((response) => {
        let dataOrder = response.data.data.data_order
        let dataDetail = response.data.data.data_detail
        result.status = true
        if (dataOrder.length === 0) {
            result.table = "Anda tidak memiliki pesanan.";
            return result.table;
        }
        result.table = `Anda memiliki ${dataOrder.length} pesanan.\n\n`;

        for (let i = 0; i < dataOrder.length; i++) {
            result.table += `Tanggal : ${formatDateTime(dataOrder[i].created_at)}\n`;
            result.table += `ID ORDER : ${dataOrder[i].id}\n`;
            result.table += `Nomor Resi: ${dataOrder[i].resi_number}\n`;
            result.table += "Nama Barang\tHarga\tQuantity\t\tDiskon\n";
            result.table += "---------------------------------------------------------\n";

            let total = 0;
            
            for (let j = 0; j < dataDetail.length; j++) {
                if (dataDetail[j].id_order === dataOrder[i].id) {
                    total += parseFloat(dataDetail[j].menu[0].price);
                    if (dataDetail[j].promo[0] === undefined) {
                        result.table += `${dataDetail[j].menu[0].name}\tRp.${dataDetail[j].menu[0].price}\t${dataDetail[j].quantity}\n`;
                    } else {
                        result.table += `${dataDetail[j].menu[0].name}\tRp.${dataDetail[j].menu[0].price}\t${dataDetail[j].quantity}\t${dataDetail[j].promo[0].discount}%\n`;
                    }
                }
            }
            
            result.table += "---------------------------------------------------------\n";
            result.table += dataOrder.length -1  === i? `TOTAL : Rp.${total}` : `TOTAL : Rp.${total}\n\n\n`
        }

        result.table += `\n\nUntuk Melakukan Tracking Pesanan\n`;
        result.table += `tracking/{nomor resi}\n\n`;
        result.table += `Contoh Penggunaan: \n`
        result.table += `tracking/12388499392\n\n`;
        result.table += 'untuk melihat semua list perintah:\nhelp';

        return result.table;
    }).catch((error) => {
        console.log(error.response.data)
        // console.log(error.response.data.meta.message);
    })
}

const trackingOrderHandler = async (text, msg) => {
    const chat = await msg.getChat();
    
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){

            let phoneNumber = phone_number;
            return chat.sendMessage(await trackingOrderRequest(msg, phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const trackingOrderRequest = async (msg, phoneNumber) => {

    const body = msg._data.body;
    const cmd = body.split("/");

    const data = {
        resiNumber: cmd[1],
        phoneNumber: phoneNumber
    }
    // console.log(data)

    const result = {
        table: "",
        status: false
    }

    return await axios({
        method: 'POST',
        url: `${process.env.BE_HOST}order/tracking-order`,
        data: {
            customer: data.phoneNumber,
            resiNumber: data.resiNumber
        }
    }).then((response) => {
        const data_api = response.data.data.data;
        const data_length = response.data.data.data.history.length;
        result.table = `NAMA EKSPEDISI: ${data_api.summary.courier}\n`
        result.table += `NOMOR RESI: ${data_api.summary.awb}\n`
        result.table += `${data_api.detail.shipper} \n${data_api.detail.receiver}`
        result.table += `\n\n Status Pengiriman: \n LOKASI: ${data_api.history[data_length - 1].date}\n KETERANGAN: ${data_api.history[data_length - 1].desc}\n\n`;
        result.table += 'untuk melihat semua list perintah:\nhelp';
        return result.table;
    }).catch((error) => {
        // console.log(error.response.data.meta.message);
        return error.response.data.meta.message;
    })
}

module.exports = {
    listOrder,
    orderHandler,
    updateOrderHandler,
    deteleOrderHandler,
    checkPaymentHandler,
    paymentCheckoutHandler,
    checkOrderStatusHandler,
    trackingOrderHandler,
    checkOrderStatusPerDateHandler
}