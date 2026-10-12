
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Activity,
    ArrowRight,
    Bell,
    Brain,
    CheckCircle2,
    ChevronDown,
    Clock3,
    LogOut,
    Plus,
    Settings,
    Sparkles,
    Target,
    TrendingUp,
    User,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Sidebar from "../../components/dashboard/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getProfile } from "../../usecase/user.usecase.js";
import { getAllInterviews } from "../../usecase/interview.usecase.js";
import { getInterviewResult } from "../../usecase/interviewResult.usecase.js";

import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../../usecase/notification.usecase.js";

const panelClass =
    "rounded-2xl border border-white/[0.07] bg-[#0b0b12]";

const mutedText = "text-sm text-white/45";

const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:bg-violet-400 active:scale-[0.98]";

const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-white/75 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white";

const isCompleted = (interview) =>
    ["completed", "evaluated"].includes(
        String(interview?.status || "").toLowerCase()
    );

const getScore = (result) => {
    const score = Number(result?.averageScore);
    return Number.isFinite(score) ? score : null;
};

const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U";

const getNotificationTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    const minutes = Math.floor(
        (Date.now() - parsedDate.getTime()) / 60000
    );

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days}d ago`;

    return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("sidebar-collapsed") === "true";
        } catch {
            return false;
        }
    });

    const [user, setUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [interviews, setInterviews] = useState([]);
    const [interviewResults, setInterviewResults] = useState([]);
    const [interviewLoading, setInterviewLoading] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const notificationRef = useRef(null);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        try {
            localStorage.setItem(
                "sidebar-collapsed",
                String(collapsed)
            );
        } catch (error) {
            console.error("Could not save sidebar state:", error);
        }
    }, [collapsed]);

    // Close menus when clicking outside or pressing Escape.
    useEffect(() => {
        const handlePointerDown = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setNotificationOpen(false);
            }

            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setProfileMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setNotificationOpen(false);
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    // Load the authenticated user's profile.
    useEffect(() => {
        let active = true;

        const fetchProfile = async () => {
            try {
                const response = await getProfile();

                const profile =
                    response?.data?.user ||
                    response?.data?.profile ||
                    response?.user ||
                    response?.data;

                if (active && profile) {
                    setUser(profile);
                }
            } catch (error) {
                console.error("Dashboard profile error:", error);

                if (active) {
                    toast.error(
                        error?.response?.data?.message ||
                            "Unable to load your profile."
                    );
                }
            } finally {
                if (active) setProfileLoading(false);
            }
        };

        fetchProfile();

        return () => {
            active = false;
        };
    }, []);

    // Load interviews and results without failing the entire dashboard
    // when one interview result is unavailable.
    useEffect(() => {
        let active = true;

        const fetchInterviews = async () => {
            try {
                setInterviewLoading(true);

                const response = await getAllInterviews();

                const interviewData =
                    response?.data?.interviews ||
                    response?.interviews ||
                    [];

                if (!active) return;

                setInterviews(
                    Array.isArray(interviewData) ? interviewData : []
                );

                const completed = interviewData.filter(isCompleted);

                const results = await Promise.all(
                    completed.map(async (interview) => {
                        try {
                            const resultResponse =
                                await getInterviewResult(interview._id);

                            const result =
                                resultResponse?.data?.result ||
                                resultResponse?.data?.data ||
                                resultResponse?.data ||
                                resultResponse?.result ||
                                {};

                            return {
                                ...result,
                                interviewId: interview._id,
                                interview,
                            };
                        } catch (error) {
                            console.error(
                                `Could not load result for ${interview._id}:`,
                                error
                            );

                            return null;
                        }
                    })
                );

                if (active) {
                    setInterviewResults(results.filter(Boolean));
                }
            } catch (error) {
                console.error("Dashboard interviews error:", error);

                if (active) {
                    setInterviews([]);
                    setInterviewResults([]);

                    toast.error(
                        error?.response?.data?.message ||
                            "Unable to load your interviews."
                    );
                }
            } finally {
                if (active) setInterviewLoading(false);
            }
        };

        fetchInterviews();

        return () => {
            active = false;
        };
    }, []);

    // Notifications.
    const fetchNotifications = async () => {
        try {
            setNotificationLoading(true);

            const [notificationResponse, unreadResponse] =
                await Promise.all([
                    getNotifications(),
                    getUnreadNotificationCount(),
                ]);

            const notificationData =
                notificationResponse?.data?.notifications ||
                notificationResponse?.data ||
                notificationResponse?.notifications ||
                [];

            setNotifications(
                Array.isArray(notificationData) ? notificationData : []
            );

            setUnreadCount(
                Number(
                    unreadResponse?.data?.count ??
                        unreadResponse?.count ??
                        0
                )
            );
        } catch (error) {
            console.error("Dashboard notifications error:", error);
        } finally {
            setNotificationLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification?.isRead) {
                await markNotificationAsRead(notification._id);

                setNotifications((current) =>
                    current.map((item) =>
                        item._id === notification._id
                            ? { ...item, isRead: true }
                            : item
                    )
                );

                setUnreadCount((current) =>
                    Math.max(current - 1, 0)
                );
            }

            setNotificationOpen(false);

            if (
                notification?.relatedId &&
                ["interview", "evaluation", "result"].includes(
                    String(notification.type || "").toLowerCase()
                )
            ) {
                navigate(`/interview/${notification.relatedId}`);
            }
        } catch (error) {
            console.error("Notification click error:", error);

            toast.error(
                error?.response?.data?.message ||
                    "Unable to open this notification."
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();

            setNotifications((current) =>
                current.map((item) => ({
                    ...item,
                    isRead: true,
                }))
            );

            setUnreadCount(0);
            toast.success("All notifications marked as read.");
        } catch (error) {
            console.error("Mark all notifications error:", error);

            toast.error(
                error?.response?.data?.message ||
                    "Unable to update notifications."
            );
        }
    };

    const handleLogout = () => {
        setProfileMenuOpen(false);
        logout();
    };

    // Derived dashboard data.
    const completedInterviews = useMemo(
        () => interviews.filter(isCompleted),
        [interviews]
    );

    const scoredResults = useMemo(
        () =>
            interviewResults
                .map((result) => ({
                    ...result,
                    normalizedScore: getScore(result),
                }))
                .filter(
                    (result) => result.normalizedScore !== null
                ),
        [interviewResults]
    );

    const averageScore = useMemo(() => {
        if (!scoredResults.length) return null;

        const total = scoredResults.reduce(
            (sum, result) => sum + result.normalizedScore,
            0
        );

        return Math.round((total / scoredResults.length) * 10) / 10;
    }, [scoredResults]);

    const answeredQuestions = interviewResults.reduce(
        (sum, result) =>
            sum + (Number(result?.answeredQuestions) || 0),
        0
    );

    const totalQuestions = interviewResults.reduce(
        (sum, result) =>
            sum + (Number(result?.totalQuestions) || 0),
        0
    );

    const strongTopics = useMemo(
        () => [
            ...new Set(
                interviewResults.flatMap((result) =>
                    Array.isArray(result?.strengths)
                        ? result.strengths
                        : []
                )
            ),
        ],
        [interviewResults]
    );

    const weakTopics = useMemo(
        () => [
            ...new Set(
                interviewResults.flatMap((result) =>
                    Array.isArray(result?.weakTopics)
                        ? result.weakTopics
                        : []
                )
            ),
        ],
        [interviewResults]
    );

    const recentInterviews = useMemo(
        () =>
            [...interviews]
                .sort(
                    (a, b) =>
                        new Date(b?.createdAt || 0).getTime() -
                        new Date(a?.createdAt || 0).getTime()
                )
                .slice(0, 4),
        [interviews]
    );

    const scoreHistory = useMemo(() => {
        return [...scoredResults]
            .sort(
                (a, b) =>
                    new Date(
                        a?.interview?.createdAt || 0
                    ).getTime() -
                    new Date(
                        b?.interview?.createdAt || 0
                    ).getTime()
            )
            .slice(-7);
    }, [scoredResults]);

    const latestResult = useMemo(
        () =>
            [...scoredResults].sort(
                (a, b) =>
                    new Date(
                        b?.interview?.updatedAt ||
                            b?.interview?.createdAt ||
                            0
                    ).getTime() -
                    new Date(
                        a?.interview?.updatedAt ||
                            a?.interview?.createdAt ||
                            0
                    ).getTime()
            )[0] || null,
        [scoredResults]
    );

    const latestFeedback = useMemo(() => {
        const questions = latestResult?.questions;

        if (!Array.isArray(questions)) return "";

        return (
            [...questions]
                .reverse()
                .find((question) => question?.feedback)?.feedback || ""
        );
    }, [latestResult]);

    const firstName =
        user?.fullName?.trim()?.split(/\s+/)[0] || "there";

    const questionCompletion =
        totalQuestions > 0
            ? Math.min(
                  100,
                  Math.round((answeredQuestions / totalQuestions) * 100)
              )
            : 0;

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#05050a] text-white">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onLogout={handleLogout}
            />

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className={`min-h-screen min-w-0 pt-16 transition-[margin] duration-300 md:pt-0 ${
                    collapsed ? "md:ml-20" : "md:ml-[260px]"
                }`}
            >
                {/* Top navigation */}
                <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05050a]/90 backdrop-blur-2xl">
                    <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                                Dashboard
                            </h1>
                            <p className="hidden text-xs text-white/40 sm:block">
                                Your personal interview workspace
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            {/* Notifications */}
                            <div ref={notificationRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNotificationOpen((open) => !open);
                                        setProfileMenuOpen(false);
                                    }}
                                    aria-label="Open notifications"
                                    aria-expanded={notificationOpen}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/70 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                                >
                                    <Bell className="h-[18px] w-[18px]" />

                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#05050a] bg-violet-500 px-1 text-[9px] font-bold">
                                            {unreadCount > 99
                                                ? "99+"
                                                : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {notificationOpen && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: -8,
                                                scale: 0.98,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -8,
                                                scale: 0.98,
                                            }}
                                            transition={{ duration: 0.16 }}
                                            className="fixed left-3 right-3 top-[76px] z-50 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b0b12] shadow-2xl shadow-black/40 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[360px]"
                                        >
                                            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
                                                <div>
                                                    <h2 className="text-sm font-semibold">
                                                        Notifications
                                                    </h2>
                                                    <p className="mt-0.5 text-xs text-white/40">
                                                        {unreadCount > 0
                                                            ? `${unreadCount} unread`
                                                            : "You're all caught up"}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {unreadCount > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={handleMarkAllAsRead}
                                                            className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
                                                        >
                                                            Mark all read
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setNotificationOpen(false)
                                                        }
                                                        aria-label="Close notifications"
                                                        className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="max-h-[min(65vh,420px)] overflow-y-auto">
                                                {notificationLoading ? (
                                                    <div className="flex min-h-36 items-center justify-center">
                                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
                                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                                                            <Bell className="h-5 w-5 text-white/30" />
                                                        </div>
                                                        <p className="text-sm font-medium text-white/75">
                                                            No notifications yet
                                                        </p>
                                                        <p className="mt-1 text-xs leading-5 text-white/40">
                                                            Interview updates and feedback will appear here.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-white/[0.05]">
                                                        {notifications.map(
                                                            (notification) => (
                                                                <button
                                                                    key={notification._id}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleNotificationClick(
                                                                            notification
                                                                        )
                                                                    }
                                                                    className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.04] ${
                                                                        notification.isRead
                                                                            ? ""
                                                                            : "bg-violet-500/[0.06]"
                                                                    }`}
                                                                >
                                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                                                                        <Sparkles className="h-4 w-4 text-violet-400" />
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <p className="line-clamp-2 text-sm font-medium text-white/85">
                                                                                {notification.title ||
                                                                                    "Notification"}
                                                                            </p>
                                                                            {!notification.isRead && (
                                                                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                                                                            )}
                                                                        </div>

                                                                        {notification.message && (
                                                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">
                                                                                {notification.message}
                                                                            </p>
                                                                        )}

                                                                        <p className="mt-2 text-[10px] text-white/30">
                                                                            {getNotificationTime(
                                                                                notification.createdAt
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile menu */}
                            <div ref={profileMenuRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileMenuOpen((open) => !open);
                                        setNotificationOpen(false);
                                    }}
                                    aria-expanded={profileMenuOpen}
                                    className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 transition hover:bg-white/[0.06] sm:gap-3 sm:px-3"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold">
                                        {user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user?.fullName || "Profile"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            getInitials(user?.fullName)
                                        )}
                                    </div>

                                    <div className="hidden min-w-0 text-left sm:block">
                                        <p className="max-w-28 truncate text-xs font-medium">
                                            {profileLoading
                                                ? "Loading..."
                                                : user?.fullName || "User"}
                                        </p>
                                        <p className="max-w-28 truncate text-[10px] text-white/35">
                                            {user?.email || ""}
                                        </p>
                                    </div>

                                    <ChevronDown
                                        className={`hidden h-4 w-4 text-white/40 transition sm:block ${
                                            profileMenuOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b12] shadow-2xl shadow-black/40"
                                        >
                                            <div className="border-b border-white/[0.06] px-4 py-3">
                                                <p className="truncate text-sm font-semibold">
                                                    {user?.fullName || "User"}
                                                </p>
                                                <p className="mt-1 truncate text-xs text-white/40">
                                                    {user?.email || ""}
                                                </p>
                                            </div>

                                            <div className="p-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfileMenuOpen(false);
                                                        navigate("/profile");
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                                                >
                                                    <User className="h-4 w-4" />
                                                    Profile
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfileMenuOpen(false);
                                                        navigate("/settings");
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Settings
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/[0.08]"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard content */}
                <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Welcome / primary action */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative mb-7 overflow-hidden rounded-3xl border border-violet-400/[0.14] bg-gradient-to-br from-violet-500/[0.12] via-[#10101b] to-[#0a0a11] p-5 sm:p-7 lg:p-8"
                    >
                        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.09] blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-fuchsia-500/[0.06] blur-3xl" />

                        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[0.08] px-3 py-1.5 text-xs font-medium text-violet-200">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Your AI interview workspace
                                </div>

                                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                                    Welcome back,{" "}
                                    <span className="text-violet-300">
                                        {firstName}
                                    </span>
                                </h2>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
                                    Every practice session is a step forward.
                                    Review your progress, learn from your
                                    feedback, and prepare for your next
                                    opportunity.
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/45">
                                    <span className="inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        {completedInterviews.length} completed
                                        {completedInterviews.length === 1
                                            ? " interview"
                                            : " interviews"}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Activity className="h-4 w-4 text-violet-300" />
                                        {interviews.length -
                                            completedInterviews.length}{" "}
                                        in progress
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/interview/create")}
                                className={`${buttonClass} h-11 shrink-0 self-start sm:self-auto`}
                            >
                                <Plus className="h-4 w-4" />
                                New interview
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.section>

                    {/* Overview statistics */}
                    <section className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
                        {[
                            {
                                label: "Total interviews",
                                value: interviewLoading ? "—" : interviews.length,
                                description: `${completedInterviews.length} completed`,
                                icon: Brain,
                                iconStyle: "bg-violet-500/10 text-violet-300",
                            },
                            {
                                label: "Average score",
                                value:
                                    interviewLoading
                                        ? "—"
                                        : averageScore === null
                                          ? "—"
                                          : `${averageScore}/10`,
                                description:
                                    averageScore === null
                                        ? "Complete an evaluation to begin"
                                        : "Across evaluated interviews",
                                icon: TrendingUp,
                                iconStyle: "bg-emerald-500/10 text-emerald-300",
                            },
                            {
                                label: "Questions answered",
                                value: interviewLoading
                                    ? "—"
                                    : answeredQuestions,
                                description: `${totalQuestions} questions evaluated or tracked`,
                                icon: CheckCircle2,
                                iconStyle: "bg-sky-500/10 text-sky-300",
                            },
                            {
                                label: "Strong topics",
                                value: interviewLoading
                                    ? "—"
                                    : strongTopics.length,
                                description: "Strengths from AI feedback",
                                icon: Target,
                                iconStyle: "bg-amber-500/10 text-amber-300",
                            },
                        ].map((stat, index) => {
                            const Icon = stat.icon;

                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.25,
                                        delay: index * 0.04,
                                    }}
                                    className={`${panelClass} p-4 transition duration-200 hover:border-white/[0.12] sm:p-5`}
                                >
                                    <div className="mb-5 flex items-center justify-between gap-2">
                                        <p className="text-xs font-medium text-white/45 sm:text-sm">
                                            {stat.label}
                                        </p>
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.iconStyle}`}
                                        >
                                            <Icon className="h-[18px] w-[18px]" />
                                        </div>
                                    </div>

                                    <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1.5 text-[11px] leading-5 text-white/35 sm:text-xs">
                                        {stat.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </section>

                    {/* Performance and progress */}
                    <section className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
                        {/* Performance overview */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`${panelClass} min-w-0 p-5 sm:p-6`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                                            <Activity className="h-[18px] w-[18px] text-violet-300" />
                                        </div>
                                        <h3 className="text-base font-semibold">
                                            Performance overview
                                        </h3>
                                    </div>
                                    <p className={`mt-2 ${mutedText}`}>
                                        Your scores from recent evaluated interviews
                                    </p>
                                </div>

                                <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/45">
                                    Out of 10
                                </span>
                            </div>

                            <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end">
                                <div className="sm:min-w-32">
                                    <p className="text-xs text-white/40">
                                        Overall average
                                    </p>
                                    <p className="mt-2 text-4xl font-semibold tracking-tight">
                                        {averageScore === null
                                            ? "—"
                                            : averageScore.toFixed(1)}
                                        <span className="ml-1 text-base font-medium text-white/30">
                                            /10
                                        </span>
                                    </p>
                                    <p className="mt-2 text-xs text-white/35">
                                        {scoredResults.length} evaluated{" "}
                                        {scoredResults.length === 1
                                            ? "interview"
                                            : "interviews"}
                                    </p>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs text-white/40">
                                            Score history
                                        </span>
                                        <span className="text-xs font-medium text-violet-300">
                                            {scoreHistory.length
                                                ? `${scoreHistory.length} sessions`
                                                : "No data yet"}
                                        </span>
                                    </div>

                                    {scoreHistory.length > 0 ? (
                                        <div className="flex h-32 items-end gap-2 sm:gap-3">
                                            {scoreHistory.map(
                                                (result, index) => {
                                                    const score =
                                                        result.normalizedScore;

                                                    const height = Math.max(
                                                        8,
                                                        Math.min(
                                                            100,
                                                            (score / 10) * 100
                                                        )
                                                    );

                                                    return (
                                                        <div
                                                            key={
                                                                result.interviewId ||
                                                                index
                                                            }
                                                            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                                                            title={`${result.interview?.title || "Interview"}: ${score}/10`}
                                                        >
                                                            <span className="text-[10px] text-white/45 opacity-0 transition group-hover:opacity-100">
                                                                {score}
                                                            </span>
                                                            <div className="flex h-24 w-full items-end overflow-hidden rounded-t-lg bg-white/[0.035]">
                                                                <motion.div
                                                                    initial={{
                                                                        height: 0,
                                                                    }}
                                                                    animate={{
                                                                        height: `${height}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.45,
                                                                        delay:
                                                                            index *
                                                                            0.04,
                                                                    }}
                                                                    className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-300"
                                                                />
                                                            </div>
                                                            <span className="max-w-full truncate text-[9px] text-white/30">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] px-4 text-center">
                                            <TrendingUp className="mb-2 h-5 w-5 text-white/25" />
                                            <p className="text-sm text-white/60">
                                                Your score history will appear here
                                            </p>
                                            <p className="mt-1 text-xs text-white/35">
                                                Complete and evaluate an interview to see your progress.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 border-t border-white/[0.06] pt-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-xs text-white/45">
                                        Questions answered
                                    </span>
                                    <span className="text-xs font-medium text-white/70">
                                        {answeredQuestions}/{totalQuestions}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${questionCompletion}%`,
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Latest feedback */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 }}
                            className={`${panelClass} flex min-w-0 flex-col p-5 sm:p-6`}
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10">
                                    <Sparkles className="h-[18px] w-[18px] text-fuchsia-300" />
                                </div>
                                <h3 className="text-base font-semibold">
                                    Latest AI feedback
                                </h3>
                            </div>

                            <p className={`mt-2 ${mutedText}`}>
                                A quick look at your latest evaluation
                            </p>

                            {latestResult ? (
                                <div className="mt-5 flex flex-1 flex-col">
                                    <div className="rounded-xl border border-violet-400/[0.12] bg-violet-500/[0.05] p-4">
                                        <p className="text-xs text-violet-300">
                                            Most recent evaluated interview
                                        </p>
                                        <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-white/90">
                                            {latestResult.interview?.title ||
                                                latestResult.interview?.role ||
                                                "Interview evaluation"}
                                        </h4>
                                        <div className="mt-3 flex items-end justify-between gap-3">
                                            <div>
                                                <p className="text-xs text-white/40">
                                                    Your score
                                                </p>
                                                <p className="mt-1 text-2xl font-semibold">
                                                    {latestResult.normalizedScore}
                                                    <span className="ml-1 text-xs font-medium text-white/35">
                                                        /10
                                                    </span>
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/interview/${latestResult.interviewId}`
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 transition hover:text-violet-200"
                                            >
                                                View result
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex-1">
                                        <p className="mb-2 text-xs font-medium text-white/50">
                                            Feedback highlight
                                        </p>
                                        <p className="line-clamp-5 text-sm leading-6 text-white/65">
                                            {latestFeedback ||
                                                "Open your interview result to review the detailed feedback and improvement suggestions."}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/interview/${latestResult.interviewId}`
                                            )
                                        }
                                        className={`${secondaryButtonClass} mt-4 w-full`}
                                    >
                                        Explore full evaluation
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] px-4 py-8 text-center">
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                                        <Brain className="h-5 w-5 text-violet-300" />
                                    </div>
                                    <p className="text-sm font-medium text-white/75">
                                        Your feedback starts here
                                    </p>
                                    <p className="mt-2 max-w-xs text-xs leading-5 text-white/40">
                                        Complete an interview to receive AI-powered
                                        insights into your performance.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/interview/create")
                                        }
                                        className={`${buttonClass} mt-4`}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Start an interview
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </section>

                    {/* Strengths and improvement areas */}
                    <section className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className={`${panelClass} p-5 sm:p-6`}>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold">
                                        Your strengths
                                    </h3>
                                    <p className="mt-0.5 text-xs text-white/40">
                                        Topics highlighted by AI feedback
                                    </p>
                                </div>
                            </div>

                            {strongTopics.length ? (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {strongTopics.slice(0, 10).map((topic) => (
                                        <span
                                            key={topic}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/[0.14] bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-200/90"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-5 rounded-xl border border-dashed border-white/[0.08] px-4 py-6 text-sm text-white/40">
                                    Your strengths will appear after your first
                                    interview evaluation.
                                </p>
                            )}
                        </div>

                        <div className={`${panelClass} p-5 sm:p-6`}>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                                    <Target className="h-5 w-5 text-amber-300" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold">
                                        Areas to improve
                                    </h3>
                                    <p className="mt-0.5 text-xs text-white/40">
                                        Topics worth practising next
                                    </p>
                                </div>
                            </div>

                            {weakTopics.length ? (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {weakTopics.slice(0, 10).map((topic) => (
                                        <span
                                            key={topic}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/[0.14] bg-amber-400/[0.06] px-3 py-2 text-xs text-amber-100/90"
                                        >
                                            <Target className="h-3.5 w-3.5 shrink-0" />
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-5 rounded-xl border border-dashed border-white/[0.08] px-4 py-6 text-sm text-white/40">
                                    Improvement areas will appear when AI feedback
                                    identifies topics to work on.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Recent interviews */}
                    <section className={`${panelClass} overflow-hidden`}>
                        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                                        <Clock3 className="h-[18px] w-[18px] text-violet-300" />
                                    </div>
                                    <h3 className="text-base font-semibold">
                                        Recent interviews
                                    </h3>
                                </div>
                                <p className={`mt-2 ${mutedText}`}>
                                    Continue where you left off
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/interviews")}
                                className={secondaryButtonClass}
                            >
                                View all
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        {interviewLoading ? (
                            <div className="flex min-h-40 items-center justify-center">
                                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
                            </div>
                        ) : recentInterviews.length === 0 ? (
                            <div className="flex flex-col items-center px-5 py-12 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                                    <Brain className="h-5 w-5 text-white/35" />
                                </div>
                                <h4 className="text-sm font-semibold text-white/80">
                                    No interviews yet
                                </h4>
                                <p className="mt-2 max-w-sm text-xs leading-5 text-white/40">
                                    Start your first mock interview and your
                                    recent activity will appear here.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/interview/create")
                                    }
                                    className={`${buttonClass} mt-5`}
                                >
                                    <Plus className="h-4 w-4" />
                                    Create interview
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.05]">
                                {recentInterviews.map((interview, index) => {
                                    const result = interviewResults.find(
                                        (item) =>
                                            item.interviewId === interview._id
                                    );

                                    const score = getScore(result);
                                    const completed = isCompleted(interview);

                                    return (
                                        <motion.div
                                            key={interview._id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: index * 0.04,
                                            }}
                                            className="flex flex-col gap-4 px-5 py-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                                                    <Brain className="h-5 w-5 text-violet-300" />
                                                </div>

                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-semibold text-white/90">
                                                        {interview.title ||
                                                            interview.role ||
                                                            "Mock interview"}
                                                    </h4>
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/40">
                                                        {interview.role && (
                                                            <span>
                                                                {interview.role}
                                                            </span>
                                                        )}
                                                        {interview.role &&
                                                            interview.interviewType && (
                                                                <span className="text-white/20">
                                                                    ·
                                                                </span>
                                                            )}
                                                        {interview.interviewType && (
                                                            <span>
                                                                {interview.interviewType}
                                                            </span>
                                                        )}
                                                        <span className="text-white/20">
                                                            ·
                                                        </span>
                                                        <span>
                                                            {formatDate(
                                                                interview.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                                <div
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${
                                                        completed
                                                            ? "border-emerald-400/[0.15] bg-emerald-400/[0.06] text-emerald-300"
                                                            : "border-amber-400/[0.15] bg-amber-400/[0.06] text-amber-200"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            completed
                                                                ? "bg-emerald-400"
                                                                : "bg-amber-300"
                                                        }`}
                                                    />
                                                    {completed
                                                        ? "Completed"
                                                        : "In progress"}
                                                </div>

                                                {score !== null && (
                                                    <span className="min-w-14 text-right text-sm font-semibold text-white/80">
                                                        {score}/10
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/interview/${interview._id}`
                                                        )
                                                    }
                                                    aria-label={`Open ${interview.title || "interview"}`}
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] text-white/50 transition hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-200"
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Footer */}
                    <footer className="flex flex-col gap-2 py-7 text-center text-[11px] text-white/25 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <p className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
                            <Sparkles className="h-3.5 w-3.5 text-violet-400/70" />
                            Synthex AI
                        </p>
                        <p>
                            Practice with purpose. Improve with every interview.
                        </p>
                    </footer>
                </div>
            </motion.main>
        </div>
    );
};

export default Dashboard;
