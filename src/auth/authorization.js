import UserModel from "../models/userModel.js";

export async function authorization(req, res, next) {
  try {
    const user = req.user;
    const { userId } = req.params;
    if (userId != user.id) {
      throw new Error({
        status: 403,
        message: "You ain't allowed to perform this task",
      });
    }

    next();
  } catch (err) {
    throw new Error(err);
  }
}
