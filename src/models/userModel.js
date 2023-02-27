//=============== Import Mongoose ================== //
const mongoose = require('mongoose');

//=============== Create Schema ================== //
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    }
}, { timestamps: true });

//=============== Export Schema ================== //
module.exports = mongoose.model("User", userSchema);