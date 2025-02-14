const axios = require("axios");
const { checkNumberHandler } = require("./cekNomor");
require('dotenv').config();

const ListFaqHandler = async(text, msg) => {

    const chat = await msg.getChat();
    let checkNumber = await checkNumberHandler(msg);
    
    if(checkNumber.body != 'Customer Is Blocked'){
        try {
            return chat.sendMessage(await ListFAQRequest());
        } catch (error) {
            console.log(error)
        }
    }
    
}

const ListFAQRequest = async () => {
    const result = {
        success: false,
        dataAsk: null,
        dataAnswer: null,
        data: null,
        message: ""
    }

    return await axios({
        method: 'GET',
        url: `${process.env.BE_HOST}faq`,
    }).then((response) => {
        if(response.status == 404){
            console.log(response.data)
            result.data = response.data.meta.message
        }
        if(response.status == 200){
            let resultCombined = '';
            let arrayData = response.data.data;
            for (let i = 0; i < arrayData.length; i++) {
                if (i === arrayData.length - 1) {
                    resultCombined += `Q: ${response.data.data[i].question}\nA: ${response.data.data[i].answer}\n`;
                }else{
                    resultCombined += `Q: ${response.data.data[i].question}\nA: ${response.data.data[i].answer}\n \n`;
                }
            }
            result.success = true;
            result.dataAsk = response.data.data[0].question;
            result.dataAnswer = response.data.data[0].answer;
            result.data = resultCombined;
            result.message = "SUCCESS"
        }else{
            result.message = "FAILED RESPONSE";
        }
        return result.data;
    })
    .catch((error) => {
        console.log(error.response.data)
        return error.response.data.meta.message;
        
    })
}

module.exports = {
    // ListFAQ,
    // ListFAQ2,
    ListFaqHandler
}
