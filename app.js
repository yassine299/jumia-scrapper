//packages
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();

//home
app.get("/", (req, res) => {
    res.send("hello")
})


// get the products by categorie
app.get("/categorie", async (req, res) => {
    const baseUrl = "https://www.jumia.ma/ar/ordinateurs-pc/" + "?page=";
    let page = 1;
    const products = [];

    try {
        while (true) {
            const url = baseUrl + page;
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const items = $("a.core");
            if (items.length === 0) {
                break;
            }
            for (const item of items) {
                const link = "https://www.jumia.ma/" + $(item).attr("href");
                const image = $(item).find("*").children().attr("data-src");
                const name = $(item).find("h3.name").text().trim();
                const priceText = $(item).find(".prc").text().trim().replace(/,/g, "");
                const price = parseFloat(priceText);
                if (isNaN(price)) {
                    continue;
                }
                products.push({ name, price, link, image });
            }
            page++;
        }
        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the data.");
    }
});

// get Product Info
app.get("/product", async (req, res) => {
    const url = "https://www.jumia.ma/ar/cappy-pack-cappy-pulpy-orange-1l8-34196896.html";
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const productInfo = $(".col10");

        const productImg = $("#imgs");
        const productName = $(productInfo).find("h1").text().trim();
        const productPrice = parseInt($(productInfo).find("span").first().text().replace(/,/g, "").trim());
        const productImgUrl = $(productImg).find("*").children().attr("data-src").trim();
        const productDescription = $("#jm > main > div:nth-child(2) > div.col12 > div.card.aim.-mtm > div.markup.-mhm.-pvl.-oxa.-sc").text().trim();
        const rating = $("#jm > main > div:nth-child(1) > section > div > div.col10 > div.-phs > div.-df.-i-ctr.-pvxs > div").text();
       
        const product = { name: productName, price: productPrice, link: url, img: productImgUrl, productDescription: productDescription, rating: rating };
        res.send(product);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the data.");
    }
});


//start the server
app.listen(4000, () => {
    console.log("server is up runing port :4000 ")
})
