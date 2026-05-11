import React, { useContext, useState } from "react";
import {
    Button,
    Col,
    Divider,
    Form,
    Input,
    Modal,
    Space,
    notification,
    Row
} from "antd";
import {
    loginApi,
    requestForgotPasswordOtpApi,
    verifyForgotPasswordOtpApi,
    resetPasswordWithOtpApi
} from "../util/api";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { ArrowLeftOutlined } from "@ant-design/icons";

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);

    const [forgotOpen, setForgotOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: gui OTP, 2: xac nhan OTP, 3: dat mat khau moi
    const [loadingOtp, setLoadingOtp] = useState(false);
    const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);
    const [forgotForm] = Form.useForm();

    const onFinish = async (values) => {
        const { email, password } = values;
        const res = await loginApi(email, password);

        if (res && res.EC === 0) {
            localStorage.setItem("access_token", res.access_token);
            notification.success({
                message: "Đăng nhập",
                description: "Đăng nhập thành công"
            });

            setAuth({
                isAuthenticated: true,
                user: {
                    email: res?.user?.email ?? "",
                    name: res?.user?.name ?? ""
                }
            });

            navigate("/");
        } else {
            notification.error({
                message: "Đăng nhập",
                description: res?.EM ?? "Có lỗi xảy ra"
            });
        }
    };

    const openForgotModal = () => {
        setForgotOpen(true);
        setStep(1);
        forgotForm.resetFields();
    };

    const closeForgotModal = () => {
        setForgotOpen(false);
        setStep(1);
        forgotForm.resetFields();
    };

    const handleRequestOtp = async () => {
        try {
            const values = await forgotForm.validateFields(["email"]);
            setLoadingOtp(true);
            const res = await requestForgotPasswordOtpApi(values.email);

            if (res?.EC === 0) {
                setStep(2);
                notification.success({
                    message: "Quên mật khẩu",
                    description: "OTP đã được gửi về email của bạn"
                });
            } else {
                notification.error({
                    message: "Quên mật khẩu",
                    description: res?.EM ?? "Không thể gửi OTP"
                });
            }
        } finally {
            setLoadingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const values = await forgotForm.validateFields(["email", "otp"]);
            setLoadingVerifyOtp(true);
            const res = await verifyForgotPasswordOtpApi(values.email, values.otp);

            if (res?.EC === 0) {
                forgotForm.setFieldsValue({
                    newPassword: "",
                    confirmNewPassword: ""
                });
                setStep(3);
                notification.success({
                    message: "Quên mật khẩu",
                    description: "Xác nhận OTP thành công"
                });
            } else {
                notification.error({
                    message: "Quên mật khẩu",
                    description: res?.EM ?? "OTP không hợp lệ"
                });
            }
        } finally {
            setLoadingVerifyOtp(false);
        }
    };

    const handleResetPassword = async () => {
        try {
            const values = await forgotForm.validateFields([
                "email",
                "newPassword",
                "confirmNewPassword"
            ]);

            setLoadingReset(true);
            const res = await resetPasswordWithOtpApi(values.email, values.newPassword);

            if (res?.EC === 0) {
                notification.success({
                    message: "Quên mật khẩu",
                    description: "Đặt lại mật khẩu thành công"
                });
                closeForgotModal();
            } else {
                notification.error({
                    message: "Quên mật khẩu",
                    description: res?.EM ?? "Không thể đặt lại mật khẩu"
                });
            }
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <Row justify={"center"} style={{ marginTop: "30px" }}>
            <Col xs={24} md={16} lg={8}>
                <fieldset
                    style={{
                        padding: "15px",
                        margin: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}
                >
                    <legend>Đăng Nhập</legend>

                    <Form name="basic" onFinish={onFinish} autoComplete="off" layout="vertical">
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    Đăng nhập
                                </Button>
                                <Button type="link" onClick={openForgotModal}>
                                    Quên mật khẩu?
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>

                    <Link to={"/"}>
                        <ArrowLeftOutlined /> Quay lại trang chủ
                    </Link>

                    <Divider />

                    <div style={{ textAlign: "center" }}>
                        Chưa có tài khoản? <Link to={"/register"}>Đăng ký tại đây</Link>
                    </div>
                </fieldset>
            </Col>

            <Modal
                title="Quên mật khẩu"
                open={forgotOpen}
                onCancel={closeForgotModal}
                footer={null}
                destroyOnClose
            >
                <Form form={forgotForm} layout="vertical" autoComplete="off">
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không đúng định dạng!" }
                        ]}
                    >
                        <Input placeholder="your-email@example.com" />
                    </Form.Item>

                    {step === 1 && (
                        <Form.Item>
                            <Button type="primary" loading={loadingOtp} onClick={handleRequestOtp}>
                                Gửi OTP
                            </Button>
                        </Form.Item>
                    )}

                    {step >= 2 && (
                        <Form.Item
                            label="Mã OTP"
                            name="otp"
                            rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
                        >
                            <Input placeholder="Nhập mã OTP gồm 6 số" />
                        </Form.Item>
                    )}

                    {step === 2 && (
                        <Form.Item>
                            <Button type="primary" loading={loadingVerifyOtp} onClick={handleVerifyOtp}>
                                Xác nhận OTP
                            </Button>
                        </Form.Item>
                    )}

                    {step === 3 && (
                        <>
                            <Form.Item
                                label="Mật khẩu mới"
                                name="newPassword"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                label="Xác nhận mật khẩu mới"
                                name="confirmNewPassword"
                                dependencies={["newPassword"]}
                                rules={[
                                    { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("newPassword") === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("Xác nhận mật khẩu không khớp!"));
                                        }
                                    })
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" loading={loadingReset} onClick={handleResetPassword}>
                                    Đặt lại mật khẩu
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </Row>
    );
};

export default LoginPage;
