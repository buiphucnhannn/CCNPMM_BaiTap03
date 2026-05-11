const {
    createUserService,
    loginService,
    getUserService,
    requestForgotPasswordService,
    verifyForgotPasswordOtpService,
    resetPasswordWithOtpService
} = require("../services/userService");

const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data)
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);

    return res.status(200).json(data)
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data)
}

const getAccount = async (req, res) => {

    return res.status(200).json(req.user)
}

const requestForgotPassword = async (req, res) => {
    const { email } = req.body;
    const data = await requestForgotPasswordService(email);
    return res.status(200).json(data);
};

const resetPasswordWithOtp = async (req, res) => {
    const { email, newPassword } = req.body;
    const data = await resetPasswordWithOtpService(email, newPassword);
    return res.status(200).json(data);
};

const verifyForgotPasswordOtp = async (req, res) => {
    const { email, otp } = req.body;
    const data = await verifyForgotPasswordOtpService(email, otp);
    return res.status(200).json(data);
};

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    requestForgotPassword,
    verifyForgotPasswordOtp,
    resetPasswordWithOtp
}
