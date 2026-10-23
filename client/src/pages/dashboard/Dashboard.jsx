import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Activity, ArrowRight, Bell, Brain, CheckCircle2, ChevronDown,
    Clock3, LogOut, Plus, Settings, Sparkles, Target, TrendingUp, User, X
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

// --- Constants & Styles ---
const panelClass = "rounded-2xl border border-[var(--border)] bg-[var(--surface)]";
const mutedText = "text-sm text-[var(--text-secondary)]";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:bg-violet-400 active:scale-[0.98]";
const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-violet-400/30 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]";

// --- Helper Functions ---
const isCompleted = (interview) => ["completed", "evaluated"].includes(String(interview?.status || "").toLowerCase());
const getScore = (result) => {
    const score = Number(result?.averageScore);
    return Number.isFinite(score) ? score : null;
};

const formatDate = (date) => {
    if (!date) return "Date unavailable";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";
    return parsedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const getInitials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";

const getNotificationTime = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";
    const minutes = Math.floor((Date.now() - parsedDate.getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return parsedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// --- Custom Hooks ---
const useClickOutside = (ref, handler, active = true) => {
    useEffect(() => {
        if (!active) return;
        const handlePointerDown = (event) => {
            if (ref.current && !ref.current.contains(event.target)) handler(event);
        };
        const handleEscape = (event) => {
            if (event.key === "Escape") handler(event);
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [ref, handler, active]);
};

const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("Error is: ",error)
            return initialValue;
        }
    });
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error("Could not save to localStorage:", error);
        }
    };
    return [storedValue, setValue];
};

// --- Sub-Components ---
const StatCard = ({ label, value, description, icon: Icon, iconStyle, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay }}
        className={`${panelClass} p-4 transition duration-200 hover:border-white/[0.12] sm:p-5`}
    >
        <div className="mb-5 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[var(--text-secondary)] sm:text-sm">{label}</p>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}>
                <Icon className="h-[18px] w-[18px]" />
            </div>
        </div>
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
        <p className="mt-1.5 text-[11px] leading-5 text-[var(--text-muted)] sm:text-xs">{description}</p>
    </motion.div>
);

const TopicSection = ({ title, subtitle, topics, icon: Icon, iconStyle, emptyText }) => (
    <div className={`${panelClass} p-5 sm:p-6`}>
        <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle.bg}`}>
                <Icon className={`h-5 w-5 ${iconStyle.text}`} />
            </div>
            <div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
            </div>
        </div>
        {topics.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
                {topics.slice(0, 10).map((topic) => (
                    <span key={topic} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs ${iconStyle.pill}`}>
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {topic}
                    </span>
                ))}
            </div>
        ) : (
            <p className="mt-5 rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--text-muted)]">
                {emptyText}
            </p>
        )}
    </div>
);

