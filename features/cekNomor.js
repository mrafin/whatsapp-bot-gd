const axios = require("axios");
require('dotenv').config();

const checkNumberHandler = async (msg) => {
    // const chat = await msg.getChat();
    const message_from = msg._data.from;
    const cmd = message_from.split("@");
    const chat = await msg.getChat();

    let phoneNumber = cmd[0];

    if(phoneNumber === "6282245083753"){

        return chat.sendMessage("YOOOOO")
    }else{
        return "Customer Is Blocked"
    }
    // try {
    //     // await checkNumberRequest(phoneNumber) === 'Customer Is Blocked' ?
    //     //     chat.sendMessage(await checkNumberRequest(phoneNumber))
    //     //     :
    //     //     await checkNumberRequest(phoneNumber);
    // } catch (error) {
    //     console.log(error);
    // }
}

const checkNumberRequest = async (phoneNumber) => {

    const result = {
        success: false,
        data: null,
        message: "",
    }

    return await axios({
        method: "POST",
        url: `${process.env.BE_HOST}user/check-phone-number`,
        data: {
            phoneNumber: phoneNumber
        },
        Headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        }
    }).then(async (response) => {
        console.log(response.data)
        if (response.data.meta.message === 'Customer Is Blocked') {
            result.success = false;
            result.message = response.data.meta.message;
            // console.log(result.message)
            return result.message
        } else if (response.data.meta.message !== 'Not Found') {
            result.success = true;
            result.message = response.data.meta.message;
            result.data = response.data.data.whatsapp;
            return result.data;

        } else {
            result.success = true;
            result.data = await addPhoneNumber(phoneNumber);
            return result;
        }
    }).catch((error) => {
        console.log(error);
    })
}

const addPhoneNumber = async (phoneNumber) => {

    const result = {
        success: false,
        data: null,
        message: "",
    }

    return await axios({
        method: "POST",
        url: `${process.env.BE_HOST}user/add-phone-number`,
        data: {
            phoneNumber: phoneNumber
        },
        Headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        }
    }).then(async (response) => {

        // console.log(response.data['meta']);
        result.success = true;
        result.message = response.data.meta.message;
        result.data = phoneNumber;

        return result.data
    }).catch((error) => {
        // console.log(error);
        return error;
    })
}

module.exports = {
    checkNumberHandler
}
