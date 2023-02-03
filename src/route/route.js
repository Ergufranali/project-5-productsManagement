const express = require('express');
const { createProduct } = require('../controllers/productController');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const middleware = require('../middleware/auth')
// ==============================================USER_API========================================================
router.post('/register', userController.createUser);
router.post('/login', userController.userLogin);
router.get('/user/:userId/profile',middleware.authentication,userController.user);
router.put('/user/:userId/profile',userController.updateUser)


//=============================================PRODUCT-API=======================================================

router.post('/products', productController.createProduct)

router.all('/*', (req,res)=>res.status(404).send({status: false, message: "Page not found."}));

module.exports = router;