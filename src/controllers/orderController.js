import orderModel from "../models/orderModel.js";
import cartController from "./cartController.js";

const createOrder = async (userId) => {
  try {
    const cart = await cartController.getCart(userId);
    if (cart.totalItems < 1) {
      throw new Error({
        status: 400,
        message: "Cart is empty",
      });
    }

    const quantity = cart.items.reduce((a,item)=>{
        return (a + item.quantity)
    })

    return quantity
  } catch (err) {
    throw new Error(err);
  }
};

export default {
    createOrder
}