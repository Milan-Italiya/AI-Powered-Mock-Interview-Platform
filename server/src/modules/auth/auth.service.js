import bcrypt from "bcryptjs"
import User from "../../models/user.model.js";
import { generateToken } from "../../utils/jwt.js";


//* Register a new User

export const registerUser = async (userData) => {
    const { fullName, email, password } = userData

    console.log("Register email:", email);

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (existingUser) {
        throw new Error("User already exist with this email.")
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
        fullName,
        email,
        password: hashedPassword
    })

    // Return a User without password
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    }
}

//* Login User

export const loginUser = async (email, password) => {
    // Include password because it's hidden using select: false
    const user = await User.findOne({ email: email }).select("+password")

    if (!user) {
        throw new Error("Invalid email or password.")
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        throw new Error("Invalid email or password.")
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save();

    // send userId as a token as a jwtToken
    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            lastlogin: user.lastLogin
        },
    }
}