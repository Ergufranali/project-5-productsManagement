const { isValidObjectId } = require('mongoose');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');

exports.createCart = async function(req,res){
    try {
        const userId = req.params.userId;
        const productId = req.body.productId;
        const cartId = req.body.cartId;
        if(!productId) return res.status(400).send({status: false, message: "Please provide productId."});
        if(!isValidObjectId(productId)) return res.status(400).send({status: false, message: "Please provide valid productId."});

        const product = await productModel.findOne({_id: productId, isDeleted: false});
        if(!product) return res.status(404).send({status: false, message: "Product not found."});

        if(cartId){
            if(!isValidObjectId(cartId)) return res.status(400).send({status: false, message: "Please provide valid cartId."});
            let cart = await cartModel.findById(cartId).lean();
            if(!cart) return res.status(404).send({status: false, message: "Cart not found."});
            if(cart.userId!=userId) return res.status(400).send({status: false, message: "You can add items to user cart only."});
            let productExist;
            for(let i=0;i<cart.items.length;i++){
                if(cart.items[i].productId == productId){
                    cart.items[i].quantity+=1;
                    cart.totalPrice += product.price;
                    cart.totalItems += 1;
                    productExist = true;
                    break;
                }
            }
            if(!productExist){
                cart.items.push({
                    productId,
                    quantity: 1
                });
                cart.totalPrice += product.price;
                cart.totalItems += 1;
            }
            var newCart = await cartModel.findByIdAndUpdate(cartId,cart,{new: true});
            res.status(200).send({status: true, message: "The item is added to your cart.", data: newCart});
        }else{
            let oldCart  = await cartModel.findOne({userId});
            if(oldCart) return res.status(400).send({status: false, message: "Please provide cartId."});

            var newCart = await cartModel.create({
                userId,
                items: [
                    {productId, quantity: 1}
                ],
                totalPrice: product.price,
                totalItems: 1
            });
            res.status(201).send({status: true, message: "The item is added to your cart.", data: newCart});
        }
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

exports.getcart = async function(req,res){
    try {
        const userId = req.params.userId;

        const cart = await cartModel.findOne({userId});
        if(!cart) return res.status(404).send({status: false, message: "Cart not found"});
        res.status(200).send({status: true, message: "Cart details", data: cart});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}