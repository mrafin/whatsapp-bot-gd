const axios = require("axios");
const { checkNumberHandler } = require("./cekNomor");
require('dotenv').config();

const ListMenuHandler = async (text, msg) => {
    const chat = await msg.getChat();

    let checkNumber = await checkNumberHandler(msg);
    // console.log(checkNumber)
    
    if(checkNumber.body != 'Customer Is Blocked'){
        try {
            return chat.sendMessage(await ListMenu(checkNumber));
        } catch (error) {
            console.log(error);
        }
    }
}

const ListMenu = async (phoneNumber) => {
    const result = {
        success: false,
        dataName: null,
        dataPrice: null,
        dataOnDiscount: false,
        dataStock: null,
        data: null,
        table: "",
        message: ""
    }

    return await axios({
        method: 'GET',
        url: `${process.env.BE_HOST}menu/${phoneNumber}`,
        Headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        }
    }).then((response) => {
        console.log(response.data)
        if(response.status == 200){
            // console.log(response.data)
            let arrayData = response.data.data;
            let arrayRecomendation = response.data.recomendation;
            result.success = true;
            result.table = "Nama Barang\tHarga\t\tStok\n";
            result.table += "---------------------------------------------\n";
            for (let i = 0; i < arrayData.length; i++) {
                result.table += `${arrayData[i].name}\tRp.${arrayData[i].price}\t${arrayData[i].stock}\n`;
            }
            result.table += `---------------------------------------------\n\n`;
            result.table += 'Rekomendasi Menu:\n';
            for (let i = 0; i < arrayRecomendation.length; i++) {
                result.table += `- ${arrayRecomendation[i]}\n`;
            }
            result.table += `\nUntuk Melakukan Pemesanan\n`;
            result.table += `pilih/{Nama Produk}/{jumlah Barang}\n\n`;
            result.table += `Contoh Penggunaan: \n`
            result.table += `pilih/sambal ijo/10\n\n`
            result.table += 'untuk melihat semua list perintah:\n help';
        }
        // console.log(result.table)
        return result.table
    }).catch((error) => {
        // console.log(error.response.data)
        console.log(error)
    })
}

module.exports = {
    ListMenuHandler
}