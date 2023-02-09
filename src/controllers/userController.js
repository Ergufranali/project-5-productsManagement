const userModel = require("../models/userModel");
const { uploadFile } = require("../aws/awsUpload");
const validation = require("../validator/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let { isEmpty, isValidName, isValidPhone, isValidpincode, isValidStreet, isValidPassword } = validation;
const { isValidObjectId } = require('mongoose')

// ==========================================> CREATE USER <=================================//

exports.createUser = async function (req, res) {
  try {
    let data = req.body // data will come in req body
    let files = req.files; // for AWS

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: "false", message: "All fields are mandatory" });
    }

    let { fname, lname, email, phone, password, address } = data;  // destructuring

    // validation for keys
    if (!isEmpty(fname)) {
      return res.status(400).send({ status: "false", message: "fname must be present" });
    }
    if (!isEmpty(lname)) {
      return res.status(400).send({ status: "false", message: "lname must be present" });
    }
    if (!isEmpty(email)) {
      return res.status(400).send({ status: "false", message: "email must be present" });
    }
    if (!isEmpty(phone)) {
      return res.status(400).send({ status: "false", message: "phone number must be present" });
    }
    if (!isEmpty(password)) {
      return res.status(400).send({ status: "false", message: "password must be present" });
    }
    if (!isEmpty(address)) {
      return res.status(400).send({ status: "false", message: "Address must be present" });
    }
    if (!isValidName(lname)) {
      return res.status(400).send({ status: "false", message: "last name must be in alphabetical order" });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).send({ status: "false", message: "Provide a valid phone number" });
    }
    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({ status: false, message: "Length of password is not correct" })
    }
    if (!isValidName(fname)) {
      return res.status(400).send({ status: "false", message: "first name must be in alphabetical order" });
    }

    // ------- Address Validation  --------
    if (address) {
      data.address = JSON.parse(data.address);
      let { shipping, billing } = data.address;
      if (!shipping) return res.status(400).send({ status: "false", message: "shipping address must be present" });
      if (!billing) return res.status(400).send({ status: "false", message: "billing address must be present" });

      if (address.shipping) {
        if (!isEmpty(address.shipping.street)) {
          return res.status(400).send({ status: "false", message: "street must be present" });
        }
        if (!isEmpty(address.shipping.city)) {
          return res.status(400).send({ status: "false", message: "city must be present" });
        }
        if (!isEmpty(address.shipping.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode must be present" });
        }
        if (!isValidStreet(address.shipping.street)) {
          return res.status(400).send({ status: "false", message: "street should include no. & alphabets only" });
        }
        if (!isValidName(address.shipping.city)) {
          return res.status(400).send({ status: "false", message: "city should include alphabets only" });
        }
        if (!isValidpincode(address.shipping.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode should be digits only" });
        }
      }
      if (address.billing) {
        if (!isEmpty(address.billing.street)) {
          return res.status(400).send({ status: "false", message: "street must be present" });
        }
        if (!isEmpty(address.billing.city)) {
          return res.status(400).send({ status: "false", message: "city must be present" });
        }
        if (!isEmpty(address.billing.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode must be present" });
        }
        if (!isValidStreet(address.billing.street)) {
          return res.status(400).send({ status: "false", message: "street should include no. and alphabets only" });
        }
        if (!isValidName(address.billing.city)) {
          return res.status(400).send({ status: "false", message: "city should be in alphabetical order" });
        }
        if (!isValidpincode(address.billing.pincode)) {
          return res.status(400).send({ status: "false", message: "pincode should be digits only" });
        }
      }
    }

    // for encrypted password
    let hash = await bcrypt.hash(password, 10);
    data.password = hash;

    let checkEmail = await userModel.findOne({ email });
    if (checkEmail) {
      return res.status(400).send({ status: "false", message: "Email is already in use" });
    }
    let checkPhone = await userModel.findOne({ phone });
    if (checkPhone) {
      return res.status(400).send({ status: "false", message: "Phone number is already in use" });
    }

    if (files.length === 0) {
      return res.status(400).send({ status: false, message: "Profile Image is mandatory" })
    }
    if (files.fieldname != 'profileImage') {
      return res.status(400).send({ status: false, message: "file name should be profile image" })
    }

    let profileImgUrl = await uploadFile(files[0])
    data.profileImage = profileImgUrl

    let savedUser = await userModel.create(data);
    return res.status(201).send({
      status: true, message: "user has been created successfully", data: savedUser
    });
  } catch (error) {
    return res.status(500).send({ status: "false", msg: error.message });
  }
};

// ==========================================> USER LOGIN <=================================//

exports.loginUser = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    if (!email && !password) return res.status({ status: false, message: "Please provide email & password." });
    if (!email) return res.status({ status: false, message: "Please provide email." });
    if (!password) return res.status(400).send({ status: false, message: "Please provide password." });

    let user = await userModel.findOne({ email });

    if (!user) return res.status(404).send({ status: false, message: "User not found." });

    let checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) return res.status(401).send({ status: false, message: "Incorrect password." });

    let token = jwt.sign(
      {
        id: user._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60
      },
      "secret-key"
    )

    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, message: "Logged in successfully.", data: { userId: user._id, token: token } });

  } catch (error) {
    return res.status(500).send({ status: "false", msg: error.message });
  }
}


