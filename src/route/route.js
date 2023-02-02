const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const middleware = require('../middleware/auth')

router.post('/register', userController.createUser);
router.post('/login', userController.userLogin);

router.get('/test', middleware.authentication);

router.all('/*', (req,res)=>res.status(404).send({status: false, message: "Page not found."}));

module.exports = router;