// function isName(name){
//     return /^[A-Za-z ]{3,30}$/.test(name);
// }

// function isPhone(phone){
//     return /^(0|91)?[6-9][0-9]{9}}$/.test(phone);
// }

// function isPincode(pincode){
//     return /^[0-9]{6}$/.test(pincode);
// }

function isValidPassword(password){
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password);
}

// function isEmail(email){
//     return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/.test(email);
// }

// function isStreet(street){
//     return /^[A-Za-z0-9][\w\.,-:\/]{0,}$/.test(street);
// }

// module.exports = {isName, isPhone, isPincode, isPassword, isEmail, isStreet};

// const mongoose = require("mongoose");

//validations---------------------->>>

//Value Validation
const isEmpty = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

//isValidNumber
const isvalidNumber = function (value) {
  return /^(?:0|[1-9]\d*)(?:\.(?!.*000)\d+)?$/.test(value);
}

// Vlidation for objectId
const isValidObjectId = (objectId) => {
  return mongoose.Types.ObjectId.isValid(objectId);
};

//Name Validation
const isValidName = function (name) {
  const nameRegex = /^[a-zA-Z ]+$/;
  return nameRegex.test(name);
};

// Email Validation
const isValidEmail = function (email) {
  const emailRegex =
    /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
  return emailRegex.test(email);
};

//Phone Validation
const isValidPhone = function (phone) {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// pincode Validation
const isValidpincode = function (pincode) {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

//validation for Input Body
const isValidInputBody = function (object) {
  return Object.keys(object).length > 0;
};

const isValidImage = function (value) {
  const r = /\.(gif|jpe?g|tiff?|png|webp|temp)$/
  return r.test(value)
}

const isValidStreet = function (street) {
  let streets = /^[#.0-9a-zA-Z\s,-]+$/;
  return streets.test(street);
};

//Price Validation
const isValidPrice = function (price) {
  return /^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price);
};
//Valid Sizes
const validSize = function (size) {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size);
};

//Style Validation
const isValidStyle = function (value) {
  return /^[a-zA-Z _.-]+$/.test(value);
};

//Price validation
const validPrice = function (price) {
  return /^\d{0,8}(\.\d{1,4})?$/.test(price);
};

exports.isValidProduct = {
  title: function (title) {
      return /^[A-Za-z][A-Za-z' ]{2,30}$/.test(title);
  },

  description: function (description) {
      return /^[A-Za-z][A-Za-z',-: ]{2,50}$/.test(description);
  },

  price: function (price) {
      return price != NaN;
  },

  currencyId: function (currencyId) {
      return currencyId == "INR";
  },

  currencyFormat: function (currencyFormat) {
      return currencyFormat == "₹";
  },

  isFreeShipping: function (isFreeShipping) {
      if(!isFreeShipping) return true;
      return typeof isFreeShipping == "boolean";
  },

  productImage: function(image){
      return /.*\w.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/.test(image.originalname);
  },

  availableSizes: function (size) {
      const sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      for (let i = 0; i < size.length; i++) {
          if (!sizes.includes(size[i])) return false;
      }
      return true;
  },

  installments: function (installments) {
      if(!installments) return true;
      return installments != NaN;
  }
}

module.exports = {
  isEmpty,
  validSize,
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidInputBody,
  isValidpincode,
  isValidObjectId,
  isValidImage,
  isValidStreet,
  isValidPrice,
  isValidStyle,
  validPrice,
  isValidPassword,
  isvalidNumber
};