const { botControl } = require("./bot_control");
const session = require("./session");

async function handleAnswer(answer, shopNumber, custNumber) {
    if (!Object.prototype.hasOwnProperty.call(session, shopNumber)) {
        session[shopNumber] = {};
    }

    if (!Object.prototype.hasOwnProperty.call(session[shopNumber], custNumber)) {
        session[shopNumber][custNumber] = {
            question_id: 0,
            question: "",
            answer: "",
            number: custNumber,
            answer_option: "0",
            option: [],
            media_type: "", 
            media_path: "",
            name: "",
            email: "",
            upgrade: "",
            variant: "",
            produk_id: "",
            produk_name: "",
            produk_code: "",
            price: "",
            updated_at: new Date(),
            created_at: new Date(),
        };
    } else {
        session[shopNumber][custNumber].answer = answer;
    }

    let body = session[shopNumber][custNumber];
    console.log(body);

    let response = await botControl(body, shopNumber);
    console.log("------------------------------");

    session[shopNumber][custNumber] = {
        question_id: response.question_id,
        question: response.question,
        message: response.message,
        answer: "",
        number: custNumber,
        answer_option: response.answer_option,
        option: response.option,
        media_type: response.media_type,
        media_path: response.media_path,
        name: response.name,
        email: response.email,
        upgrade: response.upgrade,
        variant: response.variant,
        produk_id: response.produk_id,
        produk_name: response.produk_name,
        produk_code: response.produk_code,
        price: response.price,
        updated_at: new Date(),
        created_at: session[shopNumber][custNumber]["created_at"],
    };

    return true;
}

module.exports = { handleAnswer };
