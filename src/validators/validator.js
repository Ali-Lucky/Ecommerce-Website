// ====================== Import mongoose ============== //
const mongoose = require('mongoose');

// ====================== validate Id ============== //
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};

// ====================== validate Name ============== //
const isValidName = function (name) {
    return /^[a-zA-Z_ ]*$/.test(name);
};

// ====================== validate Email ============== //
const isValidEmail = function (email) {
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
};

// ====================== validate Password ============== //
const isValidPassword = function (password) {
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password);
};

// ====================== validate Phone ============== //
const isValidPhone = function (phone) {
    return /^[6-9]\d{9}$/.test(phone);
};

// ====================== validate Price ============== //
const isValidPrice = function (price) {
    return /^\d{0,8}[.]?\d{1,3}$/.test(price);
};

// ====================== Export module ============== //
module.exports = { isValidObjectId, isValidName, isValidEmail, isValidPassword, isValidPhone, isValidPrice };