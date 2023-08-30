import express from "express";
import routes from "./routes/route.js";
import connectDb from "./config/database.js";

await connectDb();
const app = express();

app.use(express.json());
app.use("/", routes);

app.use((err, req, res, next) => {
  err.status = err.status || 500;
  res.status(err.status).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(3000, () => {
  console.log(`Server started on port ${3000}`);
});
