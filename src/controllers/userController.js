// const userModel = require('../models/userModel');
// const {isName, isPhone, isPincode, isPassword, isEmail, isStreet} = require('../validator/validator');

// exports.createUser = async function(req, res){
//     try {
//         const data = req.body;
//         const profileImage = req.files[0];
//         const fields = ["fname", "lname", "email", "phone", "password", "address"];
//         fields.forEach(x=>{
//             if(!data[`${fields[i]}`])
//                 return res.status(400).send({status: false, message: `${fields[i]} is required.`});
//         });
//         if(!profileImage) return res.status(400).send({status: false, message: `profileImage is required.`});

//         if(!isName(data.fname)) return res.status(400).send({status: false, message: `Invalid fname.`});
//         if(!isName(data.lname)) return res.status(400).send({status: false, message: `Invalid lname.`});
//         if(!isEmail(data.email)) return res.status(400).send({status: false, message: `Invalid email.`});
//         if(!isPhone(data.phone)) return res.status(400).send({status: false, message: `Invalid phone.`});
//         if(!isPassword(data.password)) return res.status(400).send({status: false, message: `Invalid password.`});

//         if(!data.address.shipping) return res.status(400).send({status: false, message: `shipping address is required.`});
//         if(!data.address.billing) return res.status(400).send({status: false, message: `billing address is required.`});

//         if(!data.address.shipping.street) return res.status(400).send({status: false, message: `shipping street is required.`});
//         if(!data.address.billing.street) return res.status(400).send({status: false, message: `billing street is required.`});
        
//         if(!data.address.shipping.city) return res.status(400).send({status: false, message: `shipping city is required.`});
//         if(!data.address.billing.city) return res.status(400).send({status: false, message: `billing city is required.`});

//         if(!data.address.shipping.pincode) return res.status(400).send({status: false, message: `shipping pincode is required.`});
//         if(!data.address.billing.pincode) return res.status(400).send({status: false, message: `billing pincode is required.`});

//         if(!isPincode(data.address.shipping.pincode)) return res.status(400).send({status: false, message: `Invalid shipping pincode.`});
//         if(!isPincode(data.address.billing.pincode)) return res.status(400).send({status: false, message: `Invalid billing pincode.`});

//         if(!isName(data.address.shipping.city)) return res.status(400).send({status: false, message: `Invalid shipping city.`});
//         if(!isName(data.address.billing.city)) return res.status(400).send({status: false, message: `Invalid billing city.`});

//         if(!isStreet(data.address.shipping.street)) return res.status(400).send({status: false, message: `Invalid shipping street.`});
//         if(!isStreet(data.address.billing.street)) return res.status(400).send({status: false, message: `Invalid billing street.`});

//         const user = await userModel.findOne({$or: [{email: data.email}, { phone: data.phone}]});
//         if(user){
//             if(user.email==data.emil) return res.status(400).send({status: false,  message: "email already registered."});
//             return res.status(400).send({status: false,  message: "phone already registered."});
//         }

//         const newUser = await userModel.create(data);
//         res.status(201).send({status: true, message: "Your profile created successfully.", data: newUser});
//     } catch (error) {
//         res.status(500).send({status: false, message: error.message});
//     }
// }

