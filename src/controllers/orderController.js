const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const valid = require("../validators/validator");

/**
 * @createOrder Creates a new order
 * @returns {error if there is any}
 */
const createOrder = async (req, res) => {
  try {
    let userId = req.params.userId;
    let data = req.body;
    let message;

    if ((message = valid.createOrder(data))) {
      return res.status(400).send({ status: false, message: message });
    }
    let cart = await cartModel.findById(data["cartId"]);
    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: "there is no cart with this cartId" });
    }
    if (cart.userId != userId) {
      return res.status(403).send({
        status: false,
        message: "this cartId doesn't belong to the user who is logged in",
      });
    }
    if (!cart["items"].length) {
      return res.status(400).send({
        status: false,
        message: "you don't have any product in your cart to create an order",
      });
    }

    let totalQuantity = 0;
    for (let i = 0; i < cart.items.length; i++) {
      totalQuantity += cart.items[i].quantity;
    }

    data["userId"] = userId;
    data["items"] = cart["items"];
    data["totalPrice"] = cart["totalPrice"];
    data["totalQuantity"] = totalQuantity;
    data["totalItems"] = cart["items"].length;
    let order = await orderModel.create(data);

    res.status(201).send({ status: true, message: "Success", data: order });

    await cartModel.findByIdAndUpdate(cart._id, {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

/**
 * @updateOrder Updates the order status
 * @returns {error if there is any}
 */
const updateOrder = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;

    if (!("orderId" in data)) {
      return res.status(400).send({
        status: false,
        message: "the orderId is missing in request body",
      });
    }
    if (!valid.id(data["orderId"])) {
      return res.status(400).send({
        status: false,
        message: "the order id in request body isn't valid",
      });
    }

    let order = await orderModel.findById(data["orderId"]);

    if (!order) {
      return res
        .status(404)
        .send({ status: false, message: "there is no order with this id" });
    }
    if (order.userId != userId) {
      return res.status(403).send({
        status: false,
        message: "you ain't authorized to perform this action",
      });
    }
    if (order.isDeleted) {
      return res.status(404).send({
        status: false,
        message: "NOT FOUND - the order is already deleted",
      });
    }
    if (!order.cancellable) {
      return res
        .status(400)
        .send({ status: false, message: "this order is not cancellable" });
    }
    if (order.status != "pending") {
      return res.status(400).send({
        status: false,
        message: `the order can't be cancelled because of it's current status, "the current status is ${order.status}`,
      });
    }
    if (data.status == "completed") {
      let result = await orderModel.findByIdAndUpdate(
        data["orderId"],
        {
          status: "completed",
        },
        { new: true }
      );
      return res
      .status(200)
      .send({ status: true, message: "Success", data: result });
    } else if (data.status == "cancelled") {
    let result = await orderModel.findByIdAndUpdate(
      data["orderId"],
      {
        status: "cancelled",
      },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "Success", data: result });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createOrder,
  updateOrder,
};
