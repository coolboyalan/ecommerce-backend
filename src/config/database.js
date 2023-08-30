import mongoose from "mongoose";

const mongoString =
  "mongodb+srv://coolboyalan:Password...@cluster0.yzrqd.mongodb.net/ecommerce";

const connectDb = async (MONGO_URI = mongoString) => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDb`);
  } catch (err) {
    throw new Error(err);
  }
};

export default connectDb;
