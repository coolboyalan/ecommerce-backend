import express from "express";
import httpStatus from "http-status";
import productController from "../controllers/productController.js";

const router = express.Router();

router.route("/").get(getProducts).post(createProduct);

router
  .route("/:productId")
  .get(getProductById)
  .put(updateProductById)
  .delete(deleteProductById);

async function getProducts(req, res) {
  try {
    const filters = req.query;
    const products = await productController.getProducts(filters);
    return res.status(httpStatus.OK).json(products);
  } catch (err) {
    console.log(err.message);
    throw new Error(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const productData = req.body;
    const product = await productController.createProduct(productData);
    return res.status(httpStatus.CREATED).json(product);
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res) {
  try {
    const { productId } = req.params;
    const product = await productController.getProductById(productId);
    return res.status(httpStatus.OK).json(product);
  } catch (err) {
    console.log(err.message);
    throw new Error(err);
  }
}

async function updateProductById(req, res) {
  try {
    const { productId } = req.params;
    const productData = req.body;
    const product = await productController.updateProductById(
      productId,
      productData
    );
    return res.status(httpStatus.OK).json(product);
  } catch (err) {
    console.log(err.message);
    throw new Error(err);
  }
}

async function deleteProductById(req, res) {
  try {
    const { productId } = req.params;
    const product = await productController.deleteProductById(productId);
    return res.status(httpStatus.OK).json(product);
  } catch (err) {
    console.log(err.message);
    throw new Error(err);
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

export default router;