// Get User -----------------------------------------------------------------------------------

exports.user = async function (req, res) {
  try {
    let userId = req.params.userId

    if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid usere id" })

    let user = await userModel.findById(userId)

    if (!user) return res.status(404).send({ status: false, message: "User not found" })

    res.status(200).send({ status: true, message: "User profile details", data: user })
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

// ===========================Update user ======================================================

exports.updateUser = async function (req, res) {
  try {
    let userId = req.params.userId
    const files = req.files
    let userData = req.body

    if (Object.keys(userData).length == 0 && files == undefined) { return res.status(400).send({ status: false, message: "please enter some data to update" }) }

    let { fname, lname, email, password, address, phone } = userData;

    let user = await userModel.findById(userId).lean();
    if(!user) return res.status(400).send({status: false, message: "User not found."});

    if(fname){
      if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Fname should be valid" });
      user.fname = fname;
    }

    if(lname){
      if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Lname should be valid" });
      user.lname = lname;
    }

    if (email) {
      if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email should be valid" });

      let dublicateEmail = await userModel.findOne({ email: email });
      if (dublicateEmail) return res.status(400).send({ status: false, message: "this email already exists" });
      user.email = email;
    }

    if (Object.keys(userData).includes("password")) {
      if (password.length < 8 || password.length > 15) {
        return res.status(400).send({ status: false, message: "password length should be between 8 to 15" })
      }
      if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is not valid" })

      let saltRounds = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, saltRounds);
      user.password = password;
    }

    if (phone) {
      if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "phone number should be valid" });

      let dublicatePhone = await userModel.findOne({ phone: phone });
      if (dublicatePhone) return res.status(400).send({ status: false, message: "phone number already exists" });
      user.phone = phone;
    }

    if (address) {
      try {
        userData.address = JSON.parse(userData.address) //JSON parse convert data in javascript object

      } catch (error) {
        return res.status(400).send({ status: false, message: "address should be in JSON object only" })
      }

      if (typeof userData.address != "object") return res.status(400).send({ status: false, message: "Address should be in object format" });
      let { shipping, billing } = userData.address;

      if (shipping) {
        if (typeof shipping != "object") return res.status(400).send({ status: false, message: "enter shipping address in object format" });
        let { street, city, pincode} = shipping;

        if (street){
          if (!isValidStreet(street)) return res.status(400).send({ status: false, message: "Provide valid shipping street" });
          user.address.shipping.street = street;
        }
        if (city){
          if (!isValidName(city)) return res.status(400).send({ status: false, message: "Provide valid shipping city" });
          user.address.shipping.city = city;
        }
        if (pincode){
          if (!isValidpincode(pincode)) return res.status(400).send({ status: false, message: "please provide a valid shipping pincode" });
          user.address.shipping.pincode = pincode;
        }
      }

      if (billing) {
        if (typeof billing != "object") return res.status(400).send({ status: false, message: "enter billing address in object format" });
        let { street, city, pincode} = billing;

        if (street){
          if (!isValidStreet(street)) return res.status(400).send({ status: false, message: "Provide valid billing street" });
          user.address.billing.street = street;
        }
        if (city){
          if (!isValidName(city)) return res.status(400).send({ status: false, message: "Provide valid billing city" });
          user.address.billing.city = city;
        }
        if (pincode){
          if (!isValidpincode(pincode)) return res.status(400).send({ status: false, message: "please provide a valid billing pincode" });
          user.address.billing.pincode = pincode;
        }
      }
    }

    let updateUserData = await userModel.findOneAndUpdate({ _id: userId }, user, { new: true });
    return res.status(200).send({ status: true, message: "User profile updated", data: updateUserData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}