const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();


//this some categorieNames 
const categorieNames = [
    "/electronique/",
    "/telephone-tablette/",
    "/ordinateurs-accessoires-informatique/",
    "/maison-cuisine-jardin/",
    "/fashion-mode/",
    "/beaute-hygiene-sante/"
];

// Fetch products by category
app.get("/categorie/:categoryIndex", async (req, res) => {
    const categoryIndex = parseInt(req.params.categoryIndex);
    if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= categorieNames.length) {
        return res.status(400).send("Invalid category index");
    }

    const baseUrl = "https://www.jumia.ma" + categorieNames[categoryIndex] + "?page=";
    let page = 1;
    const products = [];

    try {
        while (true) {
            const url = baseUrl + page;
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const productLinks = $("a.core");

            if (productLinks.length === 0) {
                break;
            }

            for (const linkElement of productLinks) {
                const link = "https://www.jumia.ma/" + $(linkElement).attr("href");
                const image = $(linkElement).find("*").children().attr("data-src");
                const name = $(linkElement).find("h3.name").text().trim();
                const priceText = $(linkElement).find(".prc").text().trim().replace(/,/g, "");
                const price = parseFloat(priceText);

                if (!isNaN(price)) {
                    products.push({ name, price, link, image });
                }
            }
            page++;
        }
        res.send(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products: " + error.message);
    }
});



//get product info by putting product link
app.get("/product", async (req, res) => {
    const url = "https://www.jumia.ma/xiaomi-10000mah-mi-18w-fast-charge-power-bank-3-black-48996584.html";

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const productInfo = $(".col10");
        const productImg = $("#imgs");

        const productNameElement = $(productInfo).find("h1");
        const productPriceElement = $(productInfo).find("span").first();
        const productImgElement = $(productImg).find("*").children();
        const productDescriptionElement = $("#jm > main > div:nth-child(2) > div.col12 > div.card.aim.-mtm > div.markup.-mhm.-pvl.-oxa.-sc");
        const ratingElement = $("#jm > main > div:nth-child(1) > section > div > div.col10 > div.-phs > div.-df.-i-ctr.-pvxs > div");

        const productName = productNameElement.length ? productNameElement.text().trim() : "No name found";
        const productPrice = productPriceElement.length ? parseInt(productPriceElement.text().replace(/,/g, "").trim()) : 0;
        const productImgUrl = productImgElement.length ? productImgElement.attr("data-src").trim() : "No image found";
        const productDescription = productDescriptionElement.length ? productDescriptionElement.text().trim() : "No description found";
        const rating = ratingElement.length ? ratingElement.text().trim() : "No rating found";

        const product = {
            name: productName,
            price: productPrice,
            link: url,
            img: productImgUrl,
            productDescription: productDescription,
            rating: rating
        };
        res.send(product);
    } catch (error) {
        console.error("Error fetching product info:", error);
        res.status(500).send("Error fetching product info: " + error.message);
    }
});




app.listen(4000, () => {
    console.log("Server is running on port: 4000");
});
