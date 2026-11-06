import { loginUserDatasource, registerUserDatasource } from "../datasource/auth.datasource.js";

export const loginUser = async (loginData) => {
    if (!loginData) {
        throw new Error("Login data is missing.");
    }

    if (!loginData.email || !loginData.password) {
        throw new Error(
            "Email and password are required."
        );
    }

    return await loginUserDatasource(loginData);
};

export const registerUser = async (registerData) => {
    if (!registerData) {
        throw new Error("Register data is missing.");
    }

    const { fullName, email, password, confirmPassword, } = registerData;

    if (!fullName?.trim()) {
        throw new Error("FullName is required.")
    }

    if (!email?.trim()) {
        throw new Error("Email is required.")
    }

    if (!password?.trim()) {
        throw new Error("Password is required.")
    }

    if (!confirmPassword?.trim()) {
        throw new Error("Confirm password is required.");
    }

    if (password !== confirmPassword) {
        throw new Error("Password do not match.");
    }

    return await registerUserDatasource(registerData);

}