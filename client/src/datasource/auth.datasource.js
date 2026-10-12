import api from "../lib/axios.js"

export const loginUserDatasource = async (loginData) => {
    // console.log("Login data sent to backend:", loginData);
    const response = await api.post("/api/v1/auth/login", loginData)
    return response.data
}

export const registerUserDatasource = async (registerData) => {
    // console.log("Register data sent to backend: ", registerData)
    const response = await api.post("/api/v1/auth/register", registerData)
    return response.data
}