const user = require("../models/userModels");
const bcrypt = require('bcrypt')

exports.createUser = async (req, res) => {
  try {
    let { firstName, lastName, email, password } = req.body;

    let checkUserIsExist = await user.findOne({ email });

    if (checkUserIsExist) {
      return res
        .status(409)
        .json({ status: 409, message: "User Is Already Exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    checkUserIsExist = await user.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ status: 201, message: "User Create SuccessFully...", user: checkUserIsExist, });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page)
    let pageSize = parseInt(req.query.pageSize)

    if (page < 1 || pageSize < 1) {
      return res.status(401).json({ status: 401, message: "Page And PageSize Cann't Be Less Than 1" })
    }

    let paginatedUsers;

    paginatedUsers = await user.find()

    let count = paginatedUsers.length

    if (count === 0) {
      return res.status(404).json({ status: 404, message: "user not found" })
    }

    if (page && pageSize) {
      let startIndex = (page - 1) * pageSize
      let lastIndex = (startIndex + pageSize)
      paginatedUsers = await paginatedUsers.slice(startIndex, lastIndex)
    }

    return res.status(200).json({ status: 200, totalUsers: count, message: "All Users Found SuccessFully...", users: paginatedUsers });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: 500, message: error.message });
  }
}

exports.getUserById = async (req, res) => {
  try {
    let id = req.params.id

    let getUserId = await user.findById(id)

    if (!getUserId) {
      return res.status(404).json({ status: 404, message: "User Not Found" })
    }

    return res.status(200).json({ status: 200, message: "user found successFully...", user: getUserId })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: 500, message: error.message })
  }
}

exports.updateUserById = async (req, res) => {
  try {
    let id = req.params.id

    let updateUserId = await user.findById(id)

    if (!updateUserId) {
      return res.status(404).json({ status: 404, message: "user not found" })
    }

    updateUserId = await user.findByIdAndUpdate(id, { ...req.body }, { new: true });

    return res.status(200).json({ status: 200, message: "user updated successfully...", user: updateUserId })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: 500, message: error.message })
  }
}

exports.deleteUserById = async (req, res) => {
  try {
    let id = req.params.id

    let deleteUserId = await user.findById(id)

    if (!deleteUserId) {
      return res.status(404).json({ status: 404, message: "user not found" })
    }

    await user.findByIdAndDelete(id)

    return res.status(200).json({ status: 200, message: "user delete successfully..." })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: 500, message: error.message })
  }
}