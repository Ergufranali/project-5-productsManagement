const orderModel = require("../models/orderModel")
const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const validation = require("../validator/validator");

const { isEmpty, isValidObjectId } = validation;

//=====================================> CREATE ORDER <=======================================//

const createOrder = async function (req, res){
    try {

        let userId = req.params.userId


        if(!isValidObjectId(userId)){
            return res.status(400).send({ status : false, message : "UserId is not valid"})
        }

        let findUser = await userModel.findOne({ userId})
        if(!findUser){
            return res.status(400).send({ status : false, message : "This user is not found"})
        }

        let data = req.body

        if (Object.keys(data).length == 0){
            return res.status(400).send({ status: false, message: "Body cannot be empty" });
        }

        let {cartId} = data

        if(!isEmpty(cartId)){
            return res.status(400).send({ status : false, message : "cartId is mandatory"})
        }

        if(!isValidObjectId(cartId)){
            return res.status(400).send({ status : false, message : "CartId is not valid"})
        }

        let findCart = await cartModel.findOne({cartId })
        if (!findCart) {
            return res.status(400).send({ status: false, message: "This cartId doesn't exist" })
        }

        const cartCheck = findCart.items.length
        if (cartCheck == 0) {
            return res.status(404).send({ message: "The cart is empty please add product to proceed your order" })
        }

        let { items, totalPrice, totalItems } = findCart

        let totalQuantity = 0
        let totalItem = items.length
        for (let i = 0; i < totalItem; i++) {
            totalQuantity = totalQuantity + Number(items[i].quantity)
        };

        let myOrder = { userId, items, totalPrice, totalItems, totalQuantity }

        let order = await orderModel.create(myOrder)
        await cartModel.findOneAndUpdate({ _id: cartId, userId:userId }, { items: [], totalItems: 0, totalPrice: 0 })

        return res.status(201).send({ status: true, message: 'Success', data: order });
    }
    catch (error) {
        res.status(500).send({ status : false, message : error.message})
    }
}

//============================================> UPDATE ORDER <=======================================//

const cancelOrder = async function (req, res){
    try {

        let data = req.body
        let userId = req.params.userId

        let{ orderId, status} = data


        if(!isEmpty(userId)){
            return res.status(400).send({ status : false, message : "UserId is missing in params"})
        }

        if(!isValidObjectId(userId)){
            return res.status(400).send({ status : false, message : "UserId is not valid"})
        }

        let userCheck = await userModel.findOne({userId})
        if(!userCheck){
            return res.status(400).send({ status : false, message : "This userId is not found"})
        }

         if(!orderId){
            return res.status(400).send({ status : false, message : "OrderId is missing"})
         }

        let productId = req.body.orderId;

        let newStatus = {}
        if(status){
            if(!(status =="completed" || status == "cancelled")){
                return res.status(400).send({ status : false, message : "status can be from enum only"})
            }else{
                newStatus.status = status
            }
        }

        const orderCancel = await orderModel.findOneAndUpdate({ _id: productId },newStatus,{ new: true });
        return res.status(200).send({ status: true, message: "Success", data: orderCancel });
    }catch(err){
        res.status(500).send(err.message);
    }
};

module.exports = { createOrder, cancelOrder }