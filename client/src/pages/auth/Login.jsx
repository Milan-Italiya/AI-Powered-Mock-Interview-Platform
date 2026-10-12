import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Sparkles,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import { loginUser } from "../../usecase/auth.usecase";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // =========================
    // STATE
    // =========================

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // FORM VALUES
    // =========================

    const { email, password } = formData;

    // =========================
    // HELPERS
    // =========================

    const updateField = useCallback((field, value) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));

        setError("");
    }, []);

    const validateForm = () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            return "Please enter your email and password.";
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            return "Please enter a valid email address.";
        }

        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }

        return "";
    };

    // =========================
    // LOGIN HANDLER
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);

            toast.error("Unable to sign in", {
                description: validationError,
            });

            return;
        }

        try {
            setLoading(true);

            const response = await loginUser({
                email: email.trim().toLowerCase(),
                password,
            });

            const token =
                response?.token ||
                response?.data?.token;

            if (!token) {
                throw new Error(
                    "Token was not received from the server."
                );
            }

            // Save authentication token
            login(token);

            const user =
                response?.user ||
                response?.data?.user;

            const userName =
                user?.fullName?.trim() || "there";

            toast.success(`Welcome ${userName}!`, {
                description:
                    "You're successfully signed in to Synthex AI.",
            });

            navigate("/dashboard", {
                replace: true,
            });
        } catch (error) {
            console.error("Login error:", error);

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Login failed. Please try again.";

            setError(message);

            toast.error("Login failed", {
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

            <div
                className="pointer-events-none fixed inset-0 overflow-hidden"
                aria-hidden="true"
            >
                {/* Violet glow */}

                <motion.div
                    animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.25, 0.4, 0.25],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute left-[15%] top-[-250px] h-[550px] w-[550px] rounded-full bg-violet-600/20 blur-[150px]"
                />

                {/* Fuchsia glow */}

                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-[-200px] right-[5%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-[150px]"
                />

                {/* Grid */}

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
                    {/* Logo */}

                    <Link
                        to="/"
                        className="group flex items-center gap-3"
                    >
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
                            className="flex items-center gap-3"
                        >
                            {/* Logo Icon */}

                            <div className="relative">
                                <div
                                    className="absolute inset-0 rounded-xl bg-violet-500/30 blur-lg"
                                    aria-hidden="true"
                                />

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
                                    />

                                    <span
                                        className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-lg shadow-fuchsia-400"
                                        aria-hidden="true"
                                    />
                                </motion.div>
                            </div>

                            {/* Wordmark */}

                            <span className="text-lg font-semibold tracking-tight">
                                Synthex{" "}

                                <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                                    AI
                                </span>
                            </span>
                        </motion.div>
                    </Link>

                    {/* Back Home */}

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

            <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-12">
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
                    {/* =========================================
                        TOP LOGO
                    ========================================= */}

                    <div className="mb-7 flex justify-center">
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
                            <div
                                className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-2xl"
                                aria-hidden="true"
                            />

                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10">
                                <Sparkles
                                    size={29}
                                    strokeWidth={1.5}
                                    className="text-violet-300"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* =========================================
                        HEADING
                    ========================================= */}

                    <div className="text-center">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Welcome back
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            Continue your journey toward interview success.
                        </p>
                    </div>

                    {/* =========================================
                        LOGIN CARD
                    ========================================= */}

                    <div className="relative mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-violet-950/20 backdrop-blur-2xl sm:p-8">
                        {/* Card glow */}

                        <div
                            className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl"
                            aria-hidden="true"
                        />

                        <form
                            onSubmit={handleSubmit}
                            className="relative space-y-5"
                            noValidate
                        >
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
                                        value={email}
                                        onChange={(event) =>
                                            updateField(
                                                "email",
                                                event.target.value
                                            )
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        autoFocus
                                        disabled={loading}
                                        aria-invalid={Boolean(error)}
                                        className="h-13 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* =================================
                                PASSWORD
                            ================================= */}

                            <div>
                                <div className="mb-2.5 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-zinc-300"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-violet-400 transition-colors hover:text-violet-300"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

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
                                        value={password}
                                        onChange={(event) =>
                                            updateField(
                                                "password",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        className="h-13 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) => !previous
                                            )
                                        }
                                        disabled={loading}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={showPassword}
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
                                    aria-live="polite"
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* =================================
                                REMEMBER ME
                            ================================= */}

                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    disabled={loading}
                                    className="h-4 w-4 rounded border-white/10 bg-black/20 accent-violet-600 disabled:cursor-not-allowed"
                                />

                                <label
                                    htmlFor="remember"
                                    className="cursor-pointer text-xs text-zinc-500"
                                >
                                    Keep me signed in
                                </label>
                            </div>

                            {/* =================================
                                LOGIN BUTTON
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
                                className="group relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-medium shadow-lg shadow-violet-900/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {/* Button shine */}

                                <span
                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    aria-hidden="true"
                                />

                                {loading ? (
                                    <>
                                        <span
                                            className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                                            aria-hidden="true"
                                        />

                                        <span className="relative">
                                            Signing in...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative">
                                            Sign In
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

                        {/* =========================================
                            DIVIDER
                        ========================================= */}

                        <div className="my-7 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/[0.07]" />

                            <span className="text-xs text-zinc-600">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-white/[0.07]" />
                        </div>

                        {/* =========================================
                            REGISTER
                        ========================================= */}

                        <p className="text-center text-sm text-zinc-500">
                            Don't have an account?{" "}

                            <Link
                                to="/register"
                                className="font-medium text-violet-400 transition-colors hover:text-violet-300"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>

                    {/* =========================================
                        BOTTOM MESSAGE
                    ========================================= */}

                    <div className="mt-7 flex items-center justify-center gap-2 text-xs text-zinc-600">
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

export default Login;