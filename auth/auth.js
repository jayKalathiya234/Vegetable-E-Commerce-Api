const user = require('../models/userModels')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const otp = 456789

exports.userLogin = async (req, res) => {
    try {
        let { email, password } = req.body

        let checkEmailIsExist = await user.findOne({ email })

        if (!checkEmailIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "Email Not Found" })
        }

        let comparePasswrod = await bcrypt.compare(password, checkEmailIsExist.password)

        if (!comparePasswrod) {
            return res.status(404).json({ status: 404, success: false, message: "Password Not Match" })
        }

        let token = jwt.sign({ _id: checkEmailIsExist._id }, process.env.SECRET_KEY, { expiresIn: '1D' })

        return res.status(200).json({ status: 200, success: true, message: "User Login SuccessFully...", data: checkEmailIsExist, token: token })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.emailOtpVerify = async (req, res) => {
    try {
        let { email, otp } = req.body

        let checkEmailIsExist = await user.findOne({ email })

        if (!checkEmailIsExist) {
            return res.status(404).json({ status: 404, success: false, message: "Email Not Found" })
        }

        if (checkEmailIsExist.otp != otp) {
            return res.status(200).json({ status: 200, success: false, message: "Invalid Otp" });
        }

        checkEmailIsExist.otp = undefined

        await checkEmailIsExist.save()

        return res.status(200).json({ status: 200, success: true, message: "Otp Verified Successfully", data: checkEmailIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body

        let chekcEmail = await user.findOne({ email })

        if (!chekcEmail) {
            return res.status(404).json({ status: 404, success: false, message: "Email Not Found" })
        }

        const transport = await nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Forgot Password Otp",
            text: `Your Code is ${otp}`
        }

        transport.sendMail(mailOptions, (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ status: 500, success: false, message: error.message })
            }
            return res.status(200).json({ status: 200, success: true, message: "Email Sent SuccessFully..." });
        })

        chekcEmail.otp = otp
        await chekcEmail.save()

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        let id = req.params.id

        let { newPassword, confirmPassword } = req.body

        let getUserId = await user.findById(id)

        if (!getUserId) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" })
        }

        if (newPassword !== confirmPassword) {
            return res.status(404).json({ status: 404, success: false, message: "Password And Confirm Password Not Match" })
        }

        let salt = await bcrypt.genSalt(10)
        let hashedPassword = await bcrypt.hash(newPassword, salt)

        await user.findByIdAndUpdate(id, { password: hashedPassword }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Password Reset SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.changePassword = async (req, res) => {
    try {
        let id = req.user._id

        let { oldPassword, newPassword, confirmPassword } = req.body

        let getUser = await user.findById(id)

        if (!getUser) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" })
        }

        let correctPassword = await bcrypt.compare(oldPassword, getUser.password)

        if (!correctPassword) {
            return res.status(404).json({ status: 404, success: false, message: "Old Password Not Match" })
        }

        if (newPassword !== confirmPassword) {
            return res.status(404).json({ status: 404, success: false, message: "New Password And ConfirmPassword Not Match" })
        }

        let salt = await bcrypt.genSalt(10)
        let hasPssword = await bcrypt.hash(newPassword, salt)

        await user.findByIdAndUpdate(id, { password: hasPssword }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Password Change SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.userGoggleLogin = async (req, res) => {
    try {
        let { uid, userName, email } = req.body

        let checkUser = await user.findOne({ email })

        if (!checkUser) {
            checkUser = await user.create({
                uid,
                userName,
                email,
            })
        }

        let token = jwt.sign({ _id: checkUser._id }, process.env.SECRET_KEY, { expiresIn: '1D' })

        return res.status(200).json({ status: 200, success: true, message: "User Login SuccessFully....", data: checkUser, token: token });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}