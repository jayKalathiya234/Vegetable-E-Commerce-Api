const express = require("express");
const { createUser } = require("../controller/userController");
const indexRoutes = express.Router();

indexRoutes.post("/createUser", createUser);
module.exports = indexRoutes;
