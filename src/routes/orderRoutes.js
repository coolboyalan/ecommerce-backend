import orderController from "../controllers/orderController.js";
import express from "express";
import httpStatus from "http-status";

const router = express.Router();

router.route("/:userId").put(updateOrder).post(createOrder);

async function updateOrder(req, res, next) {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const updatedOrder = await orderController.updateOrder(userId, updateData);
    res.status(httpStatus.OK).json(updatedOrder);
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const { userId } = req.params;
    const order = await orderController.createOrder(userId);
    res.status(httpStatus.CREATED).json(order);
  } catch (err) {
    next(err);
  }
}

export default router;
