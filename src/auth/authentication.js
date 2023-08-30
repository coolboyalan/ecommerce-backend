import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function authentication(req, res, next) {
  try {
    const token = req.headers["authorization"];
    const jwtToken = token.split(" ")[1];

    let payload;
    try {
      payload = jwt.verify(jwtToken, "myKey");
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: err.message,
      });
    }

    const user = await UserModel.getUser(payload.userId);
    req.user = user;

    next();
  } catch (err) {
    throw new Error(err);
  }
}
