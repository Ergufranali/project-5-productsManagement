const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { isValidObjectId} = require('../validator/validator');

//<--------------------------------------------AUTHENTICATION---------------------------------------->//

exports.authentication = async function(req,res, next){
    try {
        const token = req.headers.authorization;
        if(!token) return res.status(400).send({status: false, message: "Please provide token."});
        const x = token.split(" ");
        const y = x[1];
        console.log(x,y);
        if(!y) return res.status(400).send({status: false, message: "Invalid token."});
        const tokenValidity = jwt.decode(y, "secrete-key");
        // const tokenTime = (tokenValidity.exp)*1000;
        // const createdTime = Date.now();
        if(createdTime>tokenTime) return res.status(400).send({status: false, message: "Token expired, login again."});
        jwt.verify(y, "secret-key", (err, decoded)=>{
            if(err) return res.status(401).send({status: false, message: "Invalid token."});
            req.decoded = decoded;
            res.send("login");
            // next();
        });
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

exports.authorisation = async function(req,res,next){
    try {
        const decoded = req.decoded;
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}