const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true,
  },
  otp: {
    type: Number,
    require: true,
  },
  uid: {
    type: String,
    require: true
  },
  userName: {
    type: String,
    require: true
  },
  mobileNo: {
    type: String,
    require: true
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    require: true
  }
}, {
  timestamps: true,
  versionKey: false,
});

module.exports = mongoose.model("user", userSchema);
