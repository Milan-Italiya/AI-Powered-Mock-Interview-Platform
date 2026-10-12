import { useState } from "react";
import { motion } from "motion/react";
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Sparkles,
    User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { registerUser } from "../../usecase/auth.usecase";

const Register = () => {
    const navigate = useNavigate();

    // =========================
    // STATE
    // =========================

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // FORM HELPERS
    // =========================

    const updateField = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const validateForm = () => {
        const { fullName, email, password, confirmPassword } = formData;

        if (
            !fullName.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            return "Please fill in all required fields.";
        }

        if (fullName.trim().length < 3) {
            return "Full name must be at least 3 characters.";
        }

        if (fullName.trim().length > 50) {
            return "Full name must not exceed 50 characters.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return "Please enter a valid email address.";
        }

        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }

        if (password !== confirmPassword) {
            return "Passwords do not match.";
        }

        return "";
    };

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);

            toast.error("Please check your details", {
                description: validationError,
            });

            return;
        }

        try {
            setLoading(true);

            const response = await registerUser({
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });

            console.log("Register response:", response);

            toast.success("Account created successfully.", {
                description: "Redirecting you to the login page...",
            });

            // Clear form after successful registration
            setFormData({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            // Small delay so the success toast can be seen
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1000);
        } catch (error) {
            console.error("Registration error:", error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Registration failed. Please try again.";

            setError(message);

            toast.error("Registration failed", {
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // UI
    // =========================

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05050a] text-white">
            {/* =========================================
                BACKGROUND
            ========================================= */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.22, 0.38, 0.22],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute left-[10%] top-[-250px] h-[550px] w-[550px] rounded-full bg-violet-600/20 blur-[150px]"
                />

                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.14, 0.28, 0.14],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-[-200px] right-[5%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-[150px]"
                />

                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* =========================================
                NAVBAR
            ========================================= */}

            <header className="relative z-20">
                <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                    <Link to="/">
                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -20,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            whileHover={{
                                scale: 1.02,
                            }}
                            className="group flex items-center gap-3"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 rounded-xl bg-violet-500/30 blur-lg" />

                                <motion.div
                                    whileHover={{
                                        rotate: 6,
                                    }}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10"
                                >
                                    <Sparkles
                                        size={20}
                                        strokeWidth={1.6}
                                        className="text-violet-200"
                                        aria-hidden="true"
                                    />

                                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-lg shadow-fuchsia-400" />
                                </motion.div>
                            </div>

                            <span className="text-lg font-semibold tracking-tight">
                                Synthex{" "}
                                <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                                    AI
                                </span>
                            </span>
                        </motion.div>
                    </Link>

                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                        <ArrowLeft
                            size={16}
                            aria-hidden="true"
                        />

                        Back to Home
                    </Link>
                </nav>
            </header>

            {/* =========================================
                MAIN
            ========================================= */}

            <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30,
                        scale: 0.97,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.6,
                        ease: "easeOut",
                    }}
                    className="w-full max-w-md"
                >
                    {/* =====================================
                        ICON
                    ===================================== */}

                    <div className="mb-6 flex justify-center">
                        <motion.div
                            animate={{
                                y: [0, -5, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="relative"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-2xl" />

                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10">
                                <Sparkles
                                    size={29}
                                    strokeWidth={1.5}
                                    className="text-violet-300"
                                    aria-hidden="true"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* =====================================
                        HEADING
                    ===================================== */}

                    <div className="text-center">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Create your account
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            Start preparing smarter for your next interview.
                        </p>
                    </div>

                    {/* =====================================
                        CARD
                    ===================================== */}

                    <div className="relative mt-7 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-violet-950/20 backdrop-blur-2xl sm:p-8">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

                        <form
                            onSubmit={handleSubmit}
                            className="relative space-y-4"
                            noValidate
                        >
                            {/* =================================
                                FULL NAME
                            ================================= */}

                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="mb-2.5 block text-sm font-medium text-zinc-300"
                                >
                                    Full name
                                </label>

                                <div className="group relative">
                                    <User
                                        size={18}
                                        strokeWidth={1.7}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400"
                                        aria-hidden="true"
                                    />

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            updateField(
                                                "fullName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Milan Italiya"
                                        autoComplete="name"
                                        maxLength={50}
                                        disabled={loading}
                                        className="h-13 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* =================================
                                EMAIL
                            ================================= */}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2.5 block text-sm font-medium text-zinc-300"
                                >
                                    Email address
                                </label>

                                <div className="group relative">
                                    <Mail
                                        size={18}
                                        strokeWidth={1.7}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400"
                                        aria-hidden="true"
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            updateField(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        maxLength={100}
                                        disabled={loading}
                                        className="h-13 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* =================================
                                PASSWORD
                            ================================= */}

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2.5 block text-sm font-medium text-zinc-300"
                                >
                                    Password
                                </label>

                                <div className="group relative">
                                    <LockKeyhole
                                        size={18}
                                        strokeWidth={1.7}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400"
                                        aria-hidden="true"
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.password}
                                        onChange={(e) =>
                                            updateField(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Create a strong password"
                                        autoComplete="new-password"
                                        disabled={loading}
                                        className="h-13 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        disabled={loading}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                size={18}
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Eye
                                                size={18}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-zinc-600">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            {/* =================================
                                CONFIRM PASSWORD
                            ================================= */}

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2.5 block text-sm font-medium text-zinc-300"
                                >
                                    Confirm password
                                </label>

                                <div className="group relative">
                                    <LockKeyhole
                                        size={18}
                                        strokeWidth={1.7}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400"
                                        aria-hidden="true"
                                    />

                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            updateField(
                                                "confirmPassword",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        disabled={loading}
                                        className="h-13 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        disabled={loading}
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff
                                                size={18}
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Eye
                                                size={18}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* =================================
                                ERROR
                            ================================= */}

                            {error && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: -8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    role="alert"
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* =================================
                                SUBMIT
                            ================================= */}

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={
                                    !loading
                                        ? {
                                              scale: 1.01,
                                          }
                                        : undefined
                                }
                                whileTap={
                                    !loading
                                        ? {
                                              scale: 0.98,
                                          }
                                        : undefined
                                }
                                className="group relative mt-2 flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-medium shadow-lg shadow-violet-900/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                {loading ? (
                                    <>
                                        <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                        <span className="relative">
                                            Creating account...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative">
                                            Create Account
                                        </span>

                                        <ArrowRight
                                            size={18}
                                            className="relative transition-transform group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* =====================================
                            DIVIDER
                        ===================================== */}

                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/[0.07]" />

                            <span className="text-xs text-zinc-600">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-white/[0.07]" />
                        </div>

                        {/* =====================================
                            LOGIN LINK
                        ===================================== */}

                        <p className="text-center text-sm text-zinc-500">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-violet-400 transition-colors hover:text-violet-300"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* =====================================
                        FOOTER
                    ===================================== */}

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
                        <Sparkles
                            size={13}
                            className="text-violet-500"
                            aria-hidden="true"
                        />

                        AI-powered interview preparation
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Register;