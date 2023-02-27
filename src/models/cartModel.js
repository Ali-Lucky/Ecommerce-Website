//=============== Import Mongoose ================== //
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

//=============== Create Schema ================== //
const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        unique: true,
        ref: "User",
    },
    items: [{
        productId: {
            type: ObjectId,
            required: true,
            ref: "Product",
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    totalItems: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

//=============== Export Schema ================== //
module.exports = mongoose.model("Cart", cartSchema);