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

const OrderSchema = new mongoose.Schema({
  userId: {
    type: objectId,
    required: true,
    ref: "user",
  },
  items: [ItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 1,
  },
  totalItems: {
    type: Number,
    required: true,
    min: 1,
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  cancellable: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "completed", "cancelled"],
  },
  deletedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
});

export default mongoose.model("order", OrderSchema);
