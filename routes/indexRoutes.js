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
const { createReason, getAllReasons, getReasonById, updateReasonById, deleteReasonById } = require("../controller/reasonforCancellationController");
const { createProduct, getAllProducts, getProductById, updateProductById, updatePackSizeById, deletePackSizeById, deleteProductById } = require("../controller/productController");
const { createProductVarient, getAllProductVarient, getProductVarientById, updateProductVarientById, deleteProductVarientById } = require("../controller/productVarientController");
const { createCart, getAllCarts, getCartsById, updateCartsById, deleteCartById, getAllMyCarts } = require("../controller/cartController");
const { createCoupen, getAllCoupens, getCoupenById, updateCoupenById, deleteCoupenById } = require("../controller/coupenController");
const { createOrder, getAllOrders } = require("../controller/orderController");
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

indexRoutes.post('/createCategory', auth(['admin']), upload.single('categoryImage'), createCategory)
indexRoutes.get('/allCategory', auth(['admin', 'user']), getAllCategory)
indexRoutes.get('/getCategory/:id', auth(['admin', 'user']), getCategoryById)
indexRoutes.put('/updateCategory/:id', auth(['admin']), upload.single('categoryImage'), updateCategoryById)
indexRoutes.delete('/deleteCategory/:id', auth(['admin']), deleteCategoryById)

// Reason For Cancellation Routes

indexRoutes.post('/createReason', auth(['admin']), createReason)
indexRoutes.get('/allReasons', auth(['admin', 'user']), getAllReasons)
indexRoutes.get('/getReason/:id', auth(['admin', 'user']), getReasonById)
indexRoutes.put('/updateReason/:id', auth(['admin']), updateReasonById)
indexRoutes.delete('/deleteReason/:id', auth(['admin']), deleteReasonById)

// product Routes

indexRoutes.post('/createProduct', auth(['admin', 'user']), upload.fields([{ name: 'images' }]), createProduct)
indexRoutes.get('/allProducts', auth(['admin', 'user']), getAllProducts)
indexRoutes.get('/getProduct/:id', auth(['admin', 'user']), getProductById)
indexRoutes.put('/updateProduct/:id', auth(['admin', 'user']), upload.fields([{ name: 'images' }]), updateProductById)
// indexRoutes.put('/updatePackSize/:id', auth(['admin']), updatePackSizeById)
// indexRoutes.put('/deletePackSize/:id', auth(['admin']), deletePackSizeById)
indexRoutes.delete('/deleteProduct/:id', auth(['admin']), deleteProductById)

// Product Varient Routes

indexRoutes.post('/createProductVarient', auth(['admin']), createProductVarient)
indexRoutes.get('/allProductVarient', auth(['admin', 'user']), getAllProductVarient)
indexRoutes.get('/getProductVarient/:id', auth(['admin', 'user']), getProductVarientById)
indexRoutes.put('/updateProductVarient/:id', auth(['admin']), updateProductVarientById)
indexRoutes.delete('/deleteProductVarient/:id', auth(['admin']), deleteProductVarientById)

// Card Routes

indexRoutes.post('/createCart', auth(['admin', 'user']), createCart)
indexRoutes.get('/allCarts', auth(['admin', 'user']), getAllCarts)
indexRoutes.get('/getCart/:id', auth(['admin', 'user']), getCartsById)
indexRoutes.put('/updateCart/:id', auth(['admin', 'user']), updateCartsById)
indexRoutes.delete('/deleteCart/:id', auth(['admin', 'user']), deleteCartById)
indexRoutes.get('/allMyCarts', auth(['admin', 'user']), getAllMyCarts)

// Coupen Routes

indexRoutes.post('/createCoupen', auth(['admin', 'user']), createCoupen)
indexRoutes.get('/allCoupens', auth(['admin', 'user']), getAllCoupens)
indexRoutes.get('/getCoupen/:id', auth(['admin', 'user']), getCoupenById)
indexRoutes.put('/updateCoupen/:id', auth(['admin', 'user']), updateCoupenById)
indexRoutes.delete('/deleteCoupen/:id', auth(['admin', 'user']), deleteCoupenById)

// Order Routes

indexRoutes.post('/createOrder', auth(['admin', 'user']), createOrder)
indexRoutes.get('/allOrders', auth(['admin', 'user']), getAllOrders)

module.exports = indexRoutes;
