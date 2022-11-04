const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim:true
    },
    lname: {
      type: String,
      required: true,
      trim:true
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim:true
    },
    profileImage: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
      trim:true
    },
    password: {
      type: String,
      required: true,
      minLen: 8,
      maxLen: 15,
      trim:true
    },
    address: {
      shipping: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: Number, required: true },
      },
      billing: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: Number, required: true },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
