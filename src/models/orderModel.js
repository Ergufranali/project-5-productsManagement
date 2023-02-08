const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                productId: {
                    type: ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    min: 1,
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
        },
        totalQuantity: {
            type: Number,
            reuired: true,
        },
        cancellable: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            default: "pending",
            enum: ["pending", "completed", "cancelled"],
            trim: true,
        },
        deletedAt: {
            type: Date,
            default: Date.now(),
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", cartSchema);