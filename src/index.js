const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const route = require("./routes/route")
const multer = require("multer")
require("dotenv").config();

const app = express();

app.use(multer().any())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://Shrikant:shreyushri@cluster0.xjishte.mongodb.net/group19",
    { useNewUrlParser: true }
  )
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

app.use("/",route)

app.listen(process.env.PORT || 3000, function () {
  console.log("Server Started on port " + process.env.PORT || 3000);
});