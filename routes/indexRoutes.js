const express = require("express");
const { createUser, getAllUsers, getUserById, updateUserById, deleteUserById, createAdminUser } = require("../controller/userController");
const { createContactUs, getAllContactUs, getContactUsById, updateContactUsById, deleteContactUsById } = require("../controller/contactUsController");
const { createFaq, getAllFaqs, getFaqById, updateFaqById, deleteFaqById } = require("../controller/FaqController");
const { createTerms, getAllTerms, getTermsById, updateTermsById, deleteTermsAndById } = require("../controller/TermsAndConditionController");
const { userLogin, emailOtpVerify, forgotPassword, resetPassword, changePassword } = require("../auth/auth");
const upload = require("../helper/imageUplode");
const { auth } = require("../helper/authToken");
const { createAddress, getAllAddress, getAddressById, updateAddressById, deleteAddressById, getAllMyAddress } = require("../controller/addressController");
const { createCategory, getAllCategory, getCategoryById, updateCategoryById, deleteCategoryById } = require("../controller/categoryController");
const { createReason } = require("../controller/reasonforCancellationController");
const indexRoutes = express.Router();

// auth Routes

indexRoutes.post('/userLogin', userLogin)
indexRoutes.post('/emailOtpVerify', emailOtpVerify)
indexRoutes.post('/forgotPassword', forgotPassword)
indexRoutes.put('/resetPassword/:id', resetPassword)
indexRoutes.put('/changePassword', auth(['admin', 'user']), changePassword)

// user routes

indexRoutes.post('/createAdmin', createAdminUser)
indexRoutes.post("/createUser", createUser);
indexRoutes.get('/allUsers', auth(['admin']), getAllUsers)
indexRoutes.get('/getUser', auth(['admin', 'user']), getUserById)
indexRoutes.put('/updateUser', auth(['admin', 'user']), upload.single('image'), updateUserById)
indexRoutes.delete('/deleteUser', auth(['admin', 'user']), deleteUserById)

// contactus routes

indexRoutes.post('/createContactUs', auth(['user']), createContactUs)
indexRoutes.get('/allContactUs', auth(['admin', 'user']), getAllContactUs)
indexRoutes.get('/getContactUs/:id', auth(['admin', 'user']), getContactUsById)
indexRoutes.delete('/deleteContactUs/:id', auth(['admin', 'user']), deleteContactUsById)

// FAQ Routes

indexRoutes.post('/createFaq', auth(['admin']), createFaq);
indexRoutes.get('/allFaqs', auth(['admin', 'user']), getAllFaqs)
indexRoutes.get('/getFaq/:id', auth(['admin', 'user']), getFaqById)
indexRoutes.put('/updateFaq/:id', auth(['admin']), updateFaqById)
indexRoutes.delete('/deleteFaq/:id', auth(['admin']), deleteFaqById)


// Terms & Condition Routes

indexRoutes.post('/createTerm', auth(['admin']), createTerms)
indexRoutes.get('/allTerms', auth(['admin', 'user']), getAllTerms)
indexRoutes.get('/getTerms/:id', auth(['admin', 'user']), getTermsById)
indexRoutes.put('/updateTerms/:id', auth(['admin']), updateTermsById)
indexRoutes.delete('/deleteTerms/:id', auth(['admin']), deleteTermsAndById)

// address Routes

indexRoutes.post('/createAddress', auth(['user', 'admin']), createAddress)
indexRoutes.get('/allAddress', auth(['admin']), getAllAddress)
indexRoutes.get('/getAddress/:id', auth(['admin', 'user']), getAddressById)
indexRoutes.put('/updateAddress/:id', auth(['admin', 'user']), updateAddressById)
indexRoutes.delete('/deleteAddress/:id', auth(['admin']), deleteAddressById)
indexRoutes.get('/allMyAddress', auth(['admin', 'user']), getAllMyAddress)

// category Routes

indexRoutes.post('/createCategory', auth(['admin', 'user']), upload.single('categoryImage'), createCategory)
indexRoutes.get('/allCategory', auth(['admin', 'user']), getAllCategory)
indexRoutes.get('/getCategory/:id', auth(['admin', 'user']), getCategoryById)
indexRoutes.put('/updateCategory/:id', auth(['admin', 'user']), upload.single('categoryImage'), updateCategoryById)
indexRoutes.delete('/deleteCategory/:id', auth(['admin', 'user']), deleteCategoryById)

// Reason For Cancellation Routes

indexRoutes.post('/createReason', auth(['admin', 'user']), createReason)

module.exports = indexRoutes;
