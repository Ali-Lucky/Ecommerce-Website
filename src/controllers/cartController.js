//=============== Import Cart Model ================== //
const cartModel = require('../models/cartModel');

//=============== Import Product Model ================== //
const productModel = require('../models/productModel');

//=============== Import validation ================== //
const { isValidObjectId } = require('../validators/validator');

//=============== Create Cart or Add Items in Existing Cart ================== //
const createCart_Or_addItems = async (req, res) => {
    try {
        let userId = req.params.userId;
        let { productId, cartId } = req.body;
        let newCart = {};

        // If body is empty
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Request body empty... Please provide data for input" });
        };

        // If productId is missing
        if (!productId) {
            return res.status(400).send({ status: false, message: "Please provide productId to add in cart" });
        }

        // If productId is invalid
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Ivalid productId" });
        };

        // If cartId is invalid
        if (cartId && !isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Ivalid cartid" });
        };

        // DB call to check product exist or not
        let productExist = await productModel.findOne({ _id: productId });
        if (!productExist) {
            return res.status(404).send({ status: false, message: "product not found" });
        };

        // DB call to check cartId exist or not
        if (cartId) {
            let cartExist = await cartModel.findOne({ _id: cartId });
            if (!cartExist) {
                return res.status(404).send({ status: false, message: "cart not found" });
            };
        };

        // If user have already a cart
        let userAlreadyHaveCart = await cartModel.findOne({ userId });
        if (userAlreadyHaveCart && !cartId) {
            return res.status(400).send({ status: false, message: "Cart already exist, Please provide cartId" });
        };

        if (cartId) {
            let usersCart = await cartModel.findOne({ _id: cartId, userId: userId });

            // If cartId doesn't belongs to logged in user
            if (!usersCart) {
                return res.status(400).send({ status: false, message: "Cart doesn't belongs to this user" });
            };
        };

        if (userAlreadyHaveCart) {
            let cartObj = userAlreadyHaveCart.toObject();
            let productIdExist;
            cartObj.items.map(x => { if (x.productId == productId) productIdExist = x.productId });

            // If product already exist in cart
            if (productIdExist) {
                let updatedCart = await cartModel.findOneAndUpdate(
                    { _id: cartId, "items.productId": productIdExist },
                    { $inc: { "items.$.quantity": 1, totalPrice: productExist.price } },
                    { new: true }
                ).populate('items.productId').select({ __v: 0 });
                return res.status(201).send({ status: true, message: "Success", data: updatedCart });
            } else {
                // If new product is added in cart
                let updatedCart = await cartModel.findOneAndUpdate(
                    { _id: cartId },
                    {
                        $push: {
                            items: {
                                productId: productId,
                                quantity: 1
                            }
                        },
                        $inc: { totalPrice: productExist.price, totalItems: 1 }
                    }, { new: true }
                ).populate('items.productId').select({ __v: 0 });
                return res.status(201).send({ status: true, message: "Success", data: updatedCart });
            };
        };

        // If user is creating a new cart
        newCart.userId = userId;
        newCart.items = [{
            productId: productId,
            quantity: 1
        }];
        newCart.totalPrice = productExist.price;
        newCart.totalItems = newCart.items.length;

        // DB call to create cart
        let cart = await cartModel.create(newCart);
        let cartData = await cartModel.findOne({ userId }).populate('items.productId').select({ __v: 0 });
        return res.status(201).send({ status: true, message: "Success", data: cartData });

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    };
};

//=============== Remove Products from Cart ================== //
const removeItems_FromCart = async (req, res) => {
    try {
        let userId = req.params.userId;
        let { productId, cartId, removeProduct } = req.body;

        // If body is empty
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Please provide product details" });
        };

        // If productId is missing
        if (!productId) {
            return res.status(400).send({ status: false, message: "Please provide productId" });
        };

        // If cartId is missing
        if (!cartId) {
            return res.status(400).send({ status: false, message: "Please provide cartId" });
        };

        // If number of remove products is missing
        if (!Object.keys(req.body).includes('removeProduct')) {
            return res.status(400).send({ status: false, message: "Please provide removeProduct" });
        };

        // If productId is invalid
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Ivalid productId" });
        };

        // If cartId is invalid
        if (cartId && !isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Ivalid cartid" });
        };

        // DB call to check cart exist or not
        let cartExist = await cartModel.findOne({ _id: cartId });
        if (!cartExist) {
            return res.status(404).send({ status: false, message: "cart not found" });
        };

        let cartObj = cartExist.toObject();
        let quantity;
        cartObj.items.map(x => { if (x.productId == productId) quantity = x.quantity });

        // If number of remove product is greater than product quantity or zero
        if (removeProduct > quantity || removeProduct <= 0) {
            return res.status(400).send({ status: false, message: "removeProduct must be within the range of 1 to product quantity" });
        };

        // DB call to check product exist or not
        let productExist = await productModel.findOne({ _id: productId });
        if (!productExist) {
            return res.status(404).send({ status: false, message: "product not found" });
        };

        if (cartId) {
            let usersCart = await cartModel.findOne({ _id: cartId, userId: userId });

            // If cartId doesn't belongs to logged in user
            if (!usersCart) {
                return res.status(400).send({ status: false, message: "Cart doesn't belongs to this user" });
            };
        };

        // If cart is already empty
        if (cartExist.totalItems == 0) {
            return res.status(400).send({ status: false, message: "cart is empty... add items into cart" });
        }

        let itemId;
        cartObj.items.map(x => { if (x.productId == productId) itemId = x._id });
        if (!itemId) {
            return res.status(404).send({ status: false, message: "Product not found" });
        };

        // If number of remove produts is less than product quantity
        if (removeProduct < quantity) {
            let updatedCart = await cartModel.findOneAndUpdate(
                { _id: cartId, "items.productId": productId },
                { $inc: { "items.$.quantity": -(removeProduct), totalPrice: -((productExist.price) * removeProduct) } },
                { new: true }
            ).populate('items.productId').select({ __v: 0 });
            return res.status(200).send({ status: true, message: "Success", data: updatedCart });

        }
        // If number of remove products is equal to product quantity
        else if (removeProduct == quantity) {
            let updatedCart = await cartModel.findOneAndUpdate(
                { _id: cartId },
                {
                    $pull: {
                        items: { _id: itemId }
                    },
                    $inc: { totalPrice: -((productExist.price) * quantity), totalItems: -1 }
                }, { new: true }
            ).populate('items.productId').select({ __v: 0 });
            return res.status(200).send({ status: true, message: "Success", data: updatedCart });
        };

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    };
};

//=============== Export Module ================== //
module.exports = { createCart_Or_addItems, removeItems_FromCart };