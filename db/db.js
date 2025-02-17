const mongoose = require("mongoose");

exports.connectDB = async (req, res) => {
  try {
    await mongoose
      .connect(process.env.MONGODB_PATH)
      .then(() => console.log("DB Is Connected"));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
