require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const saltRounds = 10;
const otpStore = new Map();

const OTP_EXPIRE_MS = 5 * 60 * 1000;
let mailTransporter;

const sendOtpEmail = async (email, otp) => {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        SMTP_FROM
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
        throw new Error("Thiếu cấu hình SMTP trong biến môi trường");
    }

    if (!mailTransporter) {
        mailTransporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });
    }

    await mailTransporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: "OTP đặt lại mật khẩu",
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h3>OTP đặt lại mật khẩu</h3>
                <p>Mã OTP của bạn là: <b>${otp}</b></p>
                <p>Mã có hiệu lực trong <b>5 phút</b>.</p>
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
            </div>
        `
    });
};

const createUserService = async (name, email, password) => {
    try {
        // check user exist
        const user = await User.findOne({ email });
        if (user) {
            console.log(`>>> user exist, chọn 1 email khác: ${email}`);
            return null;
        }

        // hash user password
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // save user to database
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "User"
        });
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
};

const loginService = async (email1, password) => {
    try {
        // fetch user by email
        const user = await User.findOne({ email: email1 });
        if (user) {
            // compare password
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email hoặc Password không đúng!"
                };
            } else {
                // create an access token
                const payload = {
                    email: user.email,
                    name: user.name
                };

                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE
                    }
                );

                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email hoặc Password không đúng!"
            };
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password");
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
};

const requestForgotPasswordService = async (email) => {
    try {
        if (!email) {
            return {
                EC: 1,
                EM: "Email không hợp lệ"
            };
        }

        const user = await User.findOne({ email });

        if (!user) {
            return {
                EC: 2,
                EM: "Email chưa được đăng ký tài khoản"
            };
        }

        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + OTP_EXPIRE_MS,
            verified: false
        });

        await sendOtpEmail(email, otp);

        return {
            EC: 0,
            EM: "OTP đã được gửi về email của bạn"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Lỗi máy chủ"
        };
    }
};

const verifyForgotPasswordOtpService = async (email, otp) => {
    try {
        if (!email || !otp) {
            return {
                EC: 1,
                EM: "Dữ liệu không hợp lệ"
            };
        }

        const otpData = otpStore.get(email);
        if (!otpData) {
            return {
                EC: 2,
                EM: "OTP không tồn tại hoặc đã hết hạn"
            };
        }

        if (Date.now() > otpData.expiresAt) {
            otpStore.delete(email);
            return {
                EC: 3,
                EM: "OTP đã hết hạn"
            };
        }

        if (`${otpData.otp}` !== `${otp}`) {
            return {
                EC: 4,
                EM: "OTP không chính xác"
            };
        }

        otpStore.set(email, {
            ...otpData,
            verified: true
        });

        return {
            EC: 0,
            EM: "Xác nhận OTP thành công"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Lỗi máy chủ"
        };
    }
};

const resetPasswordWithOtpService = async (email, newPassword) => {
    try {
        if (!email || !newPassword) {
            return {
                EC: 1,
                EM: "Dữ liệu không hợp lệ"
            };
        }

        const otpData = otpStore.get(email);
        if (!otpData || !otpData.verified) {
            return {
                EC: 2,
                EM: "Bạn cần xác nhận OTP trước khi đặt lại mật khẩu"
            };
        }

        if (Date.now() > otpData.expiresAt) {
            otpStore.delete(email);
            return {
                EC: 3,
                EM: "OTP đã hết hạn"
            };
        }

        const user = await User.findOne({ email });
        if (!user) {
            otpStore.delete(email);
            return {
                EC: 5,
                EM: "Tài khoản không tồn tại"
            };
        }

        const hashPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashPassword;
        await user.save();
        otpStore.delete(email);

        return {
            EC: 0,
            EM: "Đặt lại mật khẩu thành công"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Lỗi máy chủ"
        };
    }
};

module.exports = {
    createUserService,
    loginService,
    getUserService,
    requestForgotPasswordService,
    verifyForgotPasswordOtpService,
    resetPasswordWithOtpService
};
