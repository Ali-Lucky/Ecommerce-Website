//=============== Import Mongoose ================== //
const mongoose = require('mongoose');

//=============== Create Schema ================== //
const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

//=============== Export Schema ================== //
module.exports = mongoose.model("Product", productSchema);