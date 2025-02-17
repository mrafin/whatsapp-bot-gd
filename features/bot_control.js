
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const flowBot = require('./flow_bot');
const questionList = require('./question');

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Fetch data from an API
async function fetchData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// Post data to an API
async function postData(url, body) {
    try {
        const response = await axios.post(url, body);
        return response.data;
    } catch (error) {
        console.error("Error posting data:", error);
        return null;
    }
}


// Upgrade function
function upgrade(email) {
    if (email === "rafi@mail.com") {
        return {
            status: "benar",
            data: {
                name: "rafi",
                variant: "Netflix",
                produk_id: "3",
                produk_name: "Netflix Private 1 Bulan",
                price: "25000"
            }
        };
    } else {
        return {
            status: "salah",
            message: "Email produk sharing yang Anda kirim tidak ditemukan. Mohon kirim kembali email produk dengan benar."
        };
    }
}

// Redeem Shopee function
const codeList = {
    "kak123": { is_used: 0, usn: "rafi", psw: "askd123" },
    "aww44": { is_used: 0, usn: "asad", psw: "aasasc123" }
};

function redeemShopee(code) {
    if (codeList[code]) {
        if (codeList[code].is_used === 0) {
            codeList[code].is_used = 1;
            return {
                status: "benar",
                message: `Pesanan Anda telah kami konfirmasi. Berikut detil informasi Akun Anda:\nUsername: ${codeList[code].usn}\nPassword: ${codeList[code].psw}\n\nTerima kasih telah menggunakan layanan kami. Salam, Golden Digital :)`
            };
        } else {
            return {
                status: "berulang",
                message: "Format yang Anda kirim telah diklaim sebelumnya."
            };
        }
    } else {
        return {
            status: "salah",
            message: "Format yang Anda kirim salah. Mohon kirim kembali format pemesanan dengan benar."
        };
    }
}

