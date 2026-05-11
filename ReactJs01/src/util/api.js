import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    }

    return axios.post(URL_API, data)
}

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    }

    return axios.post(URL_API, data)
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API)
}

const requestForgotPasswordOtpApi = (email) => {
    const URL_API = "/v1/api/forgot-password/request-otp";
    return axios.post(URL_API, { email });
}

const verifyForgotPasswordOtpApi = (email, otp) => {
    const URL_API = "/v1/api/forgot-password/verify-otp";
    return axios.post(URL_API, { email, otp });
}

const resetPasswordWithOtpApi = (email, newPassword) => {
    const URL_API = "/v1/api/forgot-password/reset";
    return axios.post(URL_API, { email, newPassword });
}

export {
    createUserApi,
    loginApi,
    getUserApi,
    requestForgotPasswordOtpApi,
    verifyForgotPasswordOtpApi,
    resetPasswordWithOtpApi
}
