const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.post('/register', userController.createUser);
router.post('/login', userController.userLogin);

router.all('/*', (req,res)=>res.status(404).send({status: false, message: "Page not found."}));

module.exports = router;