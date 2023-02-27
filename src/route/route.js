
//=============== Import Express ================== //
const express = require('express');

//=============== Use Router ================== //
const router = express.Router();

//=============== Import User Controller ================== //
const { newUser, userLogin } = require('../controllers/userController');

//=============== Import Product Controller ================== //
const { createProduct, getProduct } = require('../controllers/productController');

//=============== Import Cart Controller ================== //
const { createCart_Or_addItems, removeItems_FromCart } = require('../controllers/cartController');

//=============== Import Middleware ================== //
const { authentication, authorization } = require('../middlewares/auth');

// ===================================== API's ================================== //

//=============== User Register ================== //
router.post('/register', newUser);

//=============== User Login ================== //
router.post('/login', userLogin);

//=============== Create Product ================== //
router.post('/products', createProduct);

//=============== Get Product ================== //
router.get('/products', getProduct);

//=============== Create Cart ================== //
router.post('/cart/:userId', authentication, authorization, createCart_Or_addItems);

//=============== Update Cart ================== //
router.put('/cart/:userId', authentication, authorization, removeItems_FromCart);

//=============== Export Router ================== //
module.exports = router;