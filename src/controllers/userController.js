const userModel = require("../models/userModel");
const valid = require("../validators/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const aws = require("aws-sdk");
require("dotenv").config()

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

const registerUser = async (req, res) => {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    let message;

    if ((message = valid.createUser(data))) {
      return res.status(400).send({ status: false, message: message });
    }
    if (!(data.password.length >= 8 && data.password.length <= 15)) {
      return res.status(400).send({
        status: false,
        message: "password must be  between  8-15 characters",
      });
    }
    if ((message = valid.address(data["address"]))) {
      return res.status(400).send({ status: false, message: message });
    }

    let unique = await userModel
      .findOne({ $or: [{ email: data.email }, { phone: data.phone }] })
      .select({ phone: 1, email: 1, _id: 0 });

    if (unique) {
      if (unique.email == data.email) {
        return res.status(409).send({
          status: false,
          message: "email already exists, please use a different mail",
        });
      }
      if (unique.phone == data.phone) {
        return res.status(409).send({
          status: false,
          message:
            "phone no already exists, please use a different phone number",
        });
      }
    }
    await bcrypt.hash(data.password, 10).then(function (hash) {
      data.password = hash;
    });
    if (!req.files) {
      return res
        .status(400)
        .send({ status: false, message: "profileImage is missing" });
    }
    if ((message = valid.profileImage(req.files))) {
      return res.status(400).send({ status: false, message: message });
    }

    data.profileImage = await uploadFile(req.files[0])
    let result = await userModel.create(data);
    res.status(201).send({ status: true, message: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    let data = req.body;
    let userId = false;
    if (!("email" in data)) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }
    if (!valid.emailRegex.test(data.email)) {
      return res
        .status(400)
        .send({ status: false, message: "email isn't valid" });
    }
    if (!("password" in data)) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }
    if (typeof data.password != "string" || data.password.length<8) {
      return res
        .status(400)
        .send({
          status: false,
          message: "password has to be a string with atleast 8 characters",
        });
    }
    let user = await userModel.findOne({ email: data.email });

    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: "there is no user with this email" });
    }
    await bcrypt.compare(data.password, user.password).then(function (result) {
      if (result) {
        userId = user._id;
      }
    });
    if (userId === false) {
      return res
        .status(401)
        .send({ status: false, message: "password isn't correct" });
    }

    const token = jwt.sign({ userId: userId }, process.env.JWT_KEY, { expiresIn: "10d" });

    res.status(200).send({
      status: true,
      message: "User logged in successfully",
      data: { userId, token },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

const userProfile = async (req, res) => {
  try {
    let userId = req.params.userId;

    let user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .status({ status: false, message: "user not found" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Success", data: user });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    let userId = req.params.userId;
    let message;

    if(req.files){
      data.validation = 1
      if(req.files.length) data.validation+=1
    }

    if ((message = valid.updateUser(data))) {
      return res.status(400).send({ status: false, message: message });
    }
    if ("password" in data) {
      if (!(data.password.length >= 8 && data.password.length <= 15)) {
        return res.status(400).send({
          status: false,
          message: "password must be  between  8-15 characters",
        });
      }
      await bcrypt.hash(data.password, 10).then(function (hash) {
        data.password = hash;
      })
    }
    if ("address" in data) {
      if ((message = valid.updateAdress(data))) {
        return res.status(400).send({ status: false, message: message });
      }
    }
    if ("email" in data || "phone" in data) {
      let unique = await userModel
        .findOne({ $or: [{ email: data.email }, { phone: data.phone }] })
        .select({ phone: 1, email: 1, _id: 0 });

      if (unique) {
        if (unique.email == data.email) {
          return res.status(409).send({
            status: false,
            message: "email already exists, please use a different mail",
          });
        }
        if (unique.phone == data.phone) {
          return res.status(409).send({
            status: false,
            message:
              "phone no already exists, please use a different phone number",
          });
        }
      }
    }
    if(data.validation==2){
      if ((message = valid.profileImage(req.files))) {
        return res.status(400).send({ status: false, message: message });
      }
  
      data.profileImage = await uploadFile(req.files[0])
      delete data.validation
    }
    let result = await userModel.findByIdAndUpdate(userId, data, { new: true });
    if (!result) {
      return res
        .status(404)
        .send({ status: false, message: "There is no user with this userId" });
    }
    return res.status(200).send({
      status: true,
      message: "User profile updated successfully",
      data: result,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  registerUser,
  login,
  userProfile,
  updateUser,
};
