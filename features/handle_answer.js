const { botControl } = require("./bot_control");
const session = require("./session");

async function handleAnswer(answer, custNumber) {
    if (!Object.prototype.hasOwnProperty.call(session, custNumber)) {
        session[custNumber] = {
            question_id: 0,
            question: "",
            answer: "",
            number: custNumber,
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
            price: ""
        };
    } else {
        session[custNumber].answer = answer;
    }

    let body = session[custNumber];
    console.log(body);

    let response = await botControl(body);
    console.log("------------------------------");

    session[custNumber] = {
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
        upgrade:response.upgrade,
        variant: response.variant,
        produk_id: response.produk_id,
        produk_name: response.produk_name,
        produk_code:response.produk_code,
        price: response.price
    };

    return true;
}

module.exports = { handleAnswer };
