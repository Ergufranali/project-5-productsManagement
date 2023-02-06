const { isValidObjectId } = require('mongoose');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');

exports.createCart = async function(req,res){
    try {
        let userId = req.params.userId;
        let userCart = await cartModel.findOne({userId});
        let productId = req.body.productId;
        if(!userCart){
            if(!productId) return res.status(400).send({status: false, message: "Please provide productId."});
            if(!isValidObjectId(productId)) return res.status(400).send({status: false, message: "Please provide valid productId."});
        }

        let product = await productModel.findOne({_id: productId, isDeleted: false});
        if(!product) return res.status(404).send({status: false, message: "Product not found."});

        let obj = {
            productId: product._id,
            quantity: 1
        }

        let createCart = await cartModel.create({
            userId: userId,
            items: obj,
            totalPrice: product.price,
            totalItems: 1
        });

        return res.status(201).send({status: true, message: "Success", data: createCart});

        
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}