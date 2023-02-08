const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    currencyId: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
    },
    currencyFormat: {
      type: String,
      default: "₹",
    },
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
    productImage: {
      type: String,
    //   required: true,
    },
    style: {
      type: String,
    },
    availableSizes: {
      type: [String],
      enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
      uppercase: true,
      trim: true,
    },
    installments: { type: Number },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
