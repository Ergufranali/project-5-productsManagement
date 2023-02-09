const productModel = require("../models/productModel");
const { uploadFile } = require("../aws/awsUpload");
const { isValidProduct } = require('../validator/validator');
const { isValidObjectId } = require('mongoose');
const check = require("../validator/validator");

//============================Create-Product================================================

exports.createProduct = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) { return res.status(400).send({ status: "false", message: "All fields are mandatory" }); }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        const image = req.files

        // title ==============================================================================
        if (!title) return res.status(400).send({ status: false, message: "title is mandotary" })
        if (!check.isEmpty(title)) return res.status(400).send({ status: false, message: "title is not valid" })
        title = title.toLowerCase();

        const checkUsedTitle = await productModel.findOne({ title: title });
        if (checkUsedTitle) {
            return res.status(400).send({ status: false, message: "title already exists" });
        };

        // discription //
        if (!description) return res.status(400).send({ status: false, message: "description is mandotary" });
        if (!check.isEmpty(description)) return res.status(400).send({ status: false, message: "please enter valid discription" });

        //price //
        if (!price) return res.status(400).send({ status: false, message: "price is required" });
        if (!check.isvalidNumber(price)) return res.status(400).send({ status: false, message: "price only in Number format" });

        // currencyID//
        if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is required" });
        if (!check.isEmpty(currencyId)) return res.status(400).send({ status: false, message: "please enter valid currnecyId" });
        if (currencyId!="INR") return res.status(400).send({ status: false, message: "currency id should be INR only." });

        // currencyFormat
        if (currencyFormat) {
            if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyFormat is required" });
            if (!check.isEmpty(currencyFormat)) return res.status(400).send({ status: false, message: "please enter valid currencyFormat" });
            if (currencyFormat!="₹") return res.status(400).send({ status: false, message: "currency format should be ₹ only." });
        }

        // freeShipping//
        if (isFreeShipping) {
            if (!["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping only in booleans" });
        }
        // validation for IMG /AWS
        if (image && image.length == 0)
            return res.status(400).send({ status: false, message: "profile image should be required" })
        else if (!check.isValidImage(image[0].originalname))
            return res.status(400).send({ status: false, message: "profile image as required as an Image Format" })
        else productImage = await uploadFile(image[0]);

        // style //
        if (style) {
            if (!check.isEmpty(style)) return res.status(400).send({ status: false, message: "please enter valid style" })
        }

        // available-sizes //
        if (availableSizes) {
            availableSizes = availableSizes.split(",").filter((size) => {
                const sizes = size.trim();
                return ((sizes) && ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes))
            });
            if (availableSizes.length == 0) return res.status(400).send({ status: false, message: "available sizes should be  valid format and should be S, XS , M,X, XXL, XL" });
            availableSizes = availableSizes.map(x => x.trim())
        }

        // installment //
        if (installments) {
            if (!check.isvalidNumber(installments)) return res.status(400).send({ status: false, message: "installment is not a number" })
        }

        let product = {
            title, description, price, currencyId, currencyFormat, isFreeShipping, productImage: productImage, style, availableSizes, installments
        }

        const productData = await productModel.create(product);
        return res.status(201).send({ status: true, message: "Success", data: productData })

    } catch (error) {
        return res.status(500).send({ status: "false", msg: error.message });
    }
}

// =======================================GET-PRODUCT==================================================

exports.getProducts = async function (req, res) {
    try {
        let query = req.query;
        if(query.priceGreaterThan && query.priceGreaterThan != NaN) return res.status(400).send({status: false, message: "priceGreaterThan should be neumaric."})
        if(query.priceLessThan && query.priceLessThan != NaN) return res.status(400).send({status: false, message: "priceLessThan should be neumaric."})

        if(query.priceSort && (query.priceSort != 1 || query.priceSort != -1)) return res.status(400).send({status:false, message: "PriceSort must be number 1 or -1"})

        let data = {};
        if (query) {
            if (query.name) data.title = { $regex: query.name.toLowerCase().trim() };
            if (query.size) data.availableSizes = query.size.toUpperCase();
            
            if (query.priceGreaterThan && query.priceLessThan) data.price = { $gt: query.priceGreaterThan, $lt: query.priceLessThan };
            else if (query.priceGreaterThan) data.price = { $gt: query.priceGreaterThan };
            else if (query.priceLessThan) data.price = { $lt: query.priceLessThan };
        }

        const products = await productModel.find(data).sort({ price: (query.priceSort < 0 ? -1 : 1) });

        if (!products.length) return res.status(404).send({ status: false, message: "No any product found." });
        res.status(200).send({ status: true, message: "Products", data: products });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
// ==================GET products By ID===================================================
exports.getProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" });
        const product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) return res.status(404).send({ status: false, message: "No item found." });
        res.status(200).send({ status: true, message: "Product details", data: product });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


// Update products ================================================================================
exports.updateProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" });

        const data = req.body;
        let obj = {}
        if (data.availableSizes) data.availableSizes = data.availableSizes.split(",").map(x => x.trim().toUpperCase()).filter(x => (x != ""));
        if (data.title) data.title = data.title.toLowerCase();
        const fields = ["title", "description", "price", "currencyId", "currencyFormat", "availableSizes", "isFreeShipping", "installments"];
        for (let i = 0; i < fields.length; i++) {
            if (data[`${fields[i]}`] && !isValidProduct[`${fields[i]}`](data[`${fields[i]}`]))
                return res.status(400).send({ status: false, message: `Please provide valid ${fields[i]}.` });
            if (data[`${fields[i]}`]) obj[`${fields[i]}`] = data[`${fields[i]}`];
        }
        if (req.files && req.files[0]) {
            if (req.files[0] && !isValidProduct(req.files[0]))
                return res.status(400).send({ status: false, message: "Please provide valid profileImage." });
            data.profileImage = await uploadFile(req.files[0]);
        }

        if (!Object.keys(obj).length && !(req.files && req.files[0]))
            return res.status(400).send({ status: false, message: "Please provide any field that you want to update." });

        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false }, obj,{ new: true });
        if (!updatedProduct) return res.status(404).send({ status: false, message: "Product not found." });
        res.status(200).send({ status: true, message: "Product detail updated successfully", data: updatedProduct });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

// ===================================Delete Product ======================================================
exports.deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" });
        const deletedProduct = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            { isDeleted: true, deletedAt: Date.now() },
            { new: true }
        );
        if (!deletedProduct) return res.status(404).send({ status: false, message: "Product not found." });
        res.status(200).send({ status: true, message: "Product deleted successfully", data: deletedProduct });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}