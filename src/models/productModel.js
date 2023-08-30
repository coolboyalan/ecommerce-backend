import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      required: true,
    },
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
    productImage: {
      type: String,
      required: true,
    },
    style: {
      type: String,
      required: true,
    },
    availableSizes: {
      type: [String],
      enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
      required: true,
    },
    installments: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

ProductSchema.statics.getProduct = async function (productId) {
  try {
    const product = await this.findOne({ _id: productId, isDeleted: false });
    if (product) return product;
    throw new Error({
      status: 404,
      message: `Product not found`,
    });
  } catch (err) {
    throw new Error(err);
  }
};

ProductSchema.statics.getProductsByFilter = async function (filters) {
  try {
    filters.isDeleted = false;
    const products = await this.find(filters);
    if (!products.length) {
      throw new Error({
        status: 404,
        message: "No products with matching filters",
      });
    }
    return products;
  } catch (err) {
    throw new Error(err);
  }
};

ProductSchema.statics.updateProduct = async function (productId, productData) {
  try {
    const updatedProduct = await this.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      productData,
      { new: true }
    );
    return updatedProduct;
  } catch (err) {
    throw new Error(err);
  }
};

ProductSchema.statics.deleteProduct = async function (productId, productData) {
  try {
    const product = await this.findByIdAndUpdate(
      { _id: productId, isDeleted: false },
      { isDeleted: true, deletedAt: Date() },
      { new: true }
    );
    if (!product)
      throw new Error({
        status: 400,
        message: "There is no such product",
      });
  } catch (err) {
    throw new Error(err);
  }
};

export default mongoose.model("product", ProductSchema);
