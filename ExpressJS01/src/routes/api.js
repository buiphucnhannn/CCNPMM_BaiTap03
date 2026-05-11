const express = require('express');

const {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    requestForgotPassword,
    verifyForgotPasswordOtp,
    resetPasswordWithOtp
} = require('../controllers/userController.js');

const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

routerAPI.use(auth);

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Bùi Phúc Nhân! Hello world! HomePage API")
})

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/forgot-password/request-otp", requestForgotPassword);
routerAPI.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
routerAPI.post("/forgot-password/reset", resetPasswordWithOtp);

routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI; // export default
