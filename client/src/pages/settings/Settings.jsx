import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    Settings as SettingsIcon,
    User,
    SlidersHorizontal,
    LogOut,
    ShieldCheck,
    Mail,
    Gauge,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Save,
    Sparkles,
    ChevronRight,
    Info,
    RotateCcw,
} from "lucide-react";

import Sidebar from "../../components/dashboard/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

import {
    getProfile,
    updateProfile,
} from "../../usecase/user.usecase.js";

import { toast } from "sonner";
import ThemedSelect from "../../components/common/ThemedSelect.jsx";

const DEFAULT_PREFERENCES = {
    preferredDifficulty: "Medium",
    preferredInterviewType: "Mixed",
};

const difficultyOptions = [
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
];

const interviewTypeOptions = [
    { value: "Technical", label: "Technical" },
    { value: "HR", label: "HR" },
    { value: "Behavioral", label: "Behavioral" },
    { value: "Mixed", label: "Mixed" },
];

const Settings = () => {
    const { logout } = useAuth();

    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem("sidebar-collapsed") === "true"
    );

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        email: "",
        role: "user",
        isVerified: false,
        isActive: true,
        ...DEFAULT_PREFERENCES,
    });

    const [initialPreferences, setInitialPreferences] = useState({
        ...DEFAULT_PREFERENCES,
    });

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "sidebar-collapsed") {
                setCollapsed(event.newValue === "true");
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setLoadError(false);

            const response = await getProfile();

            if (response?.success === false) {
                throw new Error(
                    response?.message || "Failed to load settings."
                );
            }

            const user =
                response?.data?.user ||
                response?.user ||
                response?.data?.profile ||
                response?.profile ||
                null;

            if (!user) {
                throw new Error("Unable to retrieve your account information.");
            }

            const preferences = {
                preferredDifficulty:
                    user.preferredDifficulty || DEFAULT_PREFERENCES.preferredDifficulty,
                preferredInterviewType:
                    user.preferredInterviewType ||
                    DEFAULT_PREFERENCES.preferredInterviewType,
            };

            setSettings({
                email: user.email || "",
                role: user.role || "user",
                isVerified: Boolean(user.isVerified),
                isActive: user.isActive !== undefined ? user.isActive : true,
                ...preferences,
            });

            setInitialPreferences(preferences);
        } catch (error) {
            console.error("Settings Error:", error);
            setLoadError(true);

            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Failed to load settings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleChange = (field, value) => {
        setSettings((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const hasChanges =
        settings.preferredDifficulty !==
            initialPreferences.preferredDifficulty ||
        settings.preferredInterviewType !==
            initialPreferences.preferredInterviewType;

    const handleReset = () => {
        setSettings((previous) => ({
            ...previous,
            ...initialPreferences,
        }));
    };

    const handleSave = async () => {
        if (!hasChanges || saving) return;

        try {
            setSaving(true);

            const response = await updateProfile({
                preferredDifficulty: settings.preferredDifficulty,
                preferredInterviewType: settings.preferredInterviewType,
            });

            if (response?.success === false) {
                throw new Error(
                    response?.message || "Failed to update settings."
                );
            }

            const updatedPreferences = {
                preferredDifficulty: settings.preferredDifficulty,
                preferredInterviewType: settings.preferredInterviewType,
            };

            setInitialPreferences(updatedPreferences);

            toast.success("Settings updated successfully.");
        } catch (error) {
            console.error("Update Settings Error:", error);

            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Failed to update settings."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <PageLayout collapsed={collapsed} onLogout={handleLogout}>
                <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center">
                        <div className="absolute inset-0 animate-spin rounded-full border-2 border-violet-500/15 border-t-violet-400" />
                        <SettingsIcon size={19} className="text-violet-400" />
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-200">
                            Loading your settings
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Please wait a moment...
                        </p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (loadError) {
        return (
            <PageLayout collapsed={collapsed} onLogout={handleLogout}>
                <div className="flex min-h-[65vh] items-center justify-center">
                    <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-7 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/[0.08]">
                            <Info size={24} className="text-amber-300" />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-white">
                            Couldn't load settings
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Something went wrong while retrieving your account
                            information. Try loading it again.
                        </p>

                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={loadSettings}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-600"
                            >
                                <RotateCcw size={16} />
                                Try again
                            </button>

                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout collapsed={collapsed} onLogout={handleLogout}>
            <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8 min-w-0 sm:mb-10"
                >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400/90">
                                Account management
                            </p>

                            <div className="mt-3 flex min-w-0 items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-purple-500/[0.04]">
                                    <SettingsIcon
                                        size={23}
                                        className="text-violet-300"
                                    />
                                </div>

                                <h1 className="truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                    Settings
                                </h1>
                            </div>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                                Customize your interview experience and manage
                                your account preferences.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 lg:self-auto">
                            <Sparkles
                                size={16}
                                className="text-violet-400"
                            />
                            <span className="text-xs text-zinc-400">
                                Personalize your experience
                            </span>
                        </div>
                    </div>
                </motion.header>

                <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)] xl:gap-6">
                    {/* Main settings column */}
                    <div className="min-w-0 space-y-5 sm:space-y-6">
                        {/* Account information */}
                        <SettingsCard
                            icon={User}
                            title="Account Information"
                            description="Review your account details and status."
                            delay={0.05}
                        >
                            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                <InfoTile
                                    icon={Mail}
                                    label="Email Address"
                                    value={settings.email || "Not available"}
                                    accent="violet"
                                />

                                <InfoTile
                                    icon={ShieldCheck}
                                    label="Account Role"
                                    value={settings.role || "user"}
                                    accent="violet"
                                    capitalize
                                />

                                <InfoTile
                                    icon={settings.isVerified ? CheckCircle2 : XCircle}
                                    label="Email Verification"
                                    value={settings.isVerified ? "Verified" : "Not verified"}
                                    status={settings.isVerified ? "success" : "warning"}
                                />

                                <InfoTile
                                    icon={settings.isActive ? CheckCircle2 : XCircle}
                                    label="Account Status"
                                    value={settings.isActive ? "Active" : "Inactive"}
                                    status={settings.isActive ? "success" : "danger"}
                                />
                            </div>
                        </SettingsCard>

                        {/* Interview preferences */}
                        <SettingsCard
                            icon={SlidersHorizontal}
                            title="Interview Preferences"
                            description="Choose the default settings for your future mock interviews."
                            delay={0.1}
                        >
                            <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
                                <PreferenceField
                                    icon={Gauge}
                                    title="Preferred Difficulty"
                                    description="Choose how challenging your interviews should be."
                                >
                                    <ThemedSelect
                                        name="preferredDifficulty"
                                        value={settings.preferredDifficulty}
                                        onChange={(value) =>
                                            handleChange(
                                                "preferredDifficulty",
                                                typeof value === "string"
                                                    ? value
                                                    : value?.target?.value ?? value?.value
                                            )
                                        }
                                        options={difficultyOptions}
                                        placeholder="Select difficulty"
                                        icon={Gauge}
                                    />
                                </PreferenceField>

                                <PreferenceField
                                    icon={MessageSquare}
                                    title="Interview Type"
                                    description="Select the interview format you want to practice."
                                >
                                    <ThemedSelect
                                        name="preferredInterviewType"
                                        value={settings.preferredInterviewType}
                                        onChange={(value) =>
                                            handleChange(
                                                "preferredInterviewType",
                                                typeof value === "string"
                                                    ? value
                                                    : value?.target?.value ?? value?.value
                                            )
                                        }
                                        options={interviewTypeOptions}
                                        placeholder="Select interview type"
                                        icon={MessageSquare}
                                    />
                                </PreferenceField>
                            </div>

                            {/* Preference preview */}
                            <div className="mt-6 rounded-xl border border-violet-400/15 bg-gradient-to-r from-violet-500/[0.07] to-transparent p-4 sm:p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                                        <Sparkles
                                            size={17}
                                            className="text-violet-300"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-zinc-200">
                                            Your interview setup
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            Your default preferences are set to{" "}
                                            <span className="font-medium text-violet-300">
                                                {settings.preferredDifficulty}
                                            </span>{" "}
                                            difficulty and{" "}
                                            <span className="font-medium text-violet-300">
                                                {settings.preferredInterviewType}
                                            </span>{" "}
                                            interviews.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Save actions */}
                            <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <span
                                        className={`h-2 w-2 shrink-0 rounded-full ${
                                            hasChanges
                                                ? "bg-amber-400"
                                                : "bg-emerald-400"
                                        }`}
                                    />

                                    <p className="text-xs leading-5 text-zinc-500">
                                        {hasChanges
                                            ? "You have unsaved changes."
                                            : "Your preferences are up to date."}
                                    </p>
                                </div>

                                {hasChanges && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={saving}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.04] disabled:opacity-50 sm:w-auto"
                                    >
                                        <RotateCcw size={15} />
                                        Reset
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving || !hasChanges}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                                >
                                    {saving ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </SettingsCard>
                    </div>

                    {/* Side information column */}
                    <div className="min-w-0 space-y-5 sm:space-y-6">
                        {/* Application information */}
                        <SettingsCard
                            icon={SettingsIcon}
                            title="Application"
                            description="Your Synthex AI environment."
                            delay={0.15}
                        >
                            <div className="space-y-3">
                                <ApplicationRow
                                    label="Application"
                                    value="Synthex AI"
                                />

                                <ApplicationRow
                                    label="Appearance"
                                    value="Dark mode"
                                />

                                <ApplicationRow
                                    label="Preferences"
                                    value="Personalized"
                                />
                            </div>

                            <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                        <Sparkles
                                            size={16}
                                            className="text-violet-300"
                                        />
                                    </div>

                                    <span className="text-sm font-medium text-zinc-200">
                                        Built for your growth
                                    </span>
                                </div>

                                <p className="mt-3 text-xs leading-6 text-zinc-500">
                                    Synthex AI helps you practice interviews,
                                    evaluate your answers, and improve your
                                    technical confidence.
                                </p>
                            </div>
                        </SettingsCard>

                        {/* Account actions */}
                        <motion.section
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.2 }}
                            className="min-w-0 overflow-hidden rounded-2xl border border-red-400/15 bg-[#0d0d12] p-5 sm:p-6"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.07]">
                                    <LogOut
                                        size={19}
                                        className="text-red-300"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="font-semibold text-white">
                                        Account Actions
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                                        Sign out of your current session.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-500/[0.12]"
                            >
                                <LogOut size={16} />
                                Logout
                                <ChevronRight size={15} className="ml-auto" />
                            </button>

                            <p className="mt-3 text-[11px] leading-5 text-zinc-600">
                                You may need to sign in again to access your
                                account.
                            </p>
                        </motion.section>
                    </div>
                </div>

                <footer className="mt-8 border-t border-white/[0.05] pt-5">
                    <p className="text-center text-xs text-zinc-600 sm:text-left">
                        Synthex AI · Account Settings
                    </p>
                </footer>
            </div>
        </PageLayout>
    );
};

