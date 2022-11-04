const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const valid = require("../validators/validator");

const createCart = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;
    let cart;

    if ((cart = valid.createCart(data))) {
      return res.status(400).send({ status: false, message: cart });
    }

    cart = await cartModel.findOne({ userId: userId });
    if ("cartId" in data) {
      if (!cart) {
        return res.status(404).send({
          status: false,
          message:
            "there is no cart for this user yet please dont't send the cartId",
        });
      }
      if (cart._id != data["cartId"]) {
        return res.status(403).send({
          status: false,
          message: "the cartId you sent doesn't belong to this user",
        });
      }
    }
    let product = await productModel.findOne({
      _id: data["productId"],
      isDeleted: false,
    });
    if (!product) {
      return res
        .status(404)
        .send({ status: false, message: "there is no prodcut with this id" });
    }
    if (cart) {
      let cartItems = [...cart["items"]];

      if (cartItems.length == 0) {
        cartItems.push(({ productId, quantity } = data));
      } else {
        for (let i = cartItems.length - 1; i >= 0; i--) {
          if (cartItems[i]["productId"] == data["productId"]) {
            cartItems[i]["quantity"] += data["quantity"];
            break;
          }
          if (i == 0) {
            cartItems.push(({ productId, quantity } = data));
          }
        }
      }
      cart["items"] = cartItems;
      let newPrice = cart["totalPrice"] + product["price"] * data["quantity"];
      let result = await cartModel.findByIdAndUpdate(
        cart._id,
        {
          items: cartItems,
          totalPrice: newPrice,
          totalItems: cartItems.length,
        },
        { new: true }
      );
      return res
        .status(200)
        .send({ status: true, message: "Sucess", data: result });
    } else {
      let items = [({ productId, quantity } = data)];
      let totalPrice = product["price"] * data["quantity"];
      let result = await cartModel.create({
        userId,
        items,
        totalPrice,
        totalItems: data["quantity"],
      });
      return res
        .status(201)
        .send({ status: true, message: "Success", data: result });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

const getCart = async (req, res) => {
  try {
    let userId = req.params.userId;

    let cart = await cartModel.findOne({ userId: userId });
    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: "there is no cart for this user" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Success", data: cart });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateCart = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;
    let message;

    if ((message = valid.updateCart(data))) {
      return res.status(400).send({ status: false, message: message });
    }

    let cart = await cartModel.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).send({
        status: false,
        message: "there is no cart for this user yet",
      });
    }
    if ("cartId" in data) {
      if (cart._id != data["cartId"]) {
        return res.status(403).send({
          status: false,
          message: "the cartId you sent doesn't belong to this user",
        });
      }
    }
    let product = await productModel.findOne({
      _id: data["productId"],
      isDeleted: false,
    });
    if (!product) {
      return res
        .status(404)
        .send({ status: false, message: "there is no prodcut with this id" });
    }

    let cartItems = cart["items"];

    let existingProduct;
    for (let i = cartItems.length - 1; i >= 0; i--) {
      if (cartItems[i]["productId"] == data["productId"]) {
        if (data["removeProduct"]) {
          if (cartItems[i]["quantity"] == 1) {
            cartItems.splice(i, 1);
            cart.totalPrice -= product.price;
            cart.totalItems--;
          } else if (cartItems[i]["quantity"] > 1) {
            cartItems[i]["quantity"]--;
            cart.totalPrice -= product.price;
          }
          if (cartItems.length == 0) message = "cart is empty";
        } else {
          cart.totalPrice -= product.price * cartItems[i]["quantity"];
          cart.totalItems--;
          cartItems.splice(i, 1);
          if (cartItems.length == 0) {
            message = "cart is empty";
          }
        }
        existingProduct = i + 1;
      }
    }

    if (!existingProduct) {
      return res.status(400).send({
        status: false,
        message: "this product is not present in your cart",
      });
    }

    if (message) {
      let result = await cartModel.findByIdAndUpdate(
        cart._id,
        { items: [], totalPrice: 0, totalItems: 0 },
        { new: true }
      );
      return res.status(202).send({
        status: true,
        message:
          "There was only one product in your cart that's why your cart is now empty",
        data: result,
      });
    }

    let result = await cartModel.findByIdAndUpdate(
      cart._id,
      ({ items, totalPrice, totalItems } = cart),
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "Success", data: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    let userId = req.params.userId;

    let cart = await cartModel.findOneAndUpdate(
      { userId: userId },
      { items: [], totalPrice: 0, totalItems: 0 },
      { new: true }
    );
    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: "there is no cart for this user" });
    }

    /**
     *@If_you_want_to_see_the_response_then_set_the_status_code_to_202_because_204
     *@doesn't deliver any content. We've used 204 because it was mentioned in readme file
     */

    return res
      .status(204)
      .send({ status: true, message: "Success", data: cart });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createCart,
  getCart,
  deleteCart,
  updateCart,
};
