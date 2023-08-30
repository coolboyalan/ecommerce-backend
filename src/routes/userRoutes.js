import express from "express";
import httpStatus from "http-status";
import userController from "../controllers/userController.js";
import { authentication } from "../auth/authentication.js";
import { authorization } from "../auth/authorization.js";

const router = express.Router();

router
  .route("/:userId/profile")
  .get(authentication, authorization, getUser)
  .put(authentication, authorization, updateUser);

router.post("/register", createUser);
router.post("/login", authentication, login);

async function getUser(req, res) {
  try {
    const { userId } = req.params;
    const user = await userController.getUser(userId);
    return res.status(httpStatus.OK).json(user);
  } catch (err) {
    console.log(err.message);
    throw new Error(err);
  }
}

async function createUser(req, res, next) {
  try {
    const userData = req.body;
    const user = await userController.createUser(userData);
    return res.status(httpStatus.CREATED).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res) {
  try {
    const userData = req.body;
    const { userId } = req.params;
    const user = await userController.updateUser(userId, userData);
    return res.status(httpStatus.OK).json(user);
  } catch (err) {
    throw new Error(err);
  }
}

async function login(req, res) {
  try {
    const userData = req.body;
    const loginData = await userController.login(userData);
    return res.status(httpStatus.OK).json(loginData);
  } catch (err) {
    throw new Error(err);
  }
}
export default router;
