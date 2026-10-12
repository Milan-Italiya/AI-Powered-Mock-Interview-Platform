import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {

    // ? ==========Basic Information==========
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "password must be at least 8 characters"],
      select: false,
    },

    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },


    // ? ==========Account==========
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // ? ==========Carrer Profile==========
    selectedRole: {
      type: String,
      enum: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Java Developer",
        "Python Developer",
        "Data Analyst",
        "DevOps Engineer",
        "UI/UX Designer",
      ],
      default: null,
    },

    experienceLevel: {
      type: String,
      enum: ["Student", "Fresher", "1-2 Years", "3-5 Years", "5+ Years"],
      default: null,
    },
    targetCompany: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    learningGoals: {
      type: [String],
      default: [],
    },

    // ? ==========Interview Preferences==========
    preferredDifficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    preferredInterviewType: {
      type: String,
      enum: ["Technical", "HR", "Behavioral", "Mixed"],
      default: "Mixed",
    },

    //  ? ==========Analytics==========
    interviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    weakTopics: {
      type: [String],
      default: [],
    },

    strongTopics: {
      type: [String],
      default: [],
    },

    // ? ==========Subscription==========
    subscription: {
      type: String,
      enum: ["Free", "Pro"],
      default: "Free",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
// userSchema.index({ email: 1 })

// Export User
const User = mongoose.model("User", userSchema);

export default User;
