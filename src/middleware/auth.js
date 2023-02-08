const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel')
const mongoose = require ("mongoose")
const {isValidObjectId} = mongoose

//<--------------------------------------------AUTHENTICATION---------------------------------------->//

exports.authentication = async function(req,res, next){
    try {
       let token = req.headers["authorization"]
       if(!token) return res.status(400).send({status:false, message:"token must be present , choose bearer token"})
       token = token.split(' ')[1]
    //    if(!token) return res.status(400).send({status:false, message:"Token must be present"})
       
       jwt.verify(token, 'secret-key', function(err,decode){
        if(err){
            return res.status(401).send({status:false, message:err.message})
        }else{

            req.decodedToken = decode;
            next()
        }
       })
       
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}



exports.authorisation = async function(req,res,next){
    try {
        const decoded = req.decodedToken;
        const userId = req.params.userId;
        if(!isValidObjectId(userId)) return res.status(400).send({status: false, message: "Invalid userId."});
        if(userId!=decoded.id) return res.status(403).send({status: false, message: "You are not authorised."});
        next();
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}