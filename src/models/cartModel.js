import mongoose from "mongoose";

const objectId = mongoose.Schema.Types.ObjectId;

const ItemSchema = new mongoose.Schema(
  {
    productId: {
      type: objectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: objectId,
      ref: "user",
      unique: true,
    },
    items: [ItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalItems: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

CartSchema.statics.getCart = async function (userId) {
  try {
    const cart = await this.findOne({ userId });
    return cart;
  } catch (err) {
    throw new Error(err);
  }
};

export default mongoose.model("cart", CartSchema);
