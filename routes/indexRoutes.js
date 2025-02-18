const express = require("express");
const { createUser, getAllUsers, getUserById, updateUserById, deleteUserById } = require("../controller/userController");
const { createContactUs, getAllContactUs, getContactUsById, updateContactUsById, deleteContactUsById } = require("../controller/contactUsController");
const { createFaq, getAllFaqs, getFaqById, updateFaqById, deleteFaqById } = require("../controller/FaqController");
const { createTerms, getAllTerms, getTermsById, updateTermsById, deleteTermsAndById } = require("../controller/TermsAndConditionController");
const indexRoutes = express.Router();


// user routes

indexRoutes.post("/createUser", createUser);
indexRoutes.get('/allUsers', getAllUsers)
indexRoutes.get('/getUser/:id', getUserById)
indexRoutes.put('/updateUser/:id', updateUserById)
indexRoutes.delete('/deleteUser/:id', deleteUserById)

// contactus routes

indexRoutes.post('/createContactUs', createContactUs)
indexRoutes.get('/allContactUs', getAllContactUs)
indexRoutes.get('/getContactUs/:id', getContactUsById)
indexRoutes.delete('/deleteContactUs/:id', deleteContactUsById)

// FAQ Routes

indexRoutes.post('/createFaq', createFaq);
indexRoutes.get('/allFaqs', getAllFaqs)
indexRoutes.get('/getFaq/:id', getFaqById)
indexRoutes.put('/updateFaq/:id', updateFaqById)
indexRoutes.delete('/deleteFaq/:id', deleteFaqById)


// Terms & Condition Routes

indexRoutes.post('/createTerm', createTerms)
indexRoutes.get('/allTerms', getAllTerms)
indexRoutes.get('/getTerms/:id', getTermsById)
indexRoutes.put('/updateTerms/:id', updateTermsById)
indexRoutes.delete('/deleteTerms/:id',deleteTermsAndById)

module.exports = indexRoutes;
