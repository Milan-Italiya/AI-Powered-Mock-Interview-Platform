import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "motion/react";
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Moon,
    Sparkles,
    Sun,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { loginUser } from "../../usecase/auth.usecase";
import BrandMark from "../../components/common/BrandMark.jsx";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    // =========================
    // THEME STYLES
    // =========================

    const pageClasses = isDark
        ? "bg-[#080810] text-white"
        : "bg-[#f7f7fc] text-slate-800";

    const headingClasses = isDark
        ? "text-white/90"
        : "text-slate-800";

    const labelClasses = isDark
        ? "text-white/75"
        : "text-slate-600";

    const secondaryTextClasses = isDark
        ? "text-white/60"
        : "text-slate-500";

    const mutedTextClasses = isDark
        ? "text-white/50"
        : "text-slate-500";

    const cardClasses = isDark
        ? "border-white/[0.09] bg-[#11111c]/85 shadow-violet-950/20"
        : "border-slate-200/90 bg-white/90 shadow-violet-200/30";

    const inputClasses = isDark
        ? "border-white/[0.10] bg-black/20 text-white/90 placeholder:text-white/35 focus:border-violet-400/50 focus:bg-violet-500/[0.04] focus:ring-violet-500/[0.08]"
        : "border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:border-violet-400/70 focus:bg-violet-50/40 focus:ring-violet-500/[0.08]";

    const inputIconClasses = isDark
        ? "text-white/40 group-focus-within:text-violet-300"
        : "text-slate-400 group-focus-within:text-violet-600";

    const dividerClasses = isDark
        ? "bg-white/[0.10]"
        : "bg-slate-200";

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

    const { email, password } = formData;

    // =========================
    // FORM HELPERS
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            return "Please enter a valid email address.";
        }

        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }

        return "";
    };

    // =========================
    // CLICK-ORIGIN THEME MORPH
    // =========================

    const handleThemeToggle = (event) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const radius =
            Math.hypot(
                Math.max(x, width - x),
                Math.max(y, height - y)
            ) * 3;

        const root = document.documentElement;

        root.style.setProperty(
            "--sparkle-start",
            `${x}px ${y}px`
        );

        const sparklePoints = [
            [0, -1],
            [0.55, -0.55],
            [1, 0],
            [0.55, 0.55],
            [0, 1],
            [-0.55, 0.55],
            [-1, 0],
            [-0.55, -0.55],
        ];

        sparklePoints.forEach(([dx, dy], index) => {
            const pointX = x + dx * radius;
            const pointY = y + dy * radius;

            root.style.setProperty(
                `--sparkle-p${index + 1}`,
                `${pointX}px ${pointY}px`
            );
        });

        if (
            !document.startViewTransition ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            toggleTheme();
            return;
        }

        document.startViewTransition(() => {
            flushSync(() => {
                toggleTheme();
            });
        });
    };

    // =========================
    // LOGIN HANDLER
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

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
        <div
            data-theme={theme}
            className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${pageClasses}`}
        >
            {/* BACKGROUND */}

            <div
                className="pointer-events-none fixed inset-0 overflow-hidden"
                aria-hidden="true"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.08, 1],
                        opacity: isDark
                            ? [0.18, 0.30, 0.18]
                            : [0.12, 0.22, 0.12],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className={`absolute left-[10%] top-[-250px] h-[550px] w-[550px] rounded-full blur-[150px] ${
                        isDark
                            ? "bg-violet-600/25"
                            : "bg-violet-400/25"
                    }`}
                />

                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: isDark
                            ? [0.12, 0.23, 0.12]
                            : [0.10, 0.19, 0.10],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className={`absolute bottom-[-200px] right-[5%] h-[500px] w-[500px] rounded-full blur-[150px] ${
                        isDark
                            ? "bg-fuchsia-600/15"
                            : "bg-fuchsia-400/20"
                    }`}
                />

                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: isDark
                            ? "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)"
                            : "linear-gradient(rgba(109,40,217,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(109,40,217,.10) 1px, transparent 1px)",
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* NAVBAR */}

            <header className="relative z-20">
                <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

                    {/* LOGO */}

                    <Link to="/">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="group flex items-center gap-3"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 rounded-xl bg-violet-500/25 blur-lg" />

                                <motion.div
                                    whileHover={{ rotate: 6 }}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10"
                                >
                                <BrandMark/>

                                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-lg shadow-fuchsia-400" />
                                </motion.div>
                            </div>

                            <span className={`text-lg font-semibold tracking-tight ${headingClasses}`}>
                                Synthex{" "}
                                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                                    AI
                                </span>
                            </span>
                        </motion.div>
                    </Link>

                    {/* NAV ACTIONS */}

                    <div className="flex items-center gap-3 sm:gap-5">
                        <button
                            type="button"
                            onClick={handleThemeToggle}
                            aria-label={
                                isDark
                                    ? "Switch to light theme"
                                    : "Switch to dark theme"
                            }
                            title={
                                isDark
                                    ? "Switch to light theme"
                                    : "Switch to dark theme"
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                                isDark
                                    ? "border-white/10 bg-white/[0.05] text-amber-300 hover:bg-white/10"
                                    : "border-slate-200 bg-white/80 text-violet-600 shadow-sm hover:bg-violet-50"
                            }`}
                        >
                            <motion.span
                                key={isDark ? "sun" : "moon"}
                                initial={{
                                    rotate: -35,
                                    opacity: 0,
                                    scale: 0.7,
                                }}
                                animate={{
                                    rotate: 0,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                transition={{ duration: 0.25 }}
                            >
                                {isDark ? (
                                    <Sun size={18} />
                                ) : (
                                    <Moon size={18} />
                                )}
                            </motion.span>
                        </button>

                        <Link
                            to="/"
                            className={`flex items-center gap-2 text-sm transition-colors ${
                                isDark
                                    ? "text-white/65 hover:text-white"
                                    : "text-slate-600 hover:text-violet-700"
                            }`}
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </nav>
            </header>

            {/* MAIN */}

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

                    {/* ICON */}

                    <div className="mb-6 flex justify-center">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="relative"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-violet-500/25 blur-2xl" />

                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10">
                                <Sparkles
                                    size={29}
                                    strokeWidth={1.5}
                                    className={
                                        isDark
                                            ? "text-violet-300"
                                            : "text-violet-600"
                                    }
                                    aria-hidden="true"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* HEADING */}

                    <div className="text-center">
                        <h1 className={`text-3xl font-semibold tracking-tight sm:text-4xl ${headingClasses}`}>
                            Welcome back
                        </h1>

                        <p className={`mt-3 text-sm leading-6 ${secondaryTextClasses}`}>
                            Continue your journey toward interview success.
                        </p>
                    </div>

                    {/* LOGIN CARD */}

                    <div
                        className={`relative mt-7 overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-2xl transition-colors duration-300 sm:p-8 ${cardClasses}`}
                    >
                        <div
                            className={`pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl ${
                                isDark
                                    ? "bg-violet-500/10"
                                    : "bg-violet-400/15"
                            }`}
                        />

                        <form
                            onSubmit={handleSubmit}
                            className="relative space-y-5"
                            noValidate
                        >
                            {/* EMAIL */}

                            <div>
                                <label
                                    htmlFor="email"
                                    className={`mb-2.5 block text-sm font-medium ${labelClasses}`}
                                >
                                    Email address
                                </label>

                                <div className="group relative">
                                    <Mail
                                        size={18}
                                        strokeWidth={1.7}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${inputIconClasses}`}
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
                                        className={`h-[52px] w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${inputClasses}`}
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}

                            <div>
                                <div className="mb-2.5 flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className={`text-sm font-medium ${labelClasses}`}
                                    >
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className={`text-xs font-medium transition-colors ${
                                            isDark
                                                ? "text-violet-300 hover:text-violet-200"
                                                : "text-violet-700 hover:text-violet-800"
                                        }`}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="group relative">
                                    <LockKeyhole
                                        size={18}
                                        strokeWidth={1.7}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${inputIconClasses}`}
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
                                        className={`h-[52px] w-full rounded-xl border pl-11 pr-12 text-sm outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${inputClasses}`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        disabled={loading}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={showPassword}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                            isDark
                                                ? "text-white/45 hover:text-white/85"
                                                : "text-slate-400 hover:text-slate-700"
                                        }`}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} aria-hidden="true" />
                                        ) : (
                                            <Eye size={18} aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* ERROR */}

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
                                    className={`rounded-xl border px-4 py-3 text-sm ${
                                        isDark
                                            ? "border-red-400/20 bg-red-500/10 text-red-300"
                                            : "border-red-200 bg-red-50 text-red-700"
                                    }`}
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* REMEMBER ME */}

                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    disabled={loading}
                                    className="h-4 w-4 rounded accent-violet-600 disabled:cursor-not-allowed"
                                />

                                <label
                                    htmlFor="remember"
                                    className={`cursor-pointer text-xs font-medium ${mutedTextClasses}`}
                                >
                                    Keep me signed in
                                </label>
                            </div>

                            {/* LOGIN BUTTON */}

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={
                                    !loading
                                        ? { scale: 1.01 }
                                        : undefined
                                }
                                whileTap={
                                    !loading
                                        ? { scale: 0.98 }
                                        : undefined
                                }
                                className="group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-medium text-white shadow-lg shadow-violet-900/20 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                {loading ? (
                                    <>
                                        <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

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

                        {/* DIVIDER */}

                        <div className="my-6 flex items-center gap-4">
                            <div className={`h-px flex-1 ${dividerClasses}`} />

                            <span className={`text-xs ${mutedTextClasses}`}>
                                OR
                            </span>

                            <div className={`h-px flex-1 ${dividerClasses}`} />
                        </div>

                        {/* REGISTER LINK */}

                        <p className={`text-center text-sm ${secondaryTextClasses}`}>
                            Don't have an account?{" "}

                            <Link
                                to="/register"
                                className={`font-medium transition-colors ${
                                    isDark
                                        ? "text-violet-300 hover:text-violet-200"
                                        : "text-violet-700 hover:text-violet-800"
                                }`}
                            >
                                Create account
                            </Link>
                        </p>
                    </div>

                    {/* FOOTER */}

                    <div className={`mt-6 flex items-center justify-center gap-2 text-xs ${mutedTextClasses}`}>
                        <Sparkles
                            size={13}
                            className={
                                isDark
                                    ? "text-violet-400"
                                    : "text-violet-600"
                            }
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