const userModel = require("../models/userModel");
const {uploadFile} = require("../aws/awsUpload");
const validation = require("../validator/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let {isEmpty, isValidName, isValidPhone, isValidpincode, isValidObjectId, isValidStreet} = validation;

// ==========================================> CREATE USER <=================================//

exports.createUser = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;
    //console.log(files)

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: "false", message: "All fields are mandatory" });
    }

    let { fname, lname, email, phone, password, address, profileImage } = data;
    if (!isEmpty(fname)) {
      return res.status(400).send({status: "false", message: "fname must be present"});
    }
    if (!isEmpty(lname)) {
      return res.status(400).send({status: "false", message: "lname must be present"});
    }
    if (!isEmpty(email)) {
      return res.status(400).send({status: "false", message: "email must be present"});
    }
    if (!isEmpty(phone)) {
      return res.status(400).send({status: "false", message: "phone number must be present"});
    }
    if (!isEmpty(password)) {
      return res.status(400).send({status: "false", message: "password must be present"});
    }
    if (!isEmpty(address)) {
      return res.status(400).send({status: "false", message: "Address must be present"});
    }
    if (!isValidName(lname)) {
      return res.status(400).send({status: "false", message: "last name must be in alphabetical order"});
    }
    if (!isValidPhone(phone)) {
      return res.status(400).send({ status: "false", message: "Provide a valid phone number" });
    }
    if( password.length < 8 || password.length > 15){
      return res.status(400).send({ status: false, message: "Length of password is not correct" })
    }
    if (!isValidName(fname)) {
      return res.status(400).send({status: "false",message: "first name must be in alphabetical order"});
    }

    // ------- Address Validation  --------
    if (address) {
      data.address = JSON.parse(data.address);
      if(address.shipping) {
        if (!isEmpty(address.shipping.street)) {
          return res.status(400).send({status: "false", message: "street must be present"});
        }
        if (!isEmpty(address.shipping.city)) {
          return res.status(400).send({ status: "false", message: "city must be present" });
        }
        if (!isEmpty(address.shipping.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode must be present" });
        }
        if (!isValidStreet(address.shipping.street)) {
          return res.status(400).send({status: "false",message: "street should include no. & alphabets only"});
        }
        if (!isValidName(address.shipping.city)) {
          return res.status(400).send({status: "false",message: "city should include alphabets only"});
        }
        if (!isValidpincode(address.shipping.pincode)) {
          return res.status(400).send({status: "false",message: "pincode should be digits only"});
        }
      }
      if (address.billing) {
        if (!isEmpty(address.billing.street)) {
          return res.status(400).send({status: "false", message: "street must be present"});
        }
        if (!isEmpty(address.billing.city)) {
          return res.status(400).send({status: "false", message: "city must be present"});
        }
        if (!isEmpty(address.billing.pincode)) {
          return res.status(400).send({status: "false", message: "pincode must be present"});
        }
        if (!isValidStreet(address.billing.street)) {
          return res.status(400).send({status: "false",message: "street should include no. and alphabets only"});
        }
        if (!isValidName(address.billing.city)) {
          return res.status(400).send({status: "false",message: "city should be in alphabetical order"});
        }
        if (!isValidpincode(address.billing.pincode)) {
          return res.status(400).send({status: "false",message: "pincode should be digits only"});
        }
      }
    }
    const saltRounds = await bcrypt.genSalt(10);
    console.log(saltRounds)
    const hash = await bcrypt.hash(password, saltRounds);
    data.password = hash;

    let checkEmail = await userModel.findOne({ email});
    if (checkEmail) {
      return res.status(400).send({status: "false", message: "Email is already in use"});
    }
    let checkPhone = await userModel.findOne({phone });
    if (checkPhone) {
      return res.status(400).send({status: "false", message: "Phone number is already in use"});
    }

    if(files.length===0){
      return res.status(400).send({ status : false, message : "Profile Image is mandatory"})
    }
    // if(files.fieldname=='profileImage'){
    //   return res.status(400).send({ status : false, message : "file name should be profile image"})
    // }

    // console.log(files)
    let profileImgUrl = await uploadFile(files[0])
        data.profileImage = profileImgUrl

    let savedUser = await userModel.create(data);
    return res.status(201).send({
      status: true,message: "user has been created successfully",data: savedUser});
    } catch (error) {
    return res.status(500).send({ status: "false", msg: error.message });
  }
};

// ==========================================> USER LOGIN <=================================//

exports.userLogin = async function(req,res){
    try {
        let data = req.body;
        let {email, password} = data;

        if(!email && !password) return res.status({status: false, message: "Please provide email & password."});
        if(!email) return res.status({status: false, message: "Please provide email."});
        if(!password) return res.status(400).send({status: false, message: "Please provide password."});

        let user = await userModel.findOne({email});

        if(!user) return res.status(404).send({status: false, message: "User not found."});

        let checkPassword = await bcrypt.compare(password, user.password);

        if(!checkPassword) return res.status(401).send({ status: false, message: "Incorrect password."});

        let token = jwt.sign(
            {
                id: user._id,
                iat: Math.floor(Date.now()/1000),
                exp: Math.floor(Date.now()/1000)+60*1
            },
            "secret-key"
        )

        res.setHeader("x-api-key", token);
        res.status(200).send({status: true, message: "Logged in successfully.", data: {userId: user._id, token: token}});

    } catch (error) {
        return res.status(500).send({ status: "false", msg: error.message });
    }
}