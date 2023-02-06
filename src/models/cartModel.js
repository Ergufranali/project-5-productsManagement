const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const cartSchema = mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        items: [
            {
                productId: {
                    type: ObjectId,
                    ref: "Product"
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalPrice: {
            type: Number,
            required: true,
        },
        totalItems: {
            type: Number,
            required: true
        }
    },
    { timestamps: true },
);

module.exports = mongoose.model("Cart", cartSchema);