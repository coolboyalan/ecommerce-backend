import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const getUser = async (userId) => {
  try {
    const user = await UserModel.getUser(userId);
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const createUser = async (userData) => {
  try {
    const { password } = userData;
    const hashedPass = await bcrypt.hash(password, 10);
    userData.password = hashedPass;
    const user = await UserModel.create(userData);
    return user;
  } catch (err) {
    if (err.name === "MongoServerError" && err.code === 11000) {
      // Duplicate emailor phone
      const duplicateUserData = {};
      if ("email" in err.keyValue) {
        duplicateUserData.message = "This email is already in use";
      } else {
        duplicateUserData.message = "This phone is already in use";
      }
      duplicateUserData.status = 409;
      throw new Error(duplicateUserData);
    }
    throw new Error(err);
  }
};

const updateUser = async (userId, userData) => {
  try {
    const user = await UserModel.updateUser(userId, userData);
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const login = async (userData) => {
  try {
    const { email, password } = userData;
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error({
        status: 404,
        message: "There is no user with this email address",
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error({
        status: 401,
        message: "Incorrect Password",
      });
    }
    const { _id } = user;
    const token = jwt.sign({ userId: _id }, "myKey", { expiresIn: "1d" });
    const response = {
      status: true,
      message: "User logged in successfully",
      userId: _id,
      data: {
        userId: _id,
        token,
      },
    };
    return response;
  } catch (err) {
    throw new Error(err);
  }
};

export default {
  getUser,
  createUser,
  updateUser,
  login,
};
