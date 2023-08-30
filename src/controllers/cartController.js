import cartModel from "../models/cartModel.js";
import productController from "./productController.js";

const getCart = async (userId) => {
  try {
    let cart = await cartModel.getCart(userId);
    if (cart) {
      return cart;
    }
    throw new Error({
      status: 400,
      message: "Cart doesn't exist",
    });
  } catch (err) {
    throw new Error(err);
  }
};

const updateCart = async (userId, updateData, cart) => {
  try {
    if (!cart) {
      cart = await getCart(userId);
    }
    let { productId, updateProduct } = updateData;
    const items = cart.items;
    const product = await productController.getProductById(productId);
    updateProduct = updateProduct || -1;

    const update = items.find((item) => {
      if (item.productId == productId) {
        item.quantity += updateProduct;
        return true;
      }
    });
    if (!update) {
      items.push({
        productId,
        quantity: 1,
      });
      cart.totalItems += updateProduct;
    }
    cart.totalPrice += product.price * updateProduct;
    await cart.save();
    return cart;
  } catch (err) {
    throw new Error(err);
  }
};

const createCart = async (userId, productId) => {
  try {
    let cart = await cartModel.getCart(userId);
    if (cart) {
      const updateData = {
        productId,
        updateProduct: 1,
      };
      const updatedCart = await updateCart(userId, updateData, cart);
      return updatedCart;
    } else {
      const product = await productController.getProductById(productId);
      if (!product) {
        throw new Error({
          status: 400,
          message: "Invalid Product ID",
        });
      }
      const cartData = {};
      cartData.userId = userId;
      cartData.items = [{ productId, quantity: 1 }];
      cartData.totalPrice = product.price;
      cartData.totalItems = cartData.items.length;
      cart = await cartModel.create(cartData);
      return cart;
    }
  } catch (err) {
    throw new Error(err);
  }
};

const deleteCart = async (userId) => {
  try {
    const cart = await getCart(userId);
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();
  } catch (err) {
    throw new Error(err);
  }
};

export default {
  getCart,
  createCart,
  updateCart,
  deleteCart,
};
