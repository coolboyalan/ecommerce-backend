import express from "express";
import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";

const router = express.Router();

router.use("/user/cart", cartRoutes);
router.use("/user/order", orderRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);

export default router;
