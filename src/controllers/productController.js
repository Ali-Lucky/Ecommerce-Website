//=============== Import Product Model ================== //
const productModel = require('../models/productModel');

//=============== Import Validation ================== //
const { isValidPrice } = require('../validators/validator');

//=============== Create Product ================== //
const createProduct = async (req, res) => {
    try {
        const data = req.body;
        const { productName, price } = data;

        // If product name is missing
        if (!productName) {
            res.status(400).send({ status: false, message: "productName is mandatory" });
        };

        // If price is missing
        if (!price) {
            res.status(400).send({ status: false, message: "price is mandatory" });
        };

        // If price is invalid
        if (!isValidPrice(price)) {
            res.status(400).send({ status: false, message: "Price must be Numeric or Decimal (upto 3 digits)" });
        };

        // DB call to create product
        const productCreated = await productModel.create(data);
        return res.status(201).send({ status: true, message: productCreated });

    } catch (err) {
        return res.status(500).send({ status: "error", error: err.message });
    };

};

//=============== Get Product Details ================== //
const getProduct = async (req, res) => {
    try {

        const { productName, priceGreaterThan, priceLessThan, priceSort } = req.query;
        let data = {}

        // Filtering data with product name
        if (productName) {
            const regexForName = new RegExp(productName, "i");
            data.productName = { $regex: regexForName };
        };

        // Filtering data with greater than a specified price
        if (priceGreaterThan) {
            if (!isValidPrice(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "priceGreaterThan must be Numeric or Decimal (upto 3 digits)" });
            };
            data.price = { $gt: priceGreaterThan };
        };

        // Filtering data with less than a specified price
        if (priceLessThan) {
            if (!isValidPrice(priceLessThan)) {
                return res.status(400).send({ status: false, message: "priceLessThan must be Numeric or Decimal (upto 3 digits)" });
            };
            data.price = { $lt: priceLessThan };
        };

        // Filtering data within the range of a specified price
        if (priceGreaterThan && priceLessThan) {
            data.price = { $gt: priceGreaterThan, $lt: priceLessThan };
        };

        // DB call to get products
        let products = await productModel.find(data);

        // If no product found
        if (products.length == 0 ) {
            return res.status(404).send({ status: false, message: "No products found" });
        };

        // Sorting products in increasing order of its price
        if (priceSort == 1) {
            products.sort((a, b) => {
                return a.price - b.price;
            });
        }
        // Sorting products in increasing order of its price
        else if (priceSort == -1) {
            products.sort((a, b) => {
                return b.price - a.price;
            });
        };
    
        return res.status(200).send({ status: true, message: products });
    } catch (err) {
        return res.status(500).send({ status: "error", error: err.message });
    };
};

//=============== Export Module ================== //
module.exports = { createProduct, getProduct }