/* =========================================================
   PAGE LAYOUT
========================================================= */

const PageLayout = ({ collapsed, onLogout, children }) => {
    return (
        <div className="min-h-screen w-full overflow-x-clip bg-[#05050a] text-white">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={() => {
                    const nextValue = !collapsed;

                    localStorage.setItem(
                        "sidebar-collapsed",
                        String(nextValue)
                    );

                    window.dispatchEvent(
                        new StorageEvent("storage", {
                            key: "sidebar-collapsed",
                            newValue: String(nextValue),
                        })
                    );
                }}
                onLogout={onLogout}
            />

            <motion.main
                className={`min-h-screen min-w-0 overflow-x-clip pt-16 transition-[margin-left] duration-300 ease-in-out md:pt-0 ${
                    collapsed ? "md:ml-20" : "md:ml-[260px]"
                }`}
            >
                {children}
            </motion.main>
        </div>
    );
};

/* =========================================================
   SETTINGS CARD
========================================================= */

const SettingsCard = ({
    icon: Icon,
    title,
    description,
    delay = 0,
    children,
}) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            className="min-w-0 overflow-visible rounded-2xl border border-white/[0.07] bg-[#0d0d12] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.12)] sm:p-6 lg:p-7"
        >
            <div className="mb-6 flex min-w-0 items-start gap-3 sm:mb-7">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                    <Icon size={20} className="text-violet-300" />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </motion.section>
    );
};

