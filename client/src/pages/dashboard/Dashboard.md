import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
    Bell,
    ChevronDown,
    Plus,
    Sparkles,
    User,
    Settings,
    LogOut,
    BriefcaseBusiness,
    Trophy,
    Target,
    Brain,
    ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Sidebar from "../../components/dashboard/Sidebar.jsx";
import RecentInterviewCard from "../../components/dashboard/RecentInterviewCard.jsx";
import PerformanceOverview from "../../components/dashboard/PerfomanceOvervew.jsx";

import { useAuth } from "../../context/AuthContext.jsx";
import { getProfile } from "../../usecase/user.usecase.js";
import { getAllInterviews } from "../../usecase/interview.usecase.js";
import { getInterviewResult } from "../../usecase/interviewResult.usecase.js";


const Dashboard = () => {
    /* =====================================================
       SIDEBAR
    ===================================================== */

    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem("sidebar-collapsed") === "true";
    });


    /* =====================================================
       USER
    ===================================================== */

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const profileMenuRef = useRef(null);


    /* =====================================================
       INTERVIEWS
    ===================================================== */

    const [interviews, setInterviews] = useState([]);
    const [interviewLoading, setInterviewLoading] = useState(true);
    const [interviewResults, setInterviewResults] = useState([]);


    /* =====================================================
       HOOKS
    ===================================================== */

    const { logout } = useAuth();
    const navigate = useNavigate();


    /* =====================================================
       HELPERS
    ===================================================== */

    const getInitials = (fullName) => {
        if (!fullName) return "S";

        return fullName
            .trim()
            .split(/\s+/)
            .map((name) => name.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };


    /* =====================================================
       CLOSE PROFILE DROPDOWN
    ===================================================== */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);


    /* =====================================================
       FETCH PROFILE
    ===================================================== */

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                const response = await getProfile();

                const profile =
                    response?.data?.user ||
                    response?.user ||
                    response?.data ||
                    null;

                setUser(profile);
            } catch (error) {
                console.error(
                    "Dashboard profile error:",
                    error
                );

                toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);


    /* =====================================================
       FETCH INTERVIEWS + RESULTS
    ===================================================== */

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                setInterviewLoading(true);

                const response = await getAllInterviews();

                const interviewData =
                    response?.data?.interviews ||
                    response?.interviews ||
                    [];

                setInterviews(
                    Array.isArray(interviewData)
                        ? interviewData
                        : []
                );


                /* -----------------------------------------
                   Completed interviews
                ----------------------------------------- */

                const completedInterviews =
                    interviewData.filter(
                        (interview) =>
                            interview.status === "Completed" ||
                            interview.status === "completed"
                    );


                /* -----------------------------------------
                   Fetch all results in parallel
                ----------------------------------------- */

                const results = await Promise.all(
                    completedInterviews.map(
                        async (interview) => {
                            try {
                                const resultResponse =
                                    await getInterviewResult(
                                        interview._id
                                    );

                                return {
                                    interviewId:
                                        interview._id,

                                    interview,

                                    ...(resultResponse?.data ||
                                        {}),
                                };
                            } catch (error) {
                                console.error(
                                    `Failed to fetch result for ${interview._id}:`,
                                    error
                                );

                                return null;
                            }
                        }
                    )
                );

                setInterviewResults(
                    results.filter(Boolean)
                );
            } catch (error) {
                console.error(
                    "Dashboard interviews error:",
                    error
                );

                setInterviews([]);
                setInterviewResults([]);
            } finally {
                setInterviewLoading(false);
            }
        };

        fetchInterviews();
    }, []);


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {
        setProfileMenuOpen(false);
        logout();
    };


    /* =====================================================
       DERIVED DATA
    ===================================================== */

    const totalInterviews = interviews.length;


    const completedInterviews = useMemo(() => {
        return interviews.filter(
            (interview) =>
                interview.status === "Completed" ||
                interview.status === "completed"
        );
    }, [interviews]);


    /* =====================================================
       SCORED RESULTS
    ===================================================== */

    const scoredResults = useMemo(() => {
        return interviewResults.filter(
            (result) =>
                typeof result.averageScore === "number"
        );
    }, [interviewResults]);


    /* =====================================================
       AVERAGE SCORE
    ===================================================== */

    const averageScore = useMemo(() => {
        if (scoredResults.length === 0) {
            return null;
        }

        const total = scoredResults.reduce(
            (sum, result) =>
                sum + Number(result.averageScore || 0),
            0
        );

        return Math.round(
            total / scoredResults.length
        );
    }, [scoredResults]);


    /* =====================================================
       STRENGTHS
    ===================================================== */

    const strongTopics = useMemo(() => {
        return [
            ...new Set(
                interviewResults.flatMap(
                    (result) =>
                        Array.isArray(result.strengths)
                            ? result.strengths
                            : []
                )
            ),
        ];
    }, [interviewResults]);


    /* =====================================================
       WEAK TOPICS
    ===================================================== */

    const weakTopics = useMemo(() => {
        return [
            ...new Set(
                interviewResults.flatMap(
                    (result) =>
                        Array.isArray(result.weakTopics)
                            ? result.weakTopics
                            : []
                )
            ),
        ];
    }, [interviewResults]);


    /* =====================================================
       EVALUATED INTERVIEWS
    ===================================================== */

    const evaluatedInterviews = interviewResults;


    /* =====================================================
       LATEST EVALUATED INTERVIEW
    ===================================================== */

    const latestEvaluatedInterview = useMemo(() => {
        return [...interviewResults].sort(
            (a, b) => {
                const dateA = new Date(
                    a?.interview?.updatedAt ||
                    a?.interview?.createdAt ||
                    0
                );

                const dateB = new Date(
                    b?.interview?.updatedAt ||
                    b?.interview?.createdAt ||
                    0
                );

                return dateB - dateA;
            }
        )[0];
    }, [interviewResults]);


    /* =====================================================
       LATEST FEEDBACK
    ===================================================== */

    const latestFeedback = useMemo(() => {
        const questions =
            latestEvaluatedInterview?.questions;

        if (!Array.isArray(questions) || questions.length === 0) {
            return "";
        }

        const evaluatedQuestions = questions.filter(
            (question) =>
                question?.feedback &&
                question.feedback.trim()
        );

        if (evaluatedQuestions.length === 0) {
            return "";
        }

        return (
            evaluatedQuestions[
                evaluatedQuestions.length - 1
            ]?.feedback || ""
        );
    }, [latestEvaluatedInterview]);


    /* =====================================================
       RECENT INTERVIEWS
    ===================================================== */

    const recentInterviews = useMemo(() => {
        return [...interviews]
            .sort((a, b) => {
                return (
                    new Date(b?.createdAt || 0) -
                    new Date(a?.createdAt || 0)
                );
            })
            .slice(0, 3);
    }, [interviews]);


    /* =====================================================
       STATS
    ===================================================== */

    const stats = useMemo(() => {
        return [
            {
                label: "Total Interviews",
                value: interviewLoading
                    ? "..."
                    : totalInterviews,
                description:
                    totalInterviews === 0
                        ? "No interviews yet"
                        : `${totalInterviews} interview${
                              totalInterviews > 1
                                  ? "s"
                                  : ""
                          }`,
                icon: BriefcaseBusiness,
                iconClass:
                    "text-violet-300 bg-violet-500/10 border-violet-400/10",
            },

            {
                label: "Average Score",
                value: interviewLoading
                    ? "..."
                    : averageScore === null
                    ? "—"
                    : `${averageScore}/10`,
                description:
                    completedInterviews.length === 0
                        ? "No completed interviews"
                        : "Across completed interviews",
                icon: Trophy,
                iconClass:
                    "text-amber-300 bg-amber-500/10 border-amber-400/10",
            },

            {
                label: "Strong Topics",
                value: interviewLoading
                    ? "..."
                    : strongTopics.length,
                description:
                    strongTopics.length === 0
                        ? "No strengths detected yet"
                        : "Topics you're strong in",
                icon: Brain,
                iconClass:
                    "text-emerald-300 bg-emerald-500/10 border-emerald-400/10",
            },

            {
                label: "Weak Topics",
                value: interviewLoading
                    ? "..."
                    : weakTopics.length,
                description:
                    weakTopics.length === 0
                        ? "No weaknesses detected yet"
                        : "Topics to improve",
                icon: Target,
                iconClass:
                    "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-400/10",
            },
        ];
    }, [
        interviewLoading,
        totalInterviews,
        averageScore,
        completedInterviews.length,
        strongTopics.length,
        weakTopics.length,
    ]);


    /* =====================================================
       PROFILE AVATAR
    ===================================================== */

    const profileInitials = getInitials(
        user?.fullName
    );


    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="min-h-screen bg-[#05050a] text-white">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onLogout={handleLogout}
            />


            {/* =================================================
                MAIN
            ================================================= */}

            <motion.main
                className={`min-h-screen min-w-0 overflow-x-hidden pt-16 md:pt-0 ${
                    collapsed
                        ? "md:ml-20"
                        : "md:ml-[260px]"
                } transition-[margin-left] duration-300 ease-in-out`}
            >


                {/* =================================================
                    TOPBAR
                ================================================= */}

                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/[0.07] bg-[#05050a]/80 px-5 backdrop-blur-xl sm:px-6 lg:px-8">

                    {/* LEFT */}

                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
                            Workspace
                        </p>

                        <h1 className="mt-1 text-lg font-semibold tracking-tight">
                            Dashboard
                        </h1>
                    </div>


                    {/* RIGHT */}

                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Notification */}

                        <button
                            type="button"
                            aria-label="Notifications"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition-all hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                        >
                            <Bell size={18} />

                            <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
                        </button>


                        {/* Profile */}

                        <div
                            className="relative"
                            ref={profileMenuRef}
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setProfileMenuOpen(
                                        (prev) => !prev
                                    )
                                }
                                aria-expanded={
                                    profileMenuOpen
                                }
                                className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2 py-2 transition-all hover:border-white/10 hover:bg-white/[0.05] sm:px-2.5"
                            >

                                {/* Avatar */}

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold shadow-lg shadow-violet-950/20">

                                    {user?.profilePicture ? (
                                        <img
                                            src={
                                                user.profilePicture
                                            }
                                            alt={
                                                user?.fullName ||
                                                "Profile"
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        profileInitials
                                    )}

                                </div>


                                {/* User Info */}

                                <div className="hidden text-left sm:block">

                                    <div className="max-w-32 truncate text-xs font-medium">
                                        {loading
                                            ? "Loading..."
                                            : user?.fullName ||
                                              "User"}
                                    </div>

                                    <div className="mt-0.5 text-[10px] text-zinc-600">
                                        {user?.subscription ||
                                            "Free"}{" "}
                                        Plan
                                    </div>

                                </div>


                                <ChevronDown
                                    size={15}
                                    className={`text-zinc-600 transition-transform duration-200 ${
                                        profileMenuOpen
                                            ? "rotate-180 text-violet-400"
                                            : ""
                                    }`}
                                />

                            </button>


                            {/* =================================================
                                PROFILE DROPDOWN
                            ================================================= */}

                            {profileMenuOpen && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: -8,
                                        scale: 0.97,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                    }}
                                    transition={{
                                        duration: 0.15,
                                    }}
                                    className="absolute right-0 top-full z-50 mt-3 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b12]/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
                                >

                                    {/* USER HEADER */}

                                    <div className="border-b border-white/[0.07] p-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold">

                                                {user?.profilePicture ? (
                                                    <img
                                                        src={
                                                            user.profilePicture
                                                        }
                                                        alt={
                                                            user?.fullName ||
                                                            "Profile"
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    profileInitials
                                                )}

                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-medium text-white">
                                                    {user?.fullName ||
                                                        "User"}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-zinc-500">
                                                    {user?.email || ""}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* MENU */}

                                    <div className="p-2">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileMenuOpen(
                                                    false
                                                );
                                                navigate(
                                                    "/profile"
                                                );
                                            }}
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-white"
                                        >
                                            <User size={17} />
                                            <span>
                                                My Profile
                                            </span>
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileMenuOpen(
                                                    false
                                                );
                                                navigate(
                                                    "/settings"
                                                );
                                            }}
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-white"
                                        >
                                            <Settings
                                                size={17}
                                            />
                                            <span>
                                                Settings
                                            </span>
                                        </button>

                                    </div>


                                    {/* LOGOUT */}

                                    <div className="border-t border-white/[0.07] p-2">

                                        <button
                                            type="button"
                                            onClick={
                                                handleLogout
                                            }
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition-all hover:bg-red-500/[0.08] hover:text-red-300"
                                        >
                                            <LogOut size={17} />
                                            <span>
                                                Logout
                                            </span>
                                        </button>

                                    </div>

                                </motion.div>
                            )}

                        </div>

                    </div>

                </header>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="p-5 sm:p-6 lg:p-8">


                    {/* =================================================
                        WELCOME HERO
                    ================================================= */}

                    <motion.section
                        initial={{
                            opacity: 0,
                            y: 18,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.45,
                        }}
                        className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.09] via-white/[0.02] to-fuchsia-500/[0.06] p-6 sm:p-7 lg:p-9"
                    >

                        {/* Glow */}

                        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />

                        <div className="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />


                        {/* Content */}

                        <div className="relative max-w-2xl">

                            {/* Badge */}

                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
                                <Sparkles size={13} />
                                AI Interview Intelligence
                            </div>


                            {/* Heading */}

                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">

                                Good to see you again
                                {user?.fullName
                                    ? `, ${
                                          user.fullName
                                              .trim()
                                              .split(
                                                  /\s+/
                                              )[0]
                                      }`
                                    : ""}
                                .

                            </h2>


                            {/* Description */}

                            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                                Prepare smarter, identify your
                                weaknesses, and improve your
                                interview performance with
                                AI-powered practice.
                            </p>


                            {/* CTA */}

                            <motion.button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/interview/create"
                                    )
                                }
                                whileHover={{
                                    scale: 1.02,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-medium shadow-lg shadow-violet-900/20 transition-shadow hover:shadow-violet-900/40"
                            >
                                <Plus size={17} />
                                Start New Interview
                            </motion.button>

                        </div>

                    </motion.section>


                    {/* =================================================
                        STATS
                    ================================================= */}

                    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {stats.map((stat, index) => {
                            const Icon = stat.icon;

                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{
                                        opacity: 0,
                                        y: 16,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        delay:
                                            0.08 +
                                            index * 0.07,
                                        duration: 0.4,
                                    }}
                                    whileHover={{
                                        y: -3,
                                    }}
                                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all hover:border-violet-400/10 hover:bg-white/[0.035]"
                                >

                                    <div className="flex items-start justify-between">

                                        <div>
                                            <p className="text-xs text-zinc-600">
                                                {stat.label}
                                            </p>

                                            <div className="mt-3 text-2xl font-semibold tracking-tight">
                                                {stat.value}
                                            </div>
                                        </div>


                                        <div
                                            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${stat.iconClass}`}
                                        >
                                            <Icon size={17} />
                                        </div>

                                    </div>


                                    <p className="mt-1 text-xs text-zinc-600">
                                        {stat.description}
                                    </p>

                                </motion.div>
                            );
                        })}

                    </section>


                    {/* =================================================
                        LOWER GRID
                    ================================================= */}

                    <section className="mt-6 grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">


                        {/* =================================================
                            RECENT INTERVIEWS
                        ================================================= */}

                        <div className="min-w-0 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6 xl:col-span-2">

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <h3 className="font-medium">
                                            Recent Interviews
                                        </h3>

                                        {interviews.length >
                                            0 && (
                                            <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-500">
                                                {
                                                    interviews.length
                                                }
                                            </span>
                                        )}

                                    </div>

                                    <p className="mt-1 text-xs text-zinc-600">
                                        Your latest interview
                                        sessions
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/interviews"
                                        )
                                    }
                                    className="group inline-flex items-center gap-1.5 text-xs text-violet-400 transition-colors hover:text-violet-300"
                                >
                                    View all
                                    <ArrowRight
                                        size={13}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </button>

                            </div>


                            <div className="mt-5 space-y-3">

                                {/* LOADING */}

                                {interviewLoading ? (

                                    <div className="flex min-h-52 items-center justify-center">

                                        <div className="text-center">

                                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />

                                            <p className="mt-4 text-xs text-zinc-600">
                                                Loading
                                                interviews...
                                            </p>

                                        </div>

                                    </div>

                                ) : interviews.length ===
                                  0 ? (

                                    /* EMPTY */

                                    <div className="flex min-h-52 items-center justify-center">

                                        <div className="max-w-sm text-center">

                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
                                                <Sparkles
                                                    size={20}
                                                    className="text-zinc-600"
                                                />
                                            </div>

                                            <p className="mt-4 text-sm text-zinc-500">
                                                No interviews
                                                yet
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-zinc-700">
                                                Start your first AI
                                                interview to
                                                build your
                                                performance
                                                profile.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        "/interview/create"
                                                    )
                                                }
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-violet-400/10 bg-violet-500/10 px-3 py-2 text-xs text-violet-300 transition-colors hover:bg-violet-500/15"
                                            >
                                                <Plus
                                                    size={14}
                                                />
                                                Create Interview
                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    /* INTERVIEWS */

                                    recentInterviews.map(
                                        (interview) => (
                                            <RecentInterviewCard
                                                key={
                                                    interview._id
                                                }
                                                interview={
                                                    interview
                                                }
                                            />
                                        )
                                    )

                                )}

                            </div>

                        </div>


                        {/* =================================================
                            AI INSIGHT
                        ================================================= */}

                        <div className="relative min-w-0 w-full overflow-hidden rounded-2xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.07] to-fuchsia-500/[0.03] p-5 sm:p-6">

                            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />


                            {/* Header */}

                            <div className="relative flex items-center gap-2 text-violet-300">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/10 bg-violet-500/10">
                                    <Sparkles size={16} />
                                </div>

                                <div>
                                    <h3 className="font-medium">
                                        AI Insight
                                    </h3>

                                    <p className="text-[10px] text-zinc-600">
                                        Based on your evaluations
                                    </p>
                                </div>

                            </div>


                            {/* NO EVALUATION */}

                            {evaluatedInterviews.length ===
                            0 ? (

                                <>
                                    <p className="mt-5 text-sm leading-6 text-zinc-500">
                                        Complete your first
                                        interview and Synthex
                                        AI will analyze your
                                        answers to identify
                                        strengths, weaknesses,
                                        and areas for targeted
                                        improvement.
                                    </p>

                                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/20 p-4">

                                        <p className="text-xs leading-5 text-zinc-600">
                                            Your personalized
                                            insights will appear
                                            here after your first
                                            evaluation.
                                        </p>

                                    </div>
                                </>

                            ) : (

                                /* HAS EVALUATION */

                                <>
                                    <div className="relative mt-5 rounded-xl border border-violet-400/10 bg-black/20 p-4">

                                        <p className="text-xs text-zinc-600">
                                            Current average
                                            performance
                                        </p>

                                        <div className="mt-2 flex items-end gap-2">

                                            <span className="text-3xl font-semibold tracking-tight text-violet-300">
                                                {averageScore}
                                            </span>

                                            <span className="mb-1 text-xs text-zinc-600">
                                                / 10
                                            </span>

                                        </div>

                                        {averageScore !==
                                            null && (
                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">

                                                <motion.div
                                                    initial={{
                                                        width: 0,
                                                    }}
                                                    animate={{
                                                        width: `${Math.min(
                                                            averageScore *
                                                                10,
                                                            100
                                                        )}%`,
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        delay: 0.2,
                                                    }}
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                                />

                                            </div>
                                        )}

                                    </div>


                                    {/* WEAK TOPICS */}

                                    {weakTopics.length >
                                        0 && (
                                        <div className="mt-5">

                                            <p className="text-xs font-medium text-zinc-500">
                                                Focus on improving
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">

                                                {weakTopics
                                                    .slice(
                                                        0,
                                                        5
                                                    )
                                                    .map(
                                                        (
                                                            topic,
                                                            index
                                                        ) => (
                                                            <span
                                                                key={`${topic}-${index}`}
                                                                className="rounded-lg border border-amber-400/10 bg-amber-500/[0.06] px-2.5 py-1.5 text-[11px] text-amber-300"
                                                            >
                                                                {
                                                                    topic
                                                                }
                                                            </span>
                                                        )
                                                    )}

                                            </div>

                                        </div>
                                    )}


                                    {/* STRONG TOPICS */}

                                    {strongTopics.length >
                                        0 && (
                                        <div className="mt-5">

                                            <p className="text-xs font-medium text-zinc-500">
                                                Your strengths
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">

                                                {strongTopics
                                                    .slice(
                                                        0,
                                                        3
                                                    )
                                                    .map(
                                                        (
                                                            topic,
                                                            index
                                                        ) => (
                                                            <span
                                                                key={`${topic}-${index}`}
                                                                className="rounded-lg border border-emerald-400/10 bg-emerald-500/[0.06] px-2.5 py-1.5 text-[11px] text-emerald-300"
                                                            >
                                                                {
                                                                    topic
                                                                }
                                                            </span>
                                                        )
                                                    )}

                                            </div>

                                        </div>
                                    )}


                                    {/* FOOTER */}

                                    <div className="mt-6 rounded-xl border border-violet-400/10 bg-black/20 p-4">

                                        <p className="text-xs leading-5 text-zinc-500">
                                            Keep practicing your
                                            weak areas and complete
                                            more interviews to build
                                            a stronger performance
                                            profile.
                                        </p>

                                    </div>

                                </>
                            )}

                        </div>

                    </section>


                    {/* =================================================
                        PERFORMANCE OVERVIEW
                    ================================================= */}

                    <section className="mt-6">

                        <PerformanceOverview
                            evaluatedInterviews={
                                evaluatedInterviews
                            }
                            averageScore={averageScore}
                            strongTopics={strongTopics}
                            weakTopics={weakTopics}
                            latestFeedback={
                                latestFeedback
                            }
                        />

                    </section>

                </div>

            </motion.main>

        </div>
    );
};

export default Dashboard;