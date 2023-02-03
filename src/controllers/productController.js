const productModel = require ("../models/productModel");
const {uploadFile} = require("../aws/awsUpload");
const check = require("../validator/validator");



//============================Create-Product=============

exports.createProduct = async function (req,res){
    try{
        let data = req.body
        if (Object.keys(data).length == 0) {return res.status(400).send({ status: "false", message: "All fields are mandatory" }); }
        
        let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments} =data


        const image = req.files
        // title -------------
        if(!title) return res.status(400).send({status:false, message:"title is mandotary"})
        if(!check.isEmpty(title)) return res.status(400).send({status:false, message:"title is not valid"})

        const  checkUsedTitle = await productModel.findOne({title:title});
            if(checkUsedTitle){
                return res.status(400).send({status:false, message:"title already exists"})
            };

            // discription //
         if(!description) return res.status(400).send({status:false, message:"description is mandotary"})
         if(!check.isEmpty(description)) return res.status(400).send({status:false, message:"please enter valid discription"})

         //price //
         if(!price) return res.status(400).send({status:false, message:"price is required"})
         if(!check.isvalidNumber(price)) return res.status(400).send({status:false, message:"price only in Number format"})

         // currencyID//
         if(!currencyId) return res.status(400).send({status:false, message:"currencyId is required"})
         if(!check.isEmpty(currencyId)) return res.status(400).send({status:false, message:"please enter valid currnecyId"})
         if(!["INR","USD", "EUR"].includes(currencyId)) return res.status(400).send({status:false, message:"currency format should be [INR,USD,EUR format"})

         // currencyFormat
         if(currencyFormat){
            if(!currencyFormat) return res.status(400).send({status:false, message:"currencyFormat is required"})
            if(!check.isEmpty(currencyFormat)) return res.status(400).send({status:false, message:"please enter valid currencyFormat"})
            if(!["₹","$", "€"].includes(currencyId)) return res.status(400).send({status:false, message:"currency format should be [₹,$,€ format"})
         }
         
         // freeShipping//
         if(isFreeShipping){
            if(!["true","false"].includes(isFreeShipping)) return res.status(400).send({status:false, message:"isFreeShipping only in booleans"})
         }

         //image//

        //  if(image && image.length == 0)
        //     return res.status(400).send({status:false, message:"profile image should be required"})
        //  else if(!check.isValidImage(image[0].originalname)) 
        //     return res.status(400).send({status:false, message:"profile image as required as an Image Format"})
        //  else productImage = await uploadFile(image[0]);

         // style //
         if(style){
            if(!check.isEmpty(style)) return res.status(400).send({status:false, message:"please enter valid style"})
         }

         // available-sizes //
         if(availableSizes){
            availableSizes = availableSizes.split(" ").filter((size) =>{
                const sizes = size.trim();
                return (check.isEmpty(sizes) && ["S", "XS","M","X", "L","XXL", "XL"].includes(sizes))
            });
            if(availableSizes.length ==0 ) return res.status(400).send({status:false, message: "available sizes should be  valid format and should be S, XS , M,X, XXL, XL"});
         }

         // installment //
         if(installments){
            if(!check.isvalidNumber(installments)) return res.status(400).send({status:false, message:"installment is not a number"})
         }

         let product = {
                    title, description,price, currencyId ,currencyFormat, isFreeShipping ,productImage: data.productImage , style,
                    availableSizes, installments
         }
        
         const productData = await productModel.create(product);
         return res.status(201).send({status:true, message:"Success", data:productData})

    }catch (error) {
    return res.status(500).send({ status: "false", msg: error.message });
  }
}


// =======================================GET-PRODUCT=========================================================================

const getProduct = async function (req,res){
    try{

        let queries = req.query

        let getProducts = await productModel.find({isDeleted: false})

        if(getProducts.length == 0){
            return res.status(404).send({status:false, message:"No product found"})
        }

        if(queries){
            if(queries.size && queries.name && queries.priceGreaterthan){
                let combination = await productModel.find({availableSizes:queries.size, title:{ $regex: queries.name}, price:{$gt: queries.priceGreaterthan}})
                return combination.length == 0 ? res.status(404).send({status:false, message:"No product found"}) : res.status(200).send({status:false, message:"Success", data: combination})
            }
        }

        if(queries.size){
            let sizes = queries.size.split(',')
            let getBySize = await productModel.find({isDeleted:false, availableSizes:{$in: sizes}})
            return getBySize.lenth == 0 ? res.status(404).send({status:false, message:"no product found"}) : res.status(200).send({status:true, message:"success", data:getBySize})

        }

        if(queries.name){
            let getByName = await productModel.find({isDeleted:false,title:{ $regex: queries.name},})
            return getByName.length == 0 ? res.status(404).send({status:false, message:"no product found"}): res.status(200).send({status:true, message:"success", data:getByName})
        }

        if(queries.priceGreaterthan){
            let getbyPriceGt = await productModel.find({isDeleted:false,title:{ $gt: queries.priceGreaterthan},})
            return getbyPriceGt.length == 0 ? res.status(404).send({status:false, message:"no product found"}): res.status(200).send({status:true, message:"success", data:getbyPriceGt})
        }

        if(queries.priceLessThan){
            let getbyPriceLt = await productModel.find({isDeleted:false,title:{ $lt: queries.priceLessThan},})
            return getbyPriceLt.length == 0 ? res.status(404).send({status:false, message:"no product found"}): res.status(200).send({status:true, message:"success", data:getbyPriceLt})
        }

        let priceSort = queries.priceSort
        if (priceSort) {
            let pricesort = await productModel.find({isDeleted:false,}).sort({price: priceSort})
            return pricesort.length == 0? res.status(404).send({status:false, message:"no product found"}): res.status(200).send({status:true, message:"success", data:pricesort})
        }

        return res.status(200).send({status:true, messgae:"success", data:getProduct})
    }catch(error){
        return res.status(500).send({ status: "false", msg: error.message });
      }
}