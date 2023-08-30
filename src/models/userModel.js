import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLen: 8,
      maxLen: 15,
    },
    address: {
      shipping: AddressSchema,
      billing: AddressSchema,
    },
  },
  { timestamps: true }
);

UserSchema.statics.getUser = async function (userId) {
  try {
    const user = await this.findById({ _id: userId });
    if (user) return user;
    throw new Error({
      status: 404,
      message: `User not found`,
    });
  } catch (err) {
    return err;
  }
};

UserSchema.statics.updateUser = async function (userId, userData) {
  try {
    const updatedUser = await this.findByIdAndUpdate(
      { _id: userId },
      userData,
      { new: true }
    );
    return updatedUser
  } catch (err) {
    throw new Error(err);
  }
};

export default mongoose.model("user", UserSchema);
