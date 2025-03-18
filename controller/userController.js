const user = require("../models/userModels");
const bcrypt = require('bcrypt')
const Category = require('../models/categoryModels')
const Product = require('../models/productModels')
const ProductVariant = require('../models/productVarientModels')
const nodemailer = require('nodemailer')
let otp = 123456

exports.createAdminUser = async (req, res) => {
  try {
    let { mobileNo, email, password } = req.body;

    let checkUserIsExist = await user.findOne({ email });

    if (checkUserIsExist) {
      return res.status(409).json({ status: 409, message: "User Is Already Exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    checkUserIsExist = await user.create({
      mobileNo,
      email,
      password: hashedPassword,
      otp,
      role: 'admin'
    });


    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification Code",
      text: `Your code is: ${otp} `
    }

    transport.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
      }
    })

    return res.status(201).json({ status: 201, message: "Admin Create SuccessFully...", user: checkUserIsExist });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
}

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
      otp,
      role: 'user'
    });

    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification Code",
      text: `Your code is: ${otp} `
    }

    transport.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
      }
    })

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
    let id = req.user._id

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
    let id = req.user._id

    let updateUserId = await user.findById(id)

    if (!updateUserId) {
      return res.status(404).json({ status: 404, message: "user not found" })
    }

    if (req.file) {
      req.body.image = req.file.path
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
    let id = req.user._id

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

otp = 456789

exports.setGstNumber = async (req, res) => {
  try {
    let id = req.user._id

    let { gstNumber, businessName, PANNumber, businessType, businessAddress } = req.body

    let findUser = await user.findById(id)

    if (!findUser) {
      return res.status(404).json({ status: 404, message: "User Not Found" })
    }

    findUser.gstNumber = gstNumber
    findUser.businessName = businessName
    findUser.PANNumber = PANNumber
    findUser.businessType = businessType
    findUser.businessAddress = businessAddress
    findUser.otp = otp

    await findUser.save()


    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: findUser.email,
      subject: "Email Verification Code",
      text: `Your code is: ${otp} `
    }

    transport.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
      }
    })

    return res.status(200).json({ status: 200, message: "Gst Number added SuccessFully...", user: findUser })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message })
  }
}

exports.createBrandDetails = async (req, res) => {
  try {
    let id = req.user._id

    let getUserData = await user.findById(id)

    let { storeName, ownerName } = req.body
    if (!getUserData) {
      return res.status(404).json({ status: 404, message: "User Not Found" })
    }

    getUserData.storeName = storeName
    getUserData.ownerName = ownerName

    await getUserData.save()

    return res.status(200).json({ status: 200, message: "Brand Details Set SuccessFully...", user: getUserData })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: 500, message: error.message })
  }
}

exports.setBankDetails = async (req, res) => {
  try {
    let id = req.user._id

    let { accountNumber, confirmAccount, IFSCCode } = req.body

    let getUserData = await user.findById(id)

    if (!getUserData) {
      return res.status(404).json({ status: 404, message: "User Not Found" })
    }

    getUserData.accountNumber = accountNumber
    getUserData.confirmAccount = confirmAccount
    getUserData.IFSCCode = IFSCCode

    await getUserData.save()

    return res.status(200).json({ status: 200, message: "Bank Details Set SuccessFully...", user: getUserData })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message })
  }
}

exports.pickUpAddress = async (req, res) => {
  try {
    let id = req.user._id

    let { buildingNumber, locality, landmark, pincode, city, state } = req.body

    let getUserData = await user.findById(id)

    if (!getUserData) {
      return res.status(404).json({ status: 404, message: "User Not Found" })
    }

    getUserData.buildingNumber = buildingNumber
    getUserData.locality = locality
    getUserData.landmark = landmark
    getUserData.pincode = pincode
    getUserData.city = city
    getUserData.state = state

    await getUserData.save()

    return res.status(200).json({ status: 200, message: "Pickup Address Set SuccessFully...", user: getUserData })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: 500, message: error.message })
  }
}

exports.userDasboard = async (req, res) => {
  try {
    const categories = await Category.find({ status: true });

    const gardenFresh = await Product.aggregate([
      { $limit: 6 },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants'
        }
      },
      {
        $project: {
          _id: 1,
          productName: 1,
          description: 1,
          healthBenefits: 1,
          storageAndUses: 1,
          images: 1,
          category: 1,
          variants: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    const seasonalSelections = await Product.aggregate([
      { $skip: 6 },
      { $limit: 6 },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants'
        }
      },
      {
        $project: {
          _id: 1,
          productName: 1,
          description: 1,
          healthBenefits: 1,
          storageAndUses: 1,
          images: 1,
          category: 1,
          variants: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    const specialOffers = await ProductVariant.aggregate([
      {
        $match: {
          $expr: { $lt: ["$price", "$discountPrice"] }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'product.category'
        }
      },
      { $unwind: { path: '$product.category', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productId',
          product: { $first: '$product' },
          variants: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0,
          _id: '$product._id',
          productName: '$product.productName',
          description: '$product.description',
          healthBenefits: '$product.healthBenefits',
          storageAndUses: '$product.storageAndUses',
          images: '$product.images',
          category: '$product.category',
          variants: 1,
          createdAt: '$product.createdAt',
          updatedAt: '$product.updatedAt'
        }
      },
      { $limit: 8 }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        categories,
        gardenFresh,
        seasonalSelections,
        specialOffers
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, success: false, message: error.message });
  }
}