const { default: axios } = require("axios");
const { checkNumberHandler } = require("./cekNomor");
const questionList = require("./question");
require('dotenv').config();

const ListPromoHandler = async (text, msg) => {
    const chat = await msg.getChat();

    let checkNumber = await checkNumberHandler(msg);
    
    if(checkNumber.body != 'Customer Is Blocked'){
        try {
            return chat.sendMessage(questionList["1"]);
        } catch (error) {
            console.log(error);
        }
    }
    
}

const listPromoRequest = async () => {
    const result = {
        success: false,
        dataPromo: null,
        dataProduct: null,
        dataPriceProduct: null,
        dataDiscount: null,
        data: null,
        message: ""
    }

    return await axios({
        method: 'GET',
        url: `${process.env.BE_HOST}promo`,
    }).then((response) => {
        if(response.status == 200){
            result.success = true;
            let resultCombined = '';
            let arrayData = response.data.data;
            for(let i = 0; i < arrayData.length; i++){
                if(i === arrayData.length - 1) {
                    dataPromo = response.data.data[i]['name'];
                    dataProduct = response.data.data[i].menu[0]['name'];
                    dataPriceProduct = response.data.data[i].menu[0]['price'];
                    dataDiscount = response.data.data[i]['discount'];
                    let dataPriceAfterDiscount = dataPriceProduct * dataDiscount/100;
                    resultCombined += `Promo ${dataPromo} Beli ${dataProduct} harga Rp.${dataPriceProduct} Diskon ${dataDiscount}% Jadi Rp.${dataPriceAfterDiscount}`
                    // console.log(dataPriceProduct, dataDiscount, dataPriceAfterDiscount)
                }else{
                    dataPromo = response.data.data[i]['name'];
                    dataProduct = response.data.data[i].menu[0]['name'];
                    dataPriceProduct = response.data.data[i].menu[0]['price'];
                    dataDiscount = response.data.data[i]['discount'];
                    let dataPriceAfterDiscount = dataPriceProduct * dataDiscount/100;
                    resultCombined += `Promo ${dataPromo} Beli ${dataProduct} harga Rp.${dataPriceProduct} Diskon ${dataDiscount}% Jadi Rp.${dataPriceAfterDiscount}\n\n`
                }
            }
            result.message = 'SUCCESS'
            result.data = resultCombined;
        }
        return result.data;
    }).catch((error) => {
        console.log(error.response.data)
        
    })
}

module.exports = {
    ListPromoHandler
}