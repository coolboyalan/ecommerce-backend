import productModel from "../models/productModel.js";

const createProduct = async (productData) => {
  try {
    const product = await productModel.create(productData);
    return product;
  } catch (err) {
    if (err.name === "MongoServerError" && err.code === 11000) {
      const duplicateUserData = {};
      duplicateUserData.message = "This product already exists";
      duplicateUserData.status = 409;
      throw new Error(duplicateUserData);
    }
    throw new Error(err);
  }
};

const getProductById = async (productId) => {
  try {
    const product = await productModel.getProduct(productId);
    return product;
  } catch (err) {
    throw new Error(err);
  }
};

const getProducts = async (filters) => {
  try {
    const products = await productModel.getProductsByFilter(filters);
    return products;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteProductById = async (productId) => {
  try {
    const product = await productModel.deleteProduct(productId);
    return product;
  } catch (err) {
    throw new Error(err);
  }
};

const updateProductById = async (productId, productData) => {
  try {
    const product = await productModel.updateProduct(productId, productData);
    return product;
  } catch (err) {
    throw new Error(err);
  }
};

export default {
  updateProductById,
  deleteProductById,
  getProductById,
  createProduct,
  getProducts,
};
