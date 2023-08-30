import express from "express";
import httpStatus from "http-status";
import cartController from "../controllers/cartController.js";

const router = express.Router();

router
  .route("/:userId")
  .get(getCart)
  .put(updateCart)
  .post(createCart)
  .delete(deleteCart);

async function createCart(req, res) {
  try {
    const { userId } = req.params;
    const { productId } = req.body;
    const cart = await cartController.createCart(userId, productId);
    res.status(httpStatus.OK).json(cart);
  } catch (err) {
    throw new Error(err);
  }
}

async function getCart(req, res) {
  try {
    const { userId } = req.params;
    const cart = await cartController.getCart(userId);
    res.status(httpStatus.OK).json(cart);
  } catch (err) {
    throw new Error(err);
  }
}

async function updateCart(req, res, next) {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const updatedCart = await cartController.updateCart(userId, updateData);
    res.status(httpStatus.OK).json(updatedCart)
  } catch (err) {
    next(err);
  }
}

async function deleteCart(req, res) {
  try {
    const { userId } = req.params;
    await cartController.deleteCart(userId);
    res.status(httpStatus.ACCEPTED).json();
  } catch (err) {
    throw new Error(err);
  }
}

export default router;
