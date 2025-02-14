const axios = require("axios");
const { checkNumberHandler } = require("./cekNomor");
require('dotenv').config();


const statusUserHandler = async (text, msg) => {
   
    const chat = await msg.getChat();
    try {
        const phone_number = await checkNumberHandler(msg);
        if(phone_number.body != 'Customer Is Blocked'){
            let phoneNumber = phone_number;
            return chat.sendMessage(await statusUserRequest(phoneNumber));
        }
    } catch (error) {
        console.log(error)
    }
}

const statusUserRequest = async (phoneNumber) => {
    const result = {
        success: false,
        data: null,
    }

    return await axios({
        method: 'POST',
        url: `${process.env.BE_HOST}user/status-user`,
        data: {
            phone_number: phoneNumber,
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        },
    }).then((response) => {
        console.log(response.data)
        const checkDistributor = response.data.data.is_distributor;
        result.success = true
        if(checkDistributor == 0){
            result.data = "Anda Bukan Distributor\n\n"
            result.data += "bila ingin menjadi distributor:\n"
            result.data += "rubah status user\n\n";
            result.data += 'untuk melihat semua list perintah:\n help';
        }else{
            result.data = "Anda Distributor"
        }
        return result.data;
    }).catch((error) => {
        console.log(error.response)
        
    })
}

const changeStatusHandler = async (text, msg) => {
    const chat = await msg.getChat();
    try {
        const phone_number = await checkNumberHandler(msg);
        let phoneNumber = phone_number;
        return chat.sendMessage(await changeStatusRequest(phoneNumber));
        // console.log(await ListFAQ())
    } catch (error) {
        console.log(error)
    }
}

const changeStatusRequest = async (phoneNumber) => {
    const result = {
        success: false,
        data: null,
    }

    return await axios({
        method: 'POST',
        url: `${process.env.BE_HOST}user/change-status-user`,
        data: {
            phone_number: phoneNumber,
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        },
    }).then((response) => {
        console.log(response.data)
        const checkRequestDistributor = response.data.data.request_distributor;
        result.success = true
        if(checkRequestDistributor == 1){
            result.data = "Request Distributor sudah diajukan"
        }else if(response.data.data.is_distributor == 1){
            result.data = "Anda Distributor"
        }else{
            result.data = `Sedang ada kesalahan ini query nya ${response.data.data}`
        }
        return result.data;
    }).catch((error) => {
        console.log(error.response)
        
    })
}



module.exports ={
    statusUserHandler,
    changeStatusHandler
}