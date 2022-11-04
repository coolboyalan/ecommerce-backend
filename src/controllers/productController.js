const productModel = require("../models/productModel");
const valid = require("../validators/validator");
const aws = require("aws-sdk")

aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });

    let uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: new Date() + "group19/" + file.originalname,
      Body: file.buffer,
    };
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      return resolve(data.Location);
    });
  });
};

const createProduct = async (req, res) => {
  try {
    let data = req.body;
    let message;

    if ((message = valid.createProduct(data))) {
      return res.status(400).send({ status: false, message: message });
    }
    let product = await productModel.findOne({ title: data.title });

    if (product) {
      return res.status(409).send({
        status: false,
        message: "A product with the same title already exists",
      });
    }

    if (!req.files) {
      return res
        .status(400)
        .send({ status: false, message: "productImage is missing" });
    }
    if ((message = valid.productImage(req.files))) {
      return res.status(400).send({ status: false, message: message });
    }

    data.productImage = await uploadFile(req.files[0])

    let result = await productModel.create(data);
    res.status(201).send({ status: true, message: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    let data = req.query;
    let message;
    if (!Object.keys(data).length) {
      let result = await productModel.find({ isDeleted: false });
      if (!result.length) {
        return res
          .status(404)
          .send({ status: false, message: "No products found" });
      }
      return res
        .status(200)
        .send({ status: false, message: "Success", data: result });
    }
    if ((message = valid.getProducts(data))) {
      return res.status(400).send({ status: false, message: message });
    }
    data["isDeleted"] = false;
    if ("priceSort" in data) {
      let result = await productModel
        .find(data)
        .sort({ price: data["priceSort"] });

      if (!result.length) {
        return res.status(404).send({
          status: false,
          message: "No products found with matching filters",
        });
      }

      res.send({ status: true, message: "Success", data: result });
    } else {
      let result = await productModel.find(data);

      if (!result.length) {
        return res.status(404).send({
          status: false,
          message: "No products found with matching filters",
        });
      }
      res.send({ status: true, message: "Success", data: result });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
};

const getProductById = async (req, res) => {
  try {
    let productId = req.params.productId;

    if (!valid.id(productId)) {
      return res.status(400).send({
        status: false,
        message: "productId in path params is not valid",
      });
    }
    let result = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!result) {
      return res
        .status(404)
        .send({ status: false, message: "No products found" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Success", data: result });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    let productId = req.params.productId;
    let data = req.body;
    let message;

    if (!valid.id(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "productId in params isn't valid" });
    }
    if(req.files){
      data.validation = 1
      if(req.files.length) data.validation+=1
    }

    if ((message = valid.updateProduct(data))) {
      return res.status(400).send({ status: false, message: message });
    }
    if ("title" in data) {
      let product = await productModel.findOne({ title: data.title });
      if (product) {
        return res.status(409).send({
          status: false,
          message: "a product with this title already exists",
        });
      }
    }
    let product = await productModel.findOne({_id:productId,isDeleted:false})
    if(!product){
      return res.status(404).send({
        status: false,
        message: "No produt with this id or already deleted",
      });
    }
    if(data.validation==2){
      if ((message = valid.productImage(req.files))) {
        return res.status(400).send({ status: false, message: message });
      }
  
      data.productImage = await uploadFile(req.files[0])
      delete data.validation
    }

    let result = await productModel.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      data,
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

const deleteProduct = async (req, res) => {
  try {
    let productId = req.params.productId;

    if (!valid.id(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "product Id in params isn't valid" });
    }
    let result = await productModel.findByIdAndUpdate(productId, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    if (!result) {
      return res
        .status(404)
        .send({ status: false, message: "There is no product with this id" });
    }
    if (result.isDeleted) {
      return res.status(404).send({
        status: false,
        message: "Product not found",
      });
    }
    return res.status(200).send({
      status: true,
      message: "The product has been deleted successfully",
      data:result
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