// --- Main Component ---
const Dashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);

    // State blocks
    const [user, setUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [interviews, setInterviews] = useState([]);
    const [interviewResults, setInterviewResults] = useState([]);
    const [interviewLoading, setInterviewLoading] = useState(true);
    
    // Notification & Menu state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const notificationRef = useRef(null);
    const profileMenuRef = useRef(null);

    // Click outside handlers
    useClickOutside(notificationRef, () => setNotificationOpen(false), notificationOpen);
    useClickOutside(profileMenuRef, () => setProfileMenuOpen(false), profileMenuOpen);

    // Initial Data Fetching
    useEffect(() => {
        let active = true;

        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                const profile = response?.data?.user || response?.data?.profile || response?.user || response?.data;
                if (active && profile) setUser(profile);
            } catch (error) {
                if (active) toast.error(error?.response?.data?.message || "Unable to load your profile.");
            } finally {
                if (active) setProfileLoading(false);
            }
        };

        const fetchInterviews = async () => {
            try {
                const response = await getAllInterviews();
                const interviewData = response?.data?.interviews || response?.interviews || [];
                if (!active) return;
                
                setInterviews(Array.isArray(interviewData) ? interviewData : []);
                const completed = interviewData.filter(isCompleted);

                const results = await Promise.all(completed.map(async (interview) => {
                    try {
                        const resultResponse = await getInterviewResult(interview._id);
                        const result = resultResponse?.data?.result || resultResponse?.data?.data || resultResponse?.data || resultResponse?.result || {};
                        return { ...result, interviewId: interview._id, interview };
                    } catch {
                        return null; // Graceful degradation for single failed results
                    }
                }));

                if (active) setInterviewResults(results.filter(Boolean));
            } catch (error) {
                if (active) {
                    setInterviews([]);
                    setInterviewResults([]);
                    toast.error(error?.response?.data?.message || "Unable to load your interviews.");
                }
            } finally {
                if (active) setInterviewLoading(false);
            }
        };

        const fetchNotifications = async () => {
            try {
                setNotificationLoading(true);
                const [notifRes, unreadRes] = await Promise.all([getNotifications(), getUnreadNotificationCount()]);
                const notifData = notifRes?.data?.notifications || notifRes?.data || notifRes?.notifications || [];
                setNotifications(Array.isArray(notifData) ? notifData : []);
                setUnreadCount(Number(unreadRes?.data?.count ?? unreadRes?.count ?? 0));
            } catch (error) {
                console.error("Dashboard notifications error:", error);
            } finally {
                setNotificationLoading(false);
            }
        };

        fetchProfile();
        fetchInterviews();
        fetchNotifications();

        return () => { active = false; };
    }, []);

    // Handlers
    const handleNotificationClick = async (notification) => {
        try {
            if (!notification?.isRead) {
                await markNotificationAsRead(notification._id);
                setNotifications(cur => cur.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
                setUnreadCount(cur => Math.max(cur - 1, 0));
            }
            setNotificationOpen(false);
            if (notification?.relatedId && ["interview", "evaluation", "result"].includes(String(notification.type || "").toLowerCase())) {
                navigate(`/interview/${notification.relatedId}`);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Unable to open this notification.");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(cur => cur.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Unable to update notifications.");
        }
    };

    const handleLogout = () => {
        setProfileMenuOpen(false);
        logout();
    };

    // Derived Data
    const completedInterviews = useMemo(() => interviews.filter(isCompleted), [interviews]);
    const scoredResults = useMemo(() => interviewResults.map(r => ({ ...r, normalizedScore: getScore(r) })).filter(r => r.normalizedScore !== null), [interviewResults]);
    const averageScore = useMemo(() => scoredResults.length ? Math.round((scoredResults.reduce((sum, r) => sum + r.normalizedScore, 0) / scoredResults.length) * 10) / 10 : null, [scoredResults]);
    const answeredQuestions = useMemo(() => interviewResults.reduce((sum, r) => sum + (Number(r?.answeredQuestions) || 0), 0), [interviewResults]);
    const totalQuestions = useMemo(() => interviewResults.reduce((sum, r) => sum + (Number(r?.totalQuestions) || 0), 0), [interviewResults]);
    const strongTopics = useMemo(() => [...new Set(interviewResults.flatMap(r => Array.isArray(r?.strengths) ? r.strengths : []))], [interviewResults]);
    const weakTopics = useMemo(() => [...new Set(interviewResults.flatMap(r => Array.isArray(r?.weakTopics) ? r.weakTopics : []))], [interviewResults]);
    const recentInterviews = useMemo(() => [...interviews].sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()).slice(0, 4), [interviews]);
    const scoreHistory = useMemo(() => [...scoredResults].sort((a, b) => new Date(a?.interview?.createdAt || 0).getTime() - new Date(b?.interview?.createdAt || 0).getTime()).slice(-7), [scoredResults]);
    const latestResult = useMemo(() => [...scoredResults].sort((a, b) => new Date(b?.interview?.updatedAt || b?.interview?.createdAt || 0).getTime() - new Date(a?.interview?.updatedAt || a?.interview?.createdAt || 0).getTime())[0] || null, [scoredResults]);
    const latestFeedback = useMemo(() => Array.isArray(latestResult?.questions) ? [...latestResult.questions].reverse().find(q => q?.feedback)?.feedback || "" : "", [latestResult]);
    const firstName = user?.fullName?.trim()?.split(/\s+/)[0] || "there";
    const questionCompletion = totalQuestions > 0 ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100)) : 0;

    return (
        <div className="min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onLogout={handleLogout} />

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className={`min-h-screen min-w-0 pt-16 transition-[margin] duration-300 md:pt-0 ${collapsed ? "md:ml-20" : "md:ml-[260px]"}`}
            >
                {/* Header Navbar */}
                <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--app-bg)]/90 backdrop-blur-2xl">
                    <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">Dashboard</h1>
                            <p className="hidden text-xs text-[var(--text-muted)] sm:block">Your personal interview workspace</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            
                            {/* Notification Dropdown */}
                            <div ref={notificationRef} className="relative">
                                <button
                                    onClick={() => { setNotificationOpen(!notificationOpen); setProfileMenuOpen(false); }}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition hover:border-violet-400/30 hover:bg-violet-500/10"
                                >
                                    <Bell className="h-[18px] w-[18px]" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#05050a] bg-violet-500 px-1 text-shadow-white` text-[10px] font-bold">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {notificationOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                            transition={{ duration: 0.16 }}
                                            className="fixed left-3 right-3 top-[76px] z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/40 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[360px]"
                                        >
                                            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
                                                <div>
                                                    <h2 className="text-sm font-semibold">Notifications</h2>
                                                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {unreadCount > 0 && (
                                                        <button onClick={handleMarkAllAsRead} className="text-xs font-medium text-violet-400 transition hover:text-[var(--accent)]">Mark all read</button>
                                                    )}
                                                    <button onClick={() => setNotificationOpen(false)} className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-white">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="max-h-[min(65vh,420px)] overflow-y-auto">
                                                {notificationLoading ? (
                                                    <div className="flex min-h-36 items-center justify-center">
                                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-violet-400" />
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
                                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]">
                                                            <Bell className="h-5 w-5 text-[var(--text-muted)]" />
                                                        </div>
                                                        <p className="text-sm font-medium">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-[var(--border)]">
                                                        {notifications.map((notification) => (
                                                            <button
                                                                key={notification._id}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.04] ${notification.isRead ? "" : "bg-violet-500/[0.06]"}`}
                                                            >
                                                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                                                                    <Sparkles className="h-4 w-4 text-violet-400" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <p className="line-clamp-2 text-sm font-medium">{notification.title || "Notification"}</p>
                                                                        {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-400" />}
                                                                    </div>
                                                                    {notification.message && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">{notification.message}</p>}
                                                                    <p className="mt-2 text-[10px] text-[var(--text-muted)]">{getNotificationTime(notification.createdAt)}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile Dropdown */}
                            <div ref={profileMenuRef} className="relative">
                                <button
                                    onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotificationOpen(false); }}
                                    className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-2 transition hover:bg-[var(--surface-hover)] sm:gap-3 sm:px-3"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold">
                                        {user?.profilePicture ? (
                                            <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (getInitials(user?.fullName))}
                                    </div>
                                    <div className="hidden min-w-0 text-left sm:block">
                                        <p className="max-w-28 truncate text-xs font-medium">{profileLoading ? "Loading..." : user?.fullName || "User"}</p>
                                        <p className="max-w-28 truncate text-[10px] text-[var(--text-muted)]">{user?.email || ""}</p>
                                    </div>
                                    <ChevronDown className={`hidden h-4 w-4 text-[var(--text-muted)] transition sm:block ${profileMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/40"
                                        >
                                            <div className="border-b border-[var(--border)] px-4 py-3">
                                                <p className="truncate text-sm font-semibold">{user?.fullName || "User"}</p>
                                                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{user?.email || ""}</p>
                                            </div>
                                            <div className="p-1.5">
                                                <button onClick={() => { setProfileMenuOpen(false); navigate("/profile"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-white">
                                                    <User className="h-4 w-4" /> Profile
                                                </button>
                                                <button onClick={() => { setProfileMenuOpen(false); navigate("/settings"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-white">
                                                    <Settings className="h-4 w-4" /> Settings
                                                </button>
                                                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/[0.08]">
                                                    <LogOut className="h-4 w-4" /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Welcome Banner */}
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-7 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] sm:p-7 lg:p-8">
                        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-fuchsia-500/[0.05] blur-3xl" />
                        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">
                                    <Sparkles className="h-3.5 w-3.5" /> Your AI interview workspace
                                </div>
                                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                                    Welcome back, <span className="text-[var(--accent)]">{firstName}</span>
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                                    Every practice session is a step forward. Review your progress, learn from your feedback, and prepare for your next opportunity.
                                </p>
                                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)]">
                                    <span className="inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        {completedInterviews.length} completed {completedInterviews.length === 1 ? "interview" : "interviews"}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Activity className="h-4 w-4 text-[var(--accent)]" />
                                        {interviews.length - completedInterviews.length} in progress
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => navigate("/interview/create")} className={`${buttonClass} h-11 shrink-0 self-start sm:self-auto`}>
                                <Plus className="h-4 w-4" /> New interview <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.section>

                    {/* High-Level Stats */}
                    <section className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
                        <StatCard label="Total interviews" value={interviewLoading ? "—" : interviews.length} description={`${completedInterviews.length} completed`} icon={Brain} iconStyle="bg-violet-500/10 text-[var(--accent)]" delay={0} />
                        <StatCard label="Average score" value={interviewLoading || averageScore === null ? "—" : `${averageScore}/10`} description={averageScore === null ? "Complete an evaluation" : "Across evaluated interviews"} icon={TrendingUp} iconStyle="bg-emerald-500/10 text-[var(--success)]" delay={0.04} />
                        <StatCard label="Questions answered" value={interviewLoading ? "—" : answeredQuestions} description={`${totalQuestions} questions tracked`} icon={CheckCircle2} iconStyle="bg-sky-500/10 text-[var(--info)]" delay={0.08} />
                        <StatCard label="Strong topics" value={interviewLoading ? "—" : strongTopics.length} description="Strengths from AI feedback" icon={Target} iconStyle="bg-amber-500/10 text-[var(--warning)]" delay={0.12} />
                    </section>

                    {/* Detailed Layout */}
                    <section className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${panelClass} p-5 sm:p-6`}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                                            <Activity className="h-[18px] w-[18px] text-[var(--accent)]" />
                                        </div>
                                        <h3 className="text-base font-semibold">Performance overview</h3>
                                    </div>
                                    <p className={`mt-2 ${mutedText}`}>Your scores from recent evaluated interviews</p>
                                </div>
                                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-1.5 text-[11px] text-[var(--text-secondary)]">Out of 10</span>
                            </div>
                            
                            <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end">
                                <div className="sm:min-w-32">
                                    <p className="text-xs text-[var(--text-muted)]">Overall average</p>
                                    <p className="mt-2 text-4xl font-semibold tracking-tight">{averageScore === null ? "—" : averageScore.toFixed(1)}<span className="ml-1 text-base font-medium text-[var(--text-muted)]">/10</span></p>
                                    <p className="mt-2 text-xs text-[var(--text-muted)]">{scoredResults.length} evaluated {scoredResults.length === 1 ? "interview" : "interviews"}</p>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs text-[var(--text-muted)]">Score history</span>
                                        <span className="text-xs font-medium text-[var(--accent)]">{scoreHistory.length ? `${scoreHistory.length} sessions` : "No data yet"}</span>
                                    </div>
                                    {scoreHistory.length > 0 ? (
                                        <div className="flex h-32 items-end gap-2 sm:gap-3">
                                            {scoreHistory.map((result, i) => {
                                                const score = result.normalizedScore;
                                                const height = Math.max(8, Math.min(100, (score / 10) * 100));
                                                return (
                                                    <div key={result.interviewId || i} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" title={`Score: ${score}/10`}>
                                                        <span className="text-[10px] text-[var(--text-secondary)] opacity-0 transition group-hover:opacity-100">{score}</span>
                                                        <div className="flex h-24 w-full items-end overflow-hidden rounded-t-lg bg-white/[0.035]">
                                                            <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.45, delay: i * 0.04 }} className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-300" />
                                                        </div>
                                                        <span className="max-w-full truncate text-[9px] text-[var(--text-muted)]">{i + 1}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white/[0.015] px-4 text-center">
                                            <TrendingUp className="mb-2 h-5 w-5 text-[var(--text-muted)]" />
                                            <p className="text-sm text-[var(--text-secondary)]">Your score history will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 border-t border-[var(--border)] pt-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-xs text-[var(--text-secondary)]">Questions answered</span>
                                    <span className="text-xs font-medium text-[var(--text-secondary)]">{answeredQuestions}/{totalQuestions}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${questionCompletion}%` }} className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`${panelClass} flex min-w-0 flex-col p-5 sm:p-6`}>
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10">
                                    <Sparkles className="h-[18px] w-[18px] text-fuchsia-300" />
                                </div>
                                <h3 className="text-base font-semibold">Latest AI feedback</h3>
                            </div>
                            <p className={`mt-2 ${mutedText}`}>A quick look at your latest evaluation</p>
                            
                            {latestResult ? (
                                <div className="mt-5 flex flex-1 flex-col">
                                    <div className="rounded-xl border border-violet-400/[0.12] bg-violet-500/[0.05] p-4">
                                        <p className="text-xs text-[var(--accent)]">Most recent evaluated interview</p>
                                        <h4 className="mt-2 line-clamp-2 text-sm font-semibold">{latestResult.interview?.title || latestResult.interview?.role || "Interview evaluation"}</h4>
                                        <div className="mt-3 flex items-end justify-between gap-3">
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)]">Your score</p>
                                                <p className="mt-1 text-2xl font-semibold">{latestResult.normalizedScore}<span className="ml-1 text-xs font-medium text-[var(--text-muted)]">/10</span></p>
                                            </div>
                                            <button onClick={() => navigate(`/interview/${latestResult.interviewId}`)} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] transition hover:text-[var(--accent)]">
                                                View result <ArrowRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex-1">
                                        <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Feedback highlight</p>
                                        <p className="line-clamp-5 text-sm leading-6 text-[var(--text-secondary)]">{latestFeedback || "Open your interview result to review detailed insights."}</p>
                                    </div>
                                    <button onClick={() => navigate(`/interview/${latestResult.interviewId}`)} className={`${secondaryButtonClass} mt-4 w-full`}>
                                        Explore full evaluation <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white/[0.015] px-4 py-8 text-center">
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                                        <Brain className="h-5 w-5 text-[var(--accent)]" />
                                    </div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">Your feedback starts here</p>
                                    <button onClick={() => navigate("/interview/create")} className={`${buttonClass} mt-4`}><Plus className="h-4 w-4" /> Start an interview</button>
                                </div>
                            )}
                        </motion.div>
                    </section>

                    {/* Topics Row */}
                    <section className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <TopicSection title="Your strengths" subtitle="Topics highlighted by AI feedback" topics={strongTopics} icon={CheckCircle2} 
                            iconStyle={{ bg: "bg-emerald-500/10", text: "text-[var(--success)]", pill: "border-emerald-400/[0.14] bg-emerald-400/[0.06] text-emerald-500" }} 
                            emptyText="Your strengths will appear after your first interview evaluation." />
                        <TopicSection title="Areas to improve" subtitle="Topics worth practising next" topics={weakTopics} icon={Target} 
                            iconStyle={{ bg: "bg-amber-500/10", text: "text-[var(--warning)]", pill: "border-amber-400/[0.14] bg-amber-400/[0.06] text-amber-500" }} 
                            emptyText="Improvement areas will appear when AI feedback identifies topics to work on." />
                    </section>

                    {/* Recent List */}
                    <section className={`${panelClass} overflow-hidden`}>
                        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                                        <Clock3 className="h-[18px] w-[18px] text-[var(--accent)]" />
                                    </div>
                                    <h3 className="text-base font-semibold">Recent interviews</h3>
                                </div>
                                <p className={`mt-2 ${mutedText}`}>Continue where you left off</p>
                            </div>
                            <button onClick={() => navigate("/interviews")} className={secondaryButtonClass}>View all <ArrowRight className="h-4 w-4" /></button>
                        </div>
                        {interviewLoading ? (
                            <div className="flex min-h-40 items-center justify-center">
                                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--border)] border-t-violet-400" />
                            </div>
                        ) : recentInterviews.length === 0 ? (
                            <div className="flex flex-col items-center px-5 py-12 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]">
                                    <Brain className="h-5 w-5 text-[var(--text-muted)]" />
                                </div>
                                <h4 className="text-sm font-semibold">No interviews yet</h4>
                                <button onClick={() => navigate("/interview/create")} className={`${buttonClass} mt-5`}><Plus className="h-4 w-4" /> Create interview</button>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {recentInterviews.map((interview, index) => {
                                    const result = interviewResults.find((item) => item.interviewId === interview._id);
                                    const score = getScore(result);
                                    const completed = isCompleted(interview);

                                    return (
                                        <motion.div key={interview._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[var(--surface-hover)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]">
                                                    <Brain className="h-5 w-5 text-[var(--accent)]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-semibold">{interview.title || interview.role || "Mock interview"}</h4>
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
                                                        {interview.role && <span>{interview.role}</span>}
                                                        {interview.role && interview.interviewType && <span>·</span>}
                                                        {interview.interviewType && <span>{interview.interviewType}</span>}
                                                        <span>·</span>
                                                        <span>{formatDate(interview.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                                <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${completed ? "border-emerald-400/[0.15] bg-emerald-400/[0.06] text-[var(--success)]" : "border-amber-500/25 bg-amber-400/10 text-[var(--warning)]"}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${completed ? "bg-emerald-400" : "bg-amber-400"}`} />
                                                    {completed ? "Completed" : "In progress"}
                                                </div>
                                                {score !== null && <span className="min-w-14 text-right text-sm font-semibold">{score}/10</span>}
                                                <button onClick={() => navigate(`/interview/${interview._id}`)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-[var(--accent)]">
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
                    <footer className="flex flex-col gap-2 py-7 text-center text-[11px] text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <p className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
                            <Sparkles className="h-3.5 w-3.5 text-violet-400/70" /> Synthex AI
                        </p>
                        <p>Practice with purpose. Improve with every interview.</p>
                    </footer>
                </div>
            </motion.main>
        </div>
    );
};

export default Dashboard;