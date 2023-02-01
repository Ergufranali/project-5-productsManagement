const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fname: {
            type: String,
            required: true,
            trim: true,
        },

        lname: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            // valid
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        profileImage: {
            // s3 link
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            // valid
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        password: {
            // minlen 8, maxlen 15 // encrypted password
            type: String,
            required: true,
            trim: true,
        },

        address: {
            shipping: {
                street: {
                    type: String,
                    required: true,
                    trim: true,
                },
                city: {
                    type: String,
                    required: true,
                    trim: true,
                },
                pincode: {
                    type: Number,
                    required: true,
                    trim: true,
                },
            },
            billing: {
                street: {
                    type: String,
                    required: true,
                    trim: true,
                },
                city: {
                    type: String,
                    required: true,
                    trim: true,
                },
                pincode: {
                    type: Number,
                    required: true,
                    trim: true,
                },
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);