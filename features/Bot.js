const botHandler = async (text, msg) => {
    const chat = await msg.getChat();

    try {
        // return chat.sendMessage(botRequest(msg))
        // console.log(botRequest(msg))
        const body = msg._data.body;
        const cmd = body.split("/");
    // return 'bener'
    //  bot/{desimal}/{angka 1-10000}/{angka 1-10}
        const data = {
            nomor: cmd[1],
            banyak: cmd[2],
            lama: cmd[3],
            pesan: cmd[4],
        }
        console.log(data)

        const number = `+62${data.nomor}`;

        // // Your message.
        // Your message.
        const messageText = `${data.pesan}`;

        // Getting chatId from the number.
        // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
        const chatId = number.substring(1) + "@c.us";

        // Function to send a message
        const sendMessage = () => {
            return {chatId, messageText}
            // client.sendMessage(chatId, messageText);
            chat.sendMessage(chatId, messageText)
        };

        let interval = `${data.lama}000`

        // Set an interval to send the message every 5 seconds (5000 milliseconds)
        const intervalId = setInterval(sendMessage, interval);

        // Stop the interval after a certain number of iterations (e.g., 20 times)
        // This prevents the loop from running indefinitely
        let iterations = 0;
        const maxIterations = data.banyak;

        const stopInterval = () => {
            clearInterval(intervalId);
        };

        // Set a timeout to stop the interval after a certain number of iterations
        setTimeout(stopInterval, maxIterations * 5000);
    } catch (error) {
        
    }
}

const botRequest = async (msg) => {
    const body = msg._data.body;
    const cmd = body.split("/");
// return 'bener'
//  bot/{desimal}/{angka 1-10000}/{angka 1-10}
    const data = {
        nomor: cmd[1],
        banyak: cmd[2],
        lama: cmd[3],
        pesan: cmd[4],
    }
    console.log(data)

    const number = `+62${data.nomor}`;

    // // Your message.
    // Your message.
    const messageText = `${data.pesan}`;

    // Getting chatId from the number.
    // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
    const chatId = number.substring(1) + "@c.us";

    // Function to send a message
    const sendMessage = () => {
        return {chatId, messageText}
        // client.sendMessage(chatId, messageText);
    };

    let interval = `${data.lama}000`

    // Set an interval to send the message every 5 seconds (5000 milliseconds)
    const intervalId = setInterval(sendMessage, interval);

    // Stop the interval after a certain number of iterations (e.g., 20 times)
    // This prevents the loop from running indefinitely
    let iterations = 0;
    const maxIterations = data.banyak;

    const stopInterval = () => {
        clearInterval(intervalId);
    };

    // Set a timeout to stop the interval after a certain number of iterations
    setTimeout(stopInterval, maxIterations * 5000);
}

module.exports = {
    botHandler
}