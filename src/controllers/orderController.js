const orderModel = require("../models/orderModel")
const cartModel = require("../models/cartModel")
const { isValidObjectId } = require('mongoose');
const check = require('../validator/validator');

// ============================================================Create Order =================================================================

exports.createOrder = async function (req, res) {
    try {
        let data = req.body;

        let userId = req.params.userId;

        let { cartId, cancellable } = data;

        if (!Object.keys(data).length) {
            return res.status(400).send({ status: false, message: "Please provide some details in requiest body." });
        }

        if (!cartId) return res.status(400).send({ status: false, message: "cart id is required." });
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cart id." });

        let cart = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!cart) return res.status(404).send({ status: false, message: "Cart not found by this user." });

        if (cancellable) {
            if (!["true", "false"].includes(cancellable)) return res.status(400).send({ status: false, message: "cancellable can be boolean only." });
        }

        let { items, totalPrice, totalItems } = cart;

        let totalQuantity = 0;
        items.forEach(x => totalQuantity += x.quantity);

        let obj = {
            userId,
            items,
            totalPrice,
            totalItems,
            totalQuantity,
            cancellable
        }

        if (cart.items.length == 0) return res.status(400).send({ status: true, message: "Cart is empty." });

        let order = await orderModel.create(obj);

        await cartModel.updateOne({ userId: userId }, { items: [], totalItems: 0, totalPrice: 0 });

        return res.status(200).send({ status: true, message: "Order created successfully.", data: order });
    } catch (error) {
        res.status(500).send({ status: true, message: error.message });
    }
}

exports.updateOrder = async function (req, res) {
    try {
        userId = req.params.userId;

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, messgae: "Body is empty" });

        let { orderId, status } = req.body;

        if (!check.isEmpty(orderId)) return res.status(400).send({ status: false, message: "please enter orderId" });
        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Please enter valid OrderId" });

        if (!check.isEmpty(status)) return res.status(400).send({ status: false, message: "status is required." });

        if (!["completed", "cancelled"].includes(status)) return res.status(400).send({ status: false, message: "Status can only be updated to cancelled or complte" });

        let Order = await orderModel.findOne({ _id: orderId, isDeleted: false, status: "pending" });
        if (!Order) return res.status(404).send({ status: false, message: "order not found " });

        if (Order.userId != userId) return res.status(403).send({ status: false, message: "user not authorised to update this order" });

        if (Order.cancellable == false && status == "cancelled") return res.status(400).send({ status: false, message: "this order cannot be cancelled" });

        let updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true });
        return res.status(200).send({ status: true, message: "Success", data: updateOrder });

    } catch (error) {
        res.status(500).send({ status: true, message: error.message });
    }
}