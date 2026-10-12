import { loginUser, registerUser } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js"

//* Register Controller
export const register = async (req, res) => {
    try {
        // validate request body
        const validatedData = registerSchema.parse(req.body);

        // Register user
        const user = await registerUser(validatedData)

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: {
                user,
            },
        })
    } catch (error) {
        console.error("Register Error: ", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

//* Login controller

export const login = async (req, res) => {
    try {
        // Validate request body
        const validatedData = loginSchema.parse(req.body)

        // Login user
        const result = await loginUser(
            validatedData.email,
            validatedData.password
        )

        // Save JWT in HttpOnly Cookie
        // res.cookie("token", result.token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "Strict",
        //     maxAge: 7 * 24 * 60 * 60 * 1000,
        // })

        // ! above code is commented because i use the localstorage instead of the cookie in future i will change when i want to shift from localStorage to cookie we have to use one of that both.

        return res.status(200).json({
            success: true,
            message: "Login successfull.",
            data: {
                token: result.token,
                user: result.user,
            }
        })
    } catch (error) {
        console.error("Login Error: ", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}