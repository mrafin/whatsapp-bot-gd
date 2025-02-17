const session = require("./session");
const { handleAnswer } = require("./handle_answer");
const { MessageMedia } = require('whatsapp-web.js');

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

async function handleMessages(msg) {
    const body = msg._data;
    const messageFrom = body.from;
    const cmd = messageFrom.split("@");
    const chat = await msg.getChat();

    let phoneNumber = cmd[0];  // Extract phone number from message sender

    let msgText = "";
    if (body.type === "chat") {
        msgText = body.body;
    }
    console.log("session", session);
    console.log("phoneNumber", phoneNumber);

    if(session === {}){
        console.log("session benar")
    }else if(session === "{}"){
        console.log("session string")
    }else{
        console.log(typeof session)
    }

    if (session && typeof session === "object" && !phoneNumber in session) {
        console.log("session memiliki phoneNumber:", session[phoneNumber]);
    } else {
        console.log("session tidak memiliki phoneNumber");
    }

    // Check if the session object for the phone number exists
    if (!Object.prototype.hasOwnProperty.call(session, phoneNumber)) {
        // If the session does not exist, create it and process the answer
        await handleAnswer(msgText, phoneNumber);
    } else {
        const currentSession = session[phoneNumber]; // Access the session for this phone number

        // Handle different answer options
        if (currentSession.answer_option === "option") {
            if (currentSession.option.map(item => String(item).toLowerCase()).includes(String(msgText).toLowerCase())) {
                currentSession.answer = msgText;
            }
        } else if (currentSession.answer_option === "email") {
            if (isValidEmail(msgText)) {
                currentSession.answer = msgText;
            }
        } else if (currentSession.answer_option === "any") {
            currentSession.answer = msgText;
        } else {
            if (String(msgText).toLowerCase() === String(currentSession.answer_option).toLowerCase()) {
                currentSession.answer = msgText;
            }
        }

        // Process answer if it's provided
        if (currentSession.answer !== "") {
            await handleAnswer(msgText, phoneNumber);
        } else {
            console.log("session[phoneNumber]:", currentSession);
            console.log("messageText:", msgText);
            chat.sendMessage("Mohon jawab sesuai dengan instruksi");
        }
    }

    console.log(session);

    let response = session[phoneNumber]?.question || "Default Response"; // Safe access
    console.log("===============");
    console.log(response);

    // Optional: Handle media message (if needed)
    if (session[phoneNumber]?.media_type !== "" && session[phoneNumber]?.media_path !== "") {

        chat.sendMessage(MessageMedia.fromFilePath(session[phoneNumber]?.media_path));
    }

    // Handle custom message
    if (session[phoneNumber]?.message) {
        console.log("session[phoneNumber]['message']");
        console.log(session[phoneNumber].message);
        await chat.sendMessage(session[phoneNumber].message);

        session[phoneNumber].message = false

        // if (session[phoneNumber].message.status === "benar") {
        //     delete session[phoneNumber]; // Clean up session after correct answer
        //     return;
        // }
    }

    // Send response message
    chat.sendMessage(response);
}

module.exports = { handleMessages };
