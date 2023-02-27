//=============== Import User Model ================== //
const userModel = require('../models/userModel');

//=============== Import Bcrypt ================== //
const bcrypt = require('bcrypt');

//=============== Import JWT ================== //
const jwt = require('jsonwebtoken');

//=============== Import Validations ================== //
const { isValidName, isValidEmail, isValidPassword, isValidPhone } = require('../validators/validator');

//=============== User Register ================== //
const newUser = async (req, res) => {
    try {
        const data = req.body;
        const { name, email, password, phone } = data;

        // If Body is Empty
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "user details are required" });
        };

        // If name is missing
        if (!name) {
            return res.status(400).send({ status: false, message: "name is mandatory" });
        };

        // If name is invalid
        if (!isValidName(name)) {
            return res.status(400).send({ status: false, message: "Invalid name" });
        };

        // If email is missing
        if (!email) {
            return res.status(400).send({ status: false, message: "email is mandatory" });
        };

        // If email already exist
        const emailExist = await userModel.findOne({ email: email });

        if (emailExist) {
            return res.status(400).send({ status: false, message: "email already resgisterd! Please use different email" });
        };

        // If email is invalid
        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email" });
        };

        // If password is missing
        if (!password) {
            return res.status(400).send({ status: false, message: "password is mandatory" });
        };

        // If password is invalid
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Invalid password! Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character" });
        };

        // If phone is missing
        if (!phone) {
            return res.status(400).send({ status: false, message: "phone is mandatory" });
        };

        // If phone already exist
        const phoneExist = await userModel.findOne({ phone: phone });

        if (phoneExist) {
            return res.status(400).send({ satus: false, message: "phone number is already used" });
        };

        // If phone is invalid
        if (!isValidPhone(phone)) {
            return res.status(400).send({ status: false, message: "Invalid phone number" });
        };

        // Encrypting password
        const encryptedPassword = await bcrypt.hash(password, 10);

        data.password = encryptedPassword;

        // Register user after all test cases pass
        const userCreated = await userModel.create(data);
        return res.status(201).send({ status: true, message: userCreated });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    };

};

//=============== User Login ================== //

const userLogin = async (req, res) => {

    try {
        const data = req.body;
        const { email, phone, password } = data;

        // If body is empty
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "login credentials are required" });
        };

        // If email and password both are missing
        if (!email && !phone) {
            return res.status(400).send({ status: false, message: "Please provide email or phone number" });
        };

        // If email and phone both provided
        if (email && phone) {
            return res.status(400).send({ status: false, message: "Please provide only email or phone number" });
        };

        // If password is missing
        if (!password) {
            return res.status(400).send({ status: false, message: "Please enter your password" });
        };

        // If email is invalid
        if (email && !isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email" });
        };

        // If phone is invalid
        if (phone && !isValidPhone(phone)) {
            return res.status(400).send({ status: false, message: "Invalid phone number" });
        };

        // If password is invalid
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Invalid password! Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character" });
        };

        // DB call for email or phone exist or not
        const userExist = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] });

        // If user not exist
        if (!userExist) {
            return res.status(404).send({ status: false, message: "User not found" });
        };
        
        // Comparing password
        const matchPassword = await bcrypt.compare(password, userExist.password);

        // If password doesn't match
        if (!matchPassword) {
            return res.status(400).send({ status: false, message: "Wrong Password" });
        };

        // Generate token
        const token = jwt.sign(
            { userId: userExist._id.toString() },
            "Ecommerce site secretKey",
            {
                expiresIn: "12hr"
            }
        );

        return res.status(200).send({ status: true, data: token });

    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    };

};

//=============== Export Module ================== //
module.exports = { newUser, userLogin };