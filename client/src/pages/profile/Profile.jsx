import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    ArrowLeft,
    Briefcase,
    CheckCircle2,
    FileText,
    GraduationCap,
    Mail,
    Pen,
    Target,
    User,
    Wrench,
    AlertTriangle,
    LoaderCircle,
    RefreshCw,
    Sparkles,
    CalendarDays,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/dashboard/Sidebar.jsx";
import { getProfile } from "../../usecase/user.usecase.js";
import { useAuth } from "../../context/AuthContext.jsx";

const EMPTY_PROFILE = {
    fullName: "",
    email: "",
    role: "user",
    profilePicture: "",
    bio: "",
    skills: [],
    learningGoals: [],
};

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem("sidebar-collapsed") === "true"
    );
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "sidebar-collapsed") {
                setCollapsed(event.newValue === "true");
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getProfile();
            const profile =
                response?.data?.user ??
                response?.user ??
                response?.data?.profile ??
                response?.profile ??
                response?.data?.data?.user ??
                response?.data?.data?.profile ??
                null;

            if (!profile || typeof profile !== "object") {
                throw new Error("Profile information was not found.");
            }

            setUser({
                ...EMPTY_PROFILE,
                ...profile,
                skills: Array.isArray(profile.skills) ? profile.skills : [],
                learningGoals: Array.isArray(profile.learningGoals)
                    ? profile.learningGoals
                    : [],
            });
        } catch (fetchError) {
            console.error("Profile Error:", fetchError);
            setError(
                fetchError?.response?.data?.message ||
                    fetchError?.message ||
                    "Unable to load your profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getProfile();
                const profile =
                    response?.data?.user ??
                    response?.user ??
                    response?.data?.profile ??
                    response?.profile ??
                    response?.data?.data?.user ??
                    response?.data?.data?.profile ??
                    null;

                if (!profile || typeof profile !== "object") {
                    throw new Error("Profile information was not found.");
                }

                if (!cancelled) {
                    setUser({
                        ...EMPTY_PROFILE,
                        ...profile,
                        skills: Array.isArray(profile.skills) ? profile.skills : [],
                        learningGoals: Array.isArray(profile.learningGoals)
                            ? profile.learningGoals
                            : [],
                    });
                }
            } catch (fetchError) {
                if (cancelled) return;
                console.error("Profile Error:", fetchError);
                setError(
                    fetchError?.response?.data?.message ||
                        fetchError?.message ||
                        "Unable to load your profile. Please try again."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadProfile();
        return () => {
            cancelled = true;
        };
    }, []);

    const formatDate = (date) => {
        if (!date) return "Not available";
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return "Not available";

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getInitials = (fullName) => {
        const name = String(fullName ?? "").trim();
        if (!name) return "U";
        return (
            name
                .split(/\s+/)
                .map((part) => part.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase() || "U"
        );
    };

    const editProfile = () => navigate("/profile/edit");

    const profileCompletion = user
        ? [
              Boolean(user.fullName?.trim()),
              Boolean(user.email?.trim()),
              Boolean(user.bio?.trim()),
              Boolean(user.selectedRole?.trim()),
              Boolean(user.experienceLevel?.trim()),
              Array.isArray(user.skills) && user.skills.length > 0,
          ].filter(Boolean).length
        : 0;
    const completionPercent = Math.round((profileCompletion / 6) * 100);

    return (
        <div className="min-h-screen w-full overflow-x-clip bg-[#08080c] text-white">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onLogout={logout}
            />

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`min-h-screen min-w-0 overflow-x-clip pt-16 transition-[margin] duration-300 ease-in-out md:pt-0 ${
                    collapsed ? "md:ml-20" : "md:ml-[260px]"
                }`}
            >
                <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-white/[0.07] bg-[#08080c]/85 px-4 py-3 backdrop-blur-xl sm:px-6 md:min-h-20 md:px-8">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-violet-300">
                            <Sparkles size={14} />
                            <span>Account management</span>
                        </div>
                        <h1 className="mt-1 truncate text-lg font-semibold sm:text-xl">
                            My Profile
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 sm:px-4"
                    >
                        <ArrowLeft size={15} />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                        <span className="sm:hidden">Dashboard</span>
                    </button>
                </header>

                <div className="mx-auto w-full max-w-[1400px] min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={fetchProfile} />
                    ) : !user ? (
                        <ErrorState
                            message="Your profile could not be found."
                            onRetry={fetchProfile}
                        />
                    ) : (
                        <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
                            {/* Profile overview */}
                            <motion.section
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="relative isolate overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.13] via-[#101017] to-fuchsia-500/[0.07] p-5 shadow-[0_20px_80px_-45px_rgba(139,92,246,0.35)] sm:p-7 lg:p-9"
                            >
                                <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-violet-500/15 blur-[90px]" />
                                <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 h-56 w-56 rounded-full bg-fuchsia-500/[0.09] blur-[90px]" />

                                <div className="flex min-w-0 flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
                                        <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl font-semibold shadow-lg shadow-violet-950/30 sm:h-24 sm:w-24 sm:text-3xl">
                                            {user.profilePicture ? (
                                                <img
                                                    src={user.profilePicture}
                                                    alt={`${user.fullName || "User"} profile`}
                                                    className="h-full w-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                getInitials(user.fullName)
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 pt-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="break-words text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
                                                    {user.fullName || "Your profile"}
                                                </h2>
                                                {user.isVerified && (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-1 text-[10px] font-medium text-emerald-300">
                                                        <CheckCircle2 size={12} />
                                                        Verified
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 flex min-w-0 items-start gap-2 text-sm text-zinc-400">
                                                <Mail size={14} className="mt-0.5 shrink-0 text-zinc-500" />
                                                <span className="break-all">{user.email || "No email available"}</span>
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[11px] capitalize text-violet-200">
                                                    {user.role || "user"} account
                                                </span>
                                                <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-300">
                                                    {user.subscription || "Free"} Plan
                                                </span>
                                                {user.createdAt && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-400">
                                                        <CalendarDays size={12} />
                                                        Joined {formatDate(user.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={editProfile}
                                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 sm:w-auto"
                                    >
                                        <Pen size={15} />
                                        Edit Profile
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </motion.section>

                            {/* Profile completeness */}
                            <motion.section
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.04 }}
                                className="grid gap-4 rounded-2xl border border-white/[0.07] bg-[#0d0d13] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-100">Profile completeness</p>
                                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                                Add the key details to keep your professional profile up to date.
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-lg font-semibold text-violet-200 sm:hidden">
                                            {completionPercent}%
                                        </span>
                                    </div>
                                    <div
                                        className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]"
                                        role="progressbar"
                                        aria-label="Profile completeness"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={completionPercent}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionPercent}%` }}
                                            transition={{ duration: 0.7, delay: 0.15 }}
                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                        />
                                    </div>
                                </div>
                                <div className="hidden min-w-20 text-right sm:block">
                                    <p className="text-2xl font-semibold tracking-tight text-violet-200">{completionPercent}%</p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">Complete</p>
                                </div>
                            </motion.section>

                            <ProfileSection
                                icon={User}
                                title="Basic Information"
                                description="Your account details"
                                delay={0.05}
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <InfoItem label="Full Name" value={user.fullName} />
                                    <InfoItem label="Email Address" value={user.email} />
                                    <InfoItem label="Account Role" value={user.role} capitalize />
                                    <InfoItem label="Member Since" value={formatDate(user.createdAt)} />
                                </div>
                            </ProfileSection>

                            <ProfileSection
                                icon={FileText}
                                title="About Me"
                                description="A short introduction about you"
                                delay={0.1}
                                action={<EditButton onClick={editProfile} />}
                            >
                                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 sm:p-5">
                                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                                        {user.bio || "No bio added yet. Add a short introduction to tell others about yourself."}
                                    </p>
                                </div>
                            </ProfileSection>

                            <ProfileSection
                                icon={Briefcase}
                                title="Career Profile"
                                description="Your professional goals and experience"
                                delay={0.15}
                                action={<EditButton onClick={editProfile} />}
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <InfoItem label="Target Role" value={user.selectedRole} />
                                    <InfoItem label="Experience Level" value={user.experienceLevel} />
                                    <InfoItem label="Target Company" value={user.targetCompany} />
                                    <InfoItem label="Preferred Difficulty" value={user.preferredDifficulty} />
                                </div>
                            </ProfileSection>

                            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                                <ProfileSection
                                    icon={Wrench}
                                    title="Skills"
                                    description="Your current skills"
                                    delay={0.2}
                                    action={<EditButton onClick={editProfile} />}
                                >
                                    {user.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {user.skills.map((skill, index) => (
                                                <span
                                                    key={`${skill}-${index}`}
                                                    className="max-w-full break-words rounded-lg border border-violet-400/15 bg-violet-500/[0.07] px-3 py-2 text-xs text-violet-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyText text="No skills added yet. Add your skills to highlight your strengths." />
                                    )}
                                </ProfileSection>

                                <ProfileSection
                                    icon={Target}
                                    title="Learning Goals"
                                    description="What you want to improve"
                                    delay={0.25}
                                    action={<EditButton onClick={editProfile} />}
                                >
                                    {user.learningGoals.length > 0 ? (
                                        <ul className="space-y-2">
                                            {user.learningGoals.map((goal, index) => (
                                                <li
                                                    key={`${goal}-${index}`}
                                                    className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
                                                >
                                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                                                    <span className="break-words text-sm leading-6 text-zinc-300">{goal}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <EmptyText text="No learning goals added yet." />
                                    )}
                                </ProfileSection>
                            </div>

                            <ProfileSection
                                icon={GraduationCap}
                                title="Interview Preferences"
                                description="Your preferred interview settings"
                                delay={0.3}
                                action={<EditButton onClick={editProfile} />}
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <InfoItem label="Preferred Interview Type" value={user.preferredInterviewType} />
                                    <InfoItem label="Preferred Difficulty" value={user.preferredDifficulty} />
                                </div>
                            </ProfileSection>

                            <motion.section
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.32 }}
                                className="flex flex-col gap-4 rounded-2xl border border-violet-400/10 bg-gradient-to-r from-violet-500/[0.07] via-white/[0.02] to-fuchsia-500/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10">
                                        <ShieldCheck size={18} className="text-violet-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-100">Keep your profile up to date</h3>
                                        <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-400">
                                            Review your account details, professional goals, and interview preferences whenever they change.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={editProfile}
                                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 sm:w-auto"
                                >
                                    <Pen size={15} />
                                    Update Profile
                                </button>
                            </motion.section>
                        </div>
                    )}
                </div>
            </motion.main>
        </div>
    );
};

/* ================= LOADING STATE ================= */

const LoadingState = () => (
    <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                <LoaderCircle size={23} className="animate-spin text-violet-300" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-200">Loading your profile</p>
            <p className="mt-2 text-xs text-zinc-500">Fetching your account information...</p>
        </div>
    </div>
);

/* ================= ERROR STATE ================= */

const ErrorState = ({ message, onRetry }) => (
    <div className="flex min-h-[55vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-rose-400/15 bg-rose-500/[0.04] p-6 text-center sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-rose-400/10 bg-rose-500/10">
                <AlertTriangle size={22} className="text-rose-300" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-zinc-100">Unable to load profile</h2>
            <p className="mt-2 break-words text-sm leading-6 text-zinc-400">{message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
            >
                <RefreshCw size={15} />
                Try Again
            </button>
        </div>
    </div>
);

/* ================= PROFILE SECTION ================= */

const ProfileSection = ({
    icon: Icon,
    title,
    description,
    delay = 0,
    action,
    children,
}) => (
    <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay }}
        className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d0d13] p-5 transition-colors duration-200 hover:border-violet-400/[0.14] sm:p-6"
    >
        <div className="mb-5 flex min-w-0 items-center justify-between gap-3 sm:mb-6">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                    <Icon size={18} className="text-violet-300" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100 sm:text-base">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
                </div>
            </div>
            {action}
        </div>
        {children}
    </motion.section>
);

/* ================= EDIT BUTTON ================= */

const EditButton = ({ onClick, label = "Edit" }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={`${label} profile`}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
    >
        <Pen size={13} />
        <span>{label}</span>
    </button>
);

/* ================= INFO ITEM ================= */

const InfoItem = ({ label, value, capitalize = false }) => (
    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-black/20 p-4 transition-colors hover:border-white/[0.1]">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
        <p className={`mt-2 break-words text-sm leading-6 text-zinc-200 ${capitalize ? "capitalize" : ""}`}>
            {value || "Not set"}
        </p>
    </div>
);

/* ================= EMPTY TEXT ================= */

const EmptyText = ({ text }) => (
    <div className="rounded-xl border border-dashed border-white/[0.09] bg-black/10 px-4 py-5 text-sm leading-6 text-zinc-500">
        {text}
    </div>
);

export default Profile;