/* =========================================================
   ACCOUNT INFORMATION TILE
========================================================= */

const InfoTile = ({
    icon: Icon,
    label,
    value,
    accent,
    status,
    capitalize = false,
}) => {
    const statusClasses = {
        success: {
            icon: "text-emerald-400",
            text: "text-emerald-300",
            dot: "bg-emerald-400",
        },
        warning: {
            icon: "text-amber-400",
            text: "text-amber-300",
            dot: "bg-amber-400",
        },
        danger: {
            icon: "text-red-400",
            text: "text-red-300",
            dot: "bg-red-400",
        },
    };

    const currentStatus = status ? statusClasses[status] : null;

    return (
        <div className="group min-w-0 rounded-xl border border-white/[0.065] bg-white/[0.018] p-4 transition duration-200 hover:border-violet-400/20 hover:bg-white/[0.03] sm:p-5">
            <div className="flex min-w-0 items-center gap-2">
                <Icon
                    size={16}
                    className={`shrink-0 ${
                        currentStatus?.icon ||
                        (accent === "violet"
                            ? "text-violet-300"
                            : "text-zinc-400")
                    }`}
                />

                <p className="min-w-0 truncate text-xs text-zinc-500">
                    {label}
                </p>
            </div>

            <div className="mt-3 flex min-w-0 items-center gap-2">
                {currentStatus && (
                    <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${currentStatus.dot}`}
                    />
                )}

                <p
                    className={`min-w-0 break-words text-sm font-medium ${
                        currentStatus?.text || "text-zinc-200"
                    } ${capitalize ? "capitalize" : ""}`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
};

/* =========================================================
   PREFERENCE FIELD
========================================================= */

const PreferenceField = ({ icon: Icon, title, description, children }) => {
    return (
        <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/[0.08]">
                    <Icon size={17} className="text-violet-300" />
                </div>

                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-zinc-200">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="min-w-0">{children}</div>
        </div>
    );
};

/* =========================================================
   APPLICATION ROW
========================================================= */

const ApplicationRow = ({ label, value }) => {
    return (
        <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3.5">
            <span className="text-xs text-zinc-500 sm:text-sm">
                {label}
            </span>

            <span className="min-w-0 break-words text-right text-xs font-medium text-zinc-200 sm:text-sm">
                {value}
            </span>
        </div>
    );
};

export default Settings;
