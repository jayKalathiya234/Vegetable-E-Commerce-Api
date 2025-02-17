const user = require("../models/userModels");

exports.createUser = async (req, res) => {
  try {
    let { firstName, lastName, email, password } = req.body;

    let checkUserIsExist = await user.findOne({ email });

    if (checkUserIsExist) {
      return res
        .status(409)
        .json({ status: 409, message: "User Is Already Exist" });
    }

    checkUserIsExist = await user.create({
      firstName,
      lastName,
      email,
      password,
    });

    return res.status(201).json({
      status: 201,
      message: "User Create SuccessFully...",
      user: checkUserIsExist,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
