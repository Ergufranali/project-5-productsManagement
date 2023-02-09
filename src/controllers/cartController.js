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

            let newCart = await cartModel.create({
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

exports.getCart = async function(req,res){
    try {
        const userId = req.params.userId;

        const cart = await cartModel.findOne({userId});
        if(!cart) return res.status(404).send({status: false, message: "Cart not found"});
        res.status(200).send({status: true, message: "Cart details", data: cart});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

exports.updateCart = async function (req, res) {
    try {
        const { productId, cartId, removeProduct } = req.body;
        if (!productId) return res.status(400).send({ status: false, message: "Please provide productId." });
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please provide valid productId." });
        if (!cartId) return res.status(400).send({ status: false, message: "Please provide cartId." });
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cartId." });
        if (!removeProduct && removeProduct!==0) return res.status(400).send({ status: false, message: "Please provide removeProduct." });
        if (removeProduct != 0 && removeProduct != 1) return res.status(400).send({ status: false, message: "Remove product can be 0 or 1." });

        const product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) return res.status(404).send({ status: false, message: "Product not found." });

        let cart = await cartModel.findById(cartId).lean();
        if (!cart) return res.status(404).send({ status: false, message: "Cart not found" });

        let productIndex = cart.items.findIndex(x => x.productId == productId);
        if (productIndex == -1) return res.status(404).send({ status: false, message: "This product is not there is cart." });

        if (removeProduct == 0 || cart.items[productIndex].quantity == 1) {
            cart.totalItems--;
            cart.totalPrice -= cart.items[productIndex].quantity * product.price;
            cart.items.splice(productIndex, 1);
        } else {
            cart.totalPrice -= product.price;
            cart.items[productIndex].quantity--;
        }

        const newCart = await cartModel.findByIdAndUpdate(cartId, cart, { new: true });
        res.status(200).send({ status: true, message: "The item removed from cart.", data: newCart });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

exports.deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId;

        const cart = await cartModel.findOneAndUpdate({ userId }, { items: [], totalItems: 0, totalPrice: 0 });
        if (!cart) return res.status(404).send({ status: false, message: "Cart not found." });
        res.status(200).send({ status: true, message: "cart deleted successfully." });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}