// Main bot control function
async function botControl(body) {
    let { question_id, answer, number, variant, produk_id, produk_name, name, price, produk_code,upgrade } = body;

    let response = {
        question_id: "",
        question: "",
        message: "",
        answer_option: "",
        option: [],
        media_type: "",
        media_path: "",
        name,
        upgrade,
        variant,
        produk_id,
        produk_name,
        produk_code,
        price
    };

    question_id = (question_id).toString()

    console.log(typeof question_id);
    console.log(question_id);

    if (question_id === "0") {
        const next_question_id = "1";
        response.question_id = next_question_id;
        response.question = questionList[next_question_id];
        response.answer_option = "option";
        response.option = [1, 2, 3, 4, 5, 6];
        return response;
    }

    const currentAnswerList = Object.keys(flowBot[question_id]);

    let next_question_id;
    let variant_name = "";

    if (answer === "0" && currentAnswerList.includes("0")) {
        next_question_id = "1";
    } else if (currentAnswerList.includes(answer) && /^\d+$/.test(answer)) {
        next_question_id = flowBot[question_id][answer];
    } else if (currentAnswerList.includes("email")) {
        if (isValidEmail(answer)) {
            const upgraded = await postData("http://127.0.0.1:8000/api/transactions/upgrade", {"email":answer});
            if (upgraded.message) {
                // Object.assign(response, upgraded.data);
                response.message = "Email yang anda masukan tidak ditemukan, mohon masukan email yang benar";
                next_question_id = flowBot[question_id]["email"]["salah"];
            } else {
                response.upgrade = answer;
                next_question_id = flowBot[question_id]["email"]["benar"];
            }
        } else {
            response.message = "Mohon masukan format email yang benar";
            next_question_id = flowBot[question_id]["email"]["salah"];
            console.log("next_question_id", next_question_id);
        }
    } else if (currentAnswerList.includes("variant")) {
        const getVariant = await fetchData("https://devgoldendigital.my.id/api/variances");
        variant_name = getVariant.variance.find(x => x.id.toString() === answer)?.variance_name || "";
        response.variant = variant_name;
        next_question_id = flowBot[question_id]["variant"];
    } else if (currentAnswerList.includes("produk")) {
        const getProdukList = await fetchData("https://devgoldendigital.my.id/api/get_detail_products/variance/"+response.variant);
        
        if(getProdukList.products && Object.keys(getProdukList.products).length > 0){
            const produk = getProdukList.products[response.variant].find(x => x.id_produk.toString() === answer);
            response.produk_id = answer;
            response.produk_name = produk?.detail_produk || "";
            response.produk_code = produk?.kode_produk || "";
            response.price = produk?.harga || "";
            next_question_id = flowBot[question_id]["produk"];
        }
    }else if (currentAnswerList.includes("upgrade")) {
        const upgraded = await postData("http://127.0.0.1:8000/api/transactions/upgrade", {"email":response.upgrade});
        if (upgraded.products) {
            
            const produk = upgraded.products[upgraded.current_product.variance_name].find(x => x.id_produk.toString() === answer);
            response.name = upgraded.current_product.nama_customer;
            response.produk_id = answer;
            response.produk_name = produk?.detail_produk || "";
            response.produk_code = produk?.kode_produk || "";
            response.price = produk?.harga_upgrade || "";
            next_question_id = flowBot[question_id]["upgrade"];
        }
    } else if (currentAnswerList.includes("any")) {
        if (question_id === "4") response.name = answer;
        // if (question_id === "10") response.message = redeemShopee(answer);

        if(question_id === "10"){
            const data_cred = await postData("http://127.0.0.1:8000/api/transactions/claim_code", {transaction_code:answer})
            console.log(data_cred);
            if(data_cred.message){
                next_question_id = flowBot[question_id]["any"];
                response.message = "Format yang Anda kirim salah. Mohon kirim kembali format pemesanan dengan benar."
            }else{
                const email = data_cred.email
                const password = data_cred.password
                const profile = data_cred.profile
                const pin = data_cred.pin
                const template = data_cred.template

                const pesan = `Terima kasih telah bertransaksi melalui Golden Digital. Berikut data credential anda:\n- email : ${email}\n- password : ${password}\n- profile : ${profile}\n- pin : ${pin}\n\n${template}`
                
                next_question_id = "99"
                response.message = pesan
            }

            // if(response.message.message === "benar"){

            //     next_question_id = "99"
            // }else{
            //     next_question_id = flowBot[question_id]["any"];
            // }
        }else{

            next_question_id = flowBot[question_id]["any"];
            
        }
    }

    const nextAnswerList = Object.keys(flowBot[next_question_id]);

    if (nextAnswerList.length === 1 && /^\d+$/.test(nextAnswerList[0])) {
        response.question_id = next_question_id;
        response.question = questionList[next_question_id];
        response.answer_option = nextAnswerList[0];
    } else if (nextAnswerList.includes("any") || nextAnswerList.includes("email")) {
        response.question_id = next_question_id;
        response.question = questionList[next_question_id].replace("{price}", price).replace("\\n", "\n");
        // response.question = questionList[next_question_id].replace("\\n", "\n");
        response.answer_option = "any";
    } else if (nextAnswerList.includes("variant")) {
        const getVariant = await fetchData("https://devgoldendigital.my.id/api/variances");
        const variantIdList = getVariant.variance
            .filter(x => x.variance_name !== "Premium Sharing")
            .map(x => x.id);
        const variantNameList = getVariant.variance
            .filter(x => x.variance_name !== "Premium Sharing")
            .map(x => x.variance_name);

        let item_option = variantIdList.map((id, i) => `${id}. ${variantNameList[i]}`).join("\n");

        response.question_id = next_question_id;
        response.question = questionList[next_question_id].replace("{variant}", item_option).replace("\\n", "\n");
        response.answer_option = "option";
        response.option = variantIdList.map(String);
    } else if (nextAnswerList.includes("produk")) {
        const getProduk = await fetchData("https://devgoldendigital.my.id/api/get_detail_products/variance/"+response.variant);
        // console.log("https://devgoldendigital.my.id/api/get_detail_products/variance/"+response.variant);
        console.log(getProduk);
        let item_option=""
        let produkList=[]
        if(getProduk.products && Object.keys(getProduk.products).length > 0){
            
            produkList = getProduk.products[response.variant].filter(x => x.detail_produk.includes(variant_name));
            item_option = produkList.map(x => `${x.id_produk}. ${x.detail_produk} Rp ${x.harga}`).join("\n");
        }

        response.question_id = next_question_id;
        response.question = questionList[next_question_id]
            .replace("{variant}", variant_name)
            .replace("{produk}", item_option)
            .replace("\\n", "\n");
        response.answer_option = "option";
        response.option = [...produkList.map(x => x.id_produk.toString()), "0"];
    }else if (nextAnswerList.includes("upgrade")) {
        const getProduk = await postData("http://127.0.0.1:8000/api/transactions/upgrade", {"email":answer});
        // console.log("https://devgoldendigital.my.id/api/get_detail_products/variance/"+response.variant);
        console.log(getProduk);
        let item_option=""
        let produkList=[]
        if(getProduk.products && Object.keys(getProduk.products).length > 0){
            
            produkList = getProduk.products[getProduk.current_product.variance_name]//.filter(x => x.detail_produk.includes(variant_name));
            // console.log(getProduk.products);
            // console.log(response.variant);
            // console.log(getProduk.products[response.variant]);
            item_option = produkList.map(x => `${x.id_produk}. ${x.detail_produk} Rp ${x.harga} - Rp ${getProduk.current_product.harga} = Rp ${x.harga_upgrade}`).join("\n");
        }

        response.question_id = next_question_id;
        response.question = questionList[next_question_id]
            .replace("{current_product}", getProduk.current_product.detail)
            .replace("{list_product}", item_option)
            .replace("\\n", "\n");
        response.answer_option = "option";
        response.option = [...produkList.map(x => x.id_produk.toString()), "0"];
    } else {
        response.question_id = next_question_id;
        
        response.question = questionList[next_question_id].replace("{name}", response.name)
        .replace("{produk}", response.produk_name)
        .replace("\\n", "\n");
        response.answer_option = "option";
        response.option = nextAnswerList;
    }

    // Cek link payment
    if(response.question.includes("{link_payment}")){
        const transaction_uuid = uuidv4();

        const url = `https://www.goldendigital.web.id/checkoutBot?external_id=${encodeURIComponent(response.produk_code)}&amount=${response.price}&id_price=${response.produk_id}&id_customer=0&id_promo=0&customer_name=${response.name.replace(" ", "%20")}&phone_customer=${number}&transaction_code=${transaction_uuid}&payment_status=PENDING&product=${response.variant}&product_price=${response.price}&tax=6000`
        console.log("produk code ",encodeURIComponent(response.produk_code));
        response.question = response.question.replace("{link_payment}", url)
    }

    if(next_question_id === "3"){
        response.media_type = "image"
        response.media_path = "assets/images/perbedaan.jpg"
    // }else if(next_question_id === "6"){
    //     response.media_type = "image"
    //     response.media_path = "assets/images/logo.jpg"
    }else if(next_question_id === "8"){
        response.media_type = "image"
        response.media_path = "assets/images/logo.jpg"
    }
    // else if(next_question_id === "17"){
    //     response.media_type = "image"
    //     response.media_path = "assets/images/netflix_poster.jpg"
    // }

    return response;
}

module.exports = { botControl };
