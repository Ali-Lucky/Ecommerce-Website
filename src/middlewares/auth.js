//=============== Import User Model ================== //
const userModel = require('../models/userModel');

//=============== Import JWT ================== //
const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('../validators/validator');

//=============== Authentication ================== //
const authentication = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({ status: false, msg: "token must be present" });
        };
        
        token = token.replace(/^Bearer\s+/, "");

        jwt.verify(token, "Ecommerce site secretKey", function (error, validToken) {
            if (error) {
                return res.status(401).send({ status: false, msg: error.message });
            } else {
                req.token = validToken;
                next();
            };
        });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    };
};

//=============== Authorization ================== //
const authorization = async (req, res, next) => {
    try {
        let loggedInUserId = req.token.userId;
        let requestingUserId = req.params.userId;

        if (!isValidObjectId(requestingUserId)) return res.status(400).send({ status: false, msg: "Invalid userId" })

        let userExist = await userModel.findOne({ _id: requestingUserId })
        if (!userExist) {
            return res.status(404).send({ status: false, message: "user not found" });
        };

        if (loggedInUserId != requestingUserId) {
            return res.status(403).send({ status: false, message: "User is unauthorized" });
        };
        
        next();
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    };
};

//=============== Export Middlewares ================== //
module.exports = { authentication, authorization };