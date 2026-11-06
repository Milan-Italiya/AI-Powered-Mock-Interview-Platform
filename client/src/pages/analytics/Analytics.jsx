import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    BarChart3,
    TrendingUp,
    Target,
    Award,
    Brain,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    ArrowUpRight,
    Sparkles,
    RefreshCw,
    CircleHelp,
} from "lucide-react";

import Sidebar from "../../components/dashboard/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

import { getAllInterviews } from "../../usecase/interview.usecase.js";
import { getInterviewResult } from "../../usecase/interviewResult.usecase.js";

const INITIAL_ANALYTICS = {
    totalInterviews: 0,
    questionsAnswered: 0,
    averageScore: 0,
    performance: 0,
    strengths: [],
    weakTopics: [],
    recentResults: [],
};

const Analytics = () => {
    const { logout } = useAuth();
    const { theme, isDark } = useTheme();

    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem("sidebar-collapsed") === "true"
    );

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [analytics, setAnalytics] = useState(INITIAL_ANALYTICS);

    // Keep the sidebar state synchronized across browser tabs.
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

    // Fetch interviews and calculate analytics.
    const loadAnalytics = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const response = await getAllInterviews();

            // Support the response shapes used by the API/use-case layer:
            // a direct array, { interviews: [] }, { data: { interviews: [] } },
            // or Axios-style { data: [] }.
            const interviews = Array.isArray(response)
                ? response
                : response?.data?.interviews ??
                  response?.interviews ??
                  response?.data?.data ??
                  response?.data ??
                  [];

            if (!Array.isArray(interviews)) {
                throw new Error("Unable to load your interviews.");
            }

            const completedInterviews = interviews.filter((interview) =>
                ["completed", "evaluated"].includes(
                    String(interview?.status ?? "")
                        .trim()
                        .toLowerCase()
                )
            );

            const resultResponses = await Promise.all(
                completedInterviews.map(async (interview) => {
                    if (!interview?._id) return null;

                    try {
                        const resultResponse = await getInterviewResult(
                            interview._id
                        );

                        // Normalize common result response wrappers without
                        // assuming that every use-case returns an Axios response.
                        const result =
                            resultResponse?.data?.result ??
                            resultResponse?.data?.data?.result ??
                            resultResponse?.data?.data ??
                            resultResponse?.data ??
                            resultResponse?.result ??
                            resultResponse ??
                            null;

                        if (!result || typeof result !== "object") {
                            return null;
                        }

                        const questions = Array.isArray(result.questions)
                            ? result.questions
                            : Array.isArray(result.evaluatedQuestions)
                                ? result.evaluatedQuestions
                                : Array.isArray(result.data?.questions)
                                    ? result.data.questions
                                    : [];

                        const answeredQuestions = questions.filter((question) => {
                            const status = String(question?.status ?? "")
                                .trim()
                                .toLowerCase();

                            const hasAnswer =
                                typeof question?.answer === "string" &&
                                question.answer.trim().length > 0;

                            return (
                                ["answered", "evaluated", "completed"].includes(
                                    status
                                ) || hasAnswer
                            );
                        });

                        const scoredQuestions = questions.filter((question) => {
                            const score = question?.score;

                            return (
                                score !== null &&
                                score !== undefined &&
                                score !== "" &&
                                Number.isFinite(Number(score)) &&
                                Number(score) >= 0 &&
                                Number(score) <= 10 &&
                                (
                                    String(question?.status ?? "")
                                        .trim()
                                        .toLowerCase() === "evaluated" ||
                                    question?.feedback
                                )
                            );
                        });

                        const validAverage =
                            result.averageScore !== null &&
                            result.averageScore !== undefined &&
                            result.averageScore !== "" &&
                            Number.isFinite(Number(result.averageScore)) &&
                            Number(result.averageScore) >= 0 &&
                            Number(result.averageScore) <= 10;

                        const averageScore = scoredQuestions.length
                            ? scoredQuestions.reduce(
                                (sum, question) => sum + Number(question.score),
                                0
                            ) / scoredQuestions.length
                            : validAverage
                                ? Number(result.averageScore)
                                : null;

                        return {
                            ...result,
                            questions,
                            averageScore,
                            answeredQuestionCount: answeredQuestions.length,
                            scoredQuestionCount: scoredQuestions.length,
                            interview,
                        };
                    } catch (resultError) {
                        console.error(
                            `Failed to load result for interview ${interview._id}:`,
                            resultError
                        );

                        return null;
                    }
                })
            );

            const results = resultResponses.filter(Boolean);

            const scoredResults = results.filter(
                (result) => result.averageScore !== null
            );

            // Weight the overall score by evaluated question count when available.
            const totalWeightedScore = scoredResults.reduce(
                (sum, result) =>
                    sum +
                    result.averageScore *
                    (result.scoredQuestionCount || 1),
                0
            );

            const totalWeight = scoredResults.reduce(
                (sum, result) => sum + (result.scoredQuestionCount || 1),
                0
            );

            const averageScore =
                totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

            const questionsAnswered = results.reduce(
                (sum, result) => sum + result.answeredQuestionCount,
                0
            );

            const strengths = [];
            const weakTopics = [];

            results.forEach((result) => {
                if (Array.isArray(result.strengths)) {
                    strengths.push(...result.strengths);
                }

                if (Array.isArray(result.weakTopics)) {
                    weakTopics.push(...result.weakTopics);
                }

                result.questions.forEach((question) => {
                    if (Array.isArray(question?.strengths)) {
                        strengths.push(...question.strengths);
                    }

                    if (Array.isArray(question?.weakTopics)) {
                        weakTopics.push(...question.weakTopics);
                    }
                });
            });

            const uniqueStrengths = [
                ...new Set(
                    strengths
                        .filter((item) => typeof item === "string")
                        .map((item) => item.trim())
                        .filter(Boolean)
                ),
            ];

            const uniqueWeakTopics = [
                ...new Set(
                    weakTopics
                        .filter((item) => typeof item === "string")
                        .map((item) => item.trim())
                        .filter(Boolean)
                ),
            ];

            const getTimestamp = (date) => {
                if (!date) return 0;

                const timestamp = new Date(date).getTime();

                return Number.isFinite(timestamp) ? timestamp : 0;
            };

            const sortedResults = [...scoredResults].sort((a, b) => {
                const dateA = getTimestamp(
                    a.interview?.updatedAt ?? a.interview?.createdAt
                );

                const dateB = getTimestamp(
                    b.interview?.updatedAt ?? b.interview?.createdAt
                );

                return dateB - dateA;
            });

            const normalizedAverageScore = Number(averageScore.toFixed(1));

            setAnalytics({
                totalInterviews: completedInterviews.length,
                questionsAnswered,
                averageScore: normalizedAverageScore,
                performance: Math.round(normalizedAverageScore * 10),
                strengths: uniqueStrengths,
                weakTopics: uniqueWeakTopics,
                recentResults: sortedResults.slice(0, 5),
            });
        } catch (loadError) {
            console.error("Analytics Error:", loadError);

            setError(
                loadError?.response?.data?.message ||
                loadError?.message ||
                "Unable to load analytics. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);
    
    useEffect(() => {
        let isMounted = true;

        const fetchAnalytics = async () => {
            if (!isMounted) return;
            await loadAnalytics();
        };

        fetchAnalytics();

        return () => {
            isMounted = false;
        };
    }, [loadAnalytics]);

    const handleLogout = () => {
        logout();
    };

    const getScoreLabel = (score) => {
        if (score >= 8) return "Excellent";
        if (score >= 6) return "Good progress";
        if (score >= 4) return "Keep improving";
        return "Keep practicing";
    };

    const getScoreColor = (score) => {
        if (score >= 8) return "text-emerald-400";
        if (score >= 6) return "text-violet-400";
        if (score >= 4) return "text-amber-400";
        return "text-rose-400";
    };

    const statCards = [
        {
            label: "Average Score",
            value: analytics.averageScore.toFixed(1),
            suffix: "/10",
            description: getScoreLabel(analytics.averageScore),
            icon: TrendingUp,
            iconColor: "text-violet-300",
            iconBg: "bg-violet-500/10",
        },
        {
            label: "Completed Interviews",
            value: analytics.totalInterviews,
            suffix: "",
            description: "Successfully completed",
            icon: BarChart3,
            iconColor: "text-sky-300",
            iconBg: "bg-sky-500/10",
        },
        {
            label: "Questions Answered",
            value: analytics.questionsAnswered,
            suffix: "",
            description: "Across your evaluations",
            icon: Target,
            iconColor: "text-emerald-300",
            iconBg: "bg-emerald-500/10",
        },
        {
            label: "Overall Performance",
            value: analytics.performance,
            suffix: "%",
            description: "Average score converted to %",
            icon: Award,
            iconColor: "text-amber-300",
            iconBg: "bg-amber-500/10",
        },
    ];

    return (
        <div className={`analytics-page min-h-screen w-full overflow-x-clip ${isDark ? "bg-[#08080c] text-white" : "bg-slate-50 text-slate-900"}`} data-theme={theme}>

            <style>{`
                .analytics-page[data-theme="light"] {
                    background: #f8fafc !important;
                    color: #171329 !important;
                }

                /* Main page surfaces */
                .analytics-page[data-theme="light"] [class*="bg-[#0d0d13]"],
                .analytics-page[data-theme="light"] [class*="bg-[#08080c]"] {
                    background: #ffffff !important;
                    border-color: #e8e3f5 !important;
                    box-shadow: 0 8px 26px rgba(76, 29, 149, 0.045);
                }

                /* Overview banner: retain its own layout, use the Dashboard palette */
                .analytics-page[data-theme="light"] .analytics-overview-banner {
                    background:
                        radial-gradient(circle at 92% 8%, rgba(139, 92, 246, 0.12), transparent 34%),
                        radial-gradient(circle at 68% 100%, rgba(217, 70, 239, 0.06), transparent 30%),
                        linear-gradient(120deg, #f5f3ff 0%, #ffffff 52%, #f8faff 100%) !important;
                    border-color: #ddd6fe !important;
                    box-shadow: 0 8px 28px rgba(76, 29, 149, 0.06);
                }

                .analytics-page[data-theme="light"] [class*="text-white"],
                .analytics-page[data-theme="light"] [class*="text-zinc-200"],
                .analytics-page[data-theme="light"] [class*="text-zinc-300"] {
                    color: #241b3b !important;
                }

                .analytics-page[data-theme="light"] [class*="text-zinc-400"] {
                    color: #64748b !important;
                }

                .analytics-page[data-theme="light"] [class*="text-zinc-500"],
                .analytics-page[data-theme="light"] [class*="text-zinc-600"] {
                    color: #7c8495 !important;
                }

                .analytics-page[data-theme="light"] [class*="border-white"],
                .analytics-page[data-theme="light"] [class*="border-violet-400/15"] {
                    border-color: #e7e1f3 !important;
                }

                .analytics-page[data-theme="light"] [class*="bg-white/"] {
                    background-color: rgba(109, 40, 217, 0.035) !important;
                }

                /* Give decorative and stat icons a little more definition. */
                .analytics-page[data-theme="light"] [class*="text-violet-200"],
                .analytics-page[data-theme="light"] [class*="text-violet-300"] {
                    color: #6d28d9 !important;
                }

                .analytics-page[data-theme="light"] [class*="text-sky-300"] {
                    color: #0369a1 !important;
                }

                .analytics-page[data-theme="light"] [class*="text-emerald-300"],
                .analytics-page[data-theme="light"] [class*="text-emerald-400"] {
                    color: #047857 !important;
                }

                .analytics-page[data-theme="light"] [class*="text-amber-300"],
                .analytics-page[data-theme="light"] [class*="text-amber-400"] {
                    color: #a16207 !important;
                }

                .analytics-page[data-theme="light"] .analytics-empty-state svg {
                    color: #64748b !important;
                }

                .analytics-page[data-theme="light"] [class*="bg-violet-500/10"],
                .analytics-page[data-theme="light"] [class*="bg-violet-500/[0.08]"] {
                    background-color: #ede9fe !important;
                }

                .analytics-page[data-theme="light"] [class*="border-violet-300/15"],
                .analytics-page[data-theme="light"] [class*="border-violet-400/20"] {
                    border-color: #ddd6fe !important;
                }

                .analytics-page[data-theme="light"] .analytics-empty-state {
                    border-color: #e2dced !important;
                    background: #faf9ff !important;
                }

                .analytics-page[data-theme="light"] .analytics-empty-state p {
                    color: #64748b;
                }

                .analytics-page[data-theme="light"] .analytics-loading {
                    background: #ffffff !important;
                    border-color: #e7e1f3 !important;
                }

                .analytics-page[data-theme="light"] .analytics-loading p:first-of-type {
                    color: #241b3b !important;
                }

                .analytics-page[data-theme="light"] .analytics-score-panel {
                    background: rgba(255, 255, 255, 0.72) !important;
                    border-color: #e7e1f3 !important;
                }

                .analytics-page[data-theme="light"] .analytics-score-panel p:first-child {
                    color: #241b3b !important;
                }

                .analytics-page[data-theme="light"] .analytics-score-track {
                    background: #e9e5f1 !important;
                }

                .analytics-page[data-theme="light"] .analytics-page-heading {
                    color: #241b3b !important;
                }

                .analytics-page[data-theme="light"] .analytics-refresh {
                    color: #5b21b6 !important;
                    background: #ffffff !important;
                    border-color: #ddd6fe !important;
                }

                .analytics-page[data-theme="light"] .analytics-refresh:hover {
                    background: #f5f3ff !important;
                }

                .analytics-page[data-theme="light"] .analytics-error-description {
                    color: #64748b !important;
                }

                /* Slightly clearer separation for the insight sections */
                .analytics-insights {
                    border-color: rgba(139, 92, 246, 0.18) !important;
                }

                .analytics-insights h2 {
                    font-weight: 650 !important;
                    letter-spacing: -0.01em;
                }

                .analytics-insights h3 {
                    font-size: 0.75rem !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.06em !important;
                }

                .analytics-strength-chip {
                    color: #b7e8c9 !important;
                    background: rgba(16, 185, 129, 0.10) !important;
                    border-color: rgba(52, 211, 153, 0.27) !important;
                }

                .analytics-improve-chip {
                    color: #f3d99a !important;
                    background: rgba(245, 158, 11, 0.10) !important;
                    border-color: rgba(251, 191, 36, 0.28) !important;
                }

                .analytics-page[data-theme="light"] .analytics-insights {
                    border-color: #d5cafa !important;
                    box-shadow: 0 8px 24px rgba(76, 29, 149, 0.055) !important;
                }

                .analytics-page[data-theme="light"] .analytics-insights h2 {
                    color: #29213b !important;
                }

                .analytics-page[data-theme="light"] .analytics-insights h3 {
                    color: #287044 !important;
                }

                .analytics-page[data-theme="light"] .analytics-insights h3.text-amber-300 {
                    color: #95621d !important;
                }

                .analytics-page[data-theme="light"] .analytics-strength-chip {
                    color: #28613e !important;
                    background: #eaf6ee !important;
                    border-color: #b9ddc4 !important;
                }

                .analytics-page[data-theme="light"] .analytics-improve-chip {
                    color: #80591f !important;
                    background: #fff8eb !important;
                    border-color: #ead4a8 !important;
                }

                /* Keep dark-theme insight colors a little softer. */
                .analytics-page[data-theme="dark"] .analytics-insights {
                    border-color: rgba(139, 92, 246, 0.14) !important;
                }

                .analytics-page[data-theme="dark"] .analytics-strength-chip {
                    color: #acd9bb !important;
                    background: rgba(16, 185, 129, 0.075) !important;
                    border-color: rgba(52, 211, 153, 0.20) !important;
                }

                .analytics-page[data-theme="dark"] .analytics-improve-chip {
                    color: #e8d19b !important;
                    background: rgba(245, 158, 11, 0.075) !important;
                    border-color: rgba(251, 191, 36, 0.21) !important;
                }
            `}</style>

            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onLogout={handleLogout}
            />

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`min-h-screen min-w-0 overflow-x-clip pt-16 transition-[margin] duration-300 ease-in-out md:pt-0 ${collapsed ? "md:ml-20" : "md:ml-[260px]"
                    }`}
            >
                <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="analytics-page-heading mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
                    >
                        <div className="min-w-0">
                            <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
                                <Sparkles size={15} />
                                <span>Performance center</span>
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Your Analytics
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                                Understand your progress, celebrate your
                                strengths, and discover where to focus next.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => loadAnalytics(true)}
                            disabled={loading || refreshing}
                            className="analytics-refresh inline-flex w-full shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-auto"
                        >
                            <RefreshCw
                                size={16}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            {refreshing ? "Refreshing..." : "Refresh analytics"}
                        </button>
                    </motion.header>

                    {/* Error */}
                    {error && !loading && (
                        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <AlertTriangle
                                    size={19}
                                    className="mt-0.5 shrink-0 text-rose-400"
                                />
                                <div>
                                    <p className="text-sm font-medium text-rose-200">
                                        Analytics could not be loaded
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                                        {error}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => loadAnalytics(true)}
                                disabled={refreshing}
                                className="shrink-0 rounded-lg border border-rose-400/20 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {refreshing ? "Retrying..." : "Try again"}
                            </button>
                        </div>
                    )}

                    {/* Initial loading */}
                    {loading ? (
                        <div className="analytics-loading flex min-h-[420px] items-center justify-center rounded-3xl border border-white/[0.07] bg-[#0d0d13]">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                                    <Loader2
                                        size={22}
                                        className="animate-spin text-violet-300"
                                    />
                                </div>

                                <p className="text-sm font-medium text-zinc-200">
                                    Preparing your analytics
                                </p>

                                <p className="mt-2 text-xs text-zinc-500">
                                    Gathering your interview performance...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 sm:space-y-8">
                            {/* Overview banner */}
                            <motion.section
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="analytics-overview-banner relative overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.13] via-[#111019] to-[#0d0d13] p-5 sm:p-7 lg:p-8"
                            >
                                <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />

                                <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                                    <div className="min-w-0">
                                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[0.08] px-3 py-1.5 text-xs text-violet-200">
                                            <TrendingUp size={14} />
                                            Performance overview
                                        </div>

                                        <h2 className="max-w-xl text-xl font-semibold leading-snug sm:text-2xl">
                                            Every interview is an opportunity
                                            to get better.
                                        </h2>

                                        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                                            Review your scores and evaluation
                                            insights to see how your interview
                                            skills are developing.
                                        </p>
                                    </div>

                                    <div className="analytics-score-panel flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 sm:min-w-[230px] sm:p-5">
                                        <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full">
                                            <svg
                                                viewBox="0 0 100 100"
                                                className="absolute inset-0 h-full w-full -rotate-90"
                                                aria-label={`Performance ${analytics.performance}%`}
                                                role="img"
                                            >
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="42"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="7"
                                                    className="text-white/[0.07]"
                                                />

                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="42"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="7"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${Math.min(
                                                        analytics.performance,
                                                        100
                                                    ) * 2.639
                                                        } 264`}
                                                    className="text-violet-400 transition-all duration-700"
                                                />
                                            </svg>

                                            <span className="text-lg font-semibold">
                                                {analytics.performance}%
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-zinc-200">
                                                Overall score
                                            </p>

                                            <p
                                                className={`mt-1 text-xs ${getScoreColor(
                                                    analytics.averageScore
                                                )}`}
                                            >
                                                {getScoreLabel(
                                                    analytics.averageScore
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                Out of 100%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Stat cards */}
                            <section>
                                <div className="mb-4">
                                    <h2 className="text-base font-semibold">
                                        At a glance
                                    </h2>

                                    <p className="mt-1 text-sm text-zinc-500">
                                        A snapshot of your interview activity
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {statCards.map((stat, index) => {
                                        const Icon = stat.icon;

                                        return (
                                            <motion.article
                                                key={stat.label}
                                                initial={{
                                                    opacity: 0,
                                                    y: 12,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                className="group min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d0d13] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-[#101018] sm:p-5"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-zinc-400">
                                                            {stat.label}
                                                        </p>

                                                        <div className="mt-4 flex items-baseline gap-1.5">
                                                            <span className="text-3xl font-semibold tracking-tight text-white">
                                                                {stat.value}
                                                            </span>

                                                            {stat.suffix && (
                                                                <span className="text-sm text-zinc-500">
                                                                    {stat.suffix}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`shrink-0 rounded-xl p-3 ${stat.iconBg}`}
                                                    >
                                                        <Icon
                                                            size={19}
                                                            className={stat.iconColor}
                                                        />
                                                    </div>
                                                </div>

                                                <p className="mt-3 text-xs text-zinc-500">
                                                    {stat.description}
                                                </p>
                                            </motion.article>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Score history and learning insights */}
                            <div className="grid min-w-0 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                                {/* Score history */}
                                <motion.section
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d0d13] p-5 sm:p-6"
                                >
                                    <div className="mb-6 flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="rounded-xl bg-violet-500/10 p-3">
                                                <BarChart3
                                                    size={19}
                                                    className="text-violet-300"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="font-semibold">
                                                    Score history
                                                </h2>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    Your latest interview results
                                                </p>
                                            </div>
                                        </div>

                                        <span className="shrink-0 rounded-lg border border-white/[0.07] px-2.5 py-1.5 text-xs text-zinc-400">
                                            Latest 5
                                        </span>
                                    </div>

                                    {analytics.recentResults.length > 0 ? (
                                        <div className="space-y-5">
                                            {analytics.recentResults.map(
                                                (result, index) => {
                                                    const score = Math.max(
                                                        0,
                                                        Math.min(
                                                            10,
                                                            Number(
                                                                result.averageScore || 0
                                                            )
                                                        )
                                                    );

                                                    return (
                                                        <div
                                                            key={
                                                                result.interview?._id ||
                                                                result._id ||
                                                                index
                                                            }
                                                        >
                                                            <div className="mb-2.5 flex items-center justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-medium text-zinc-200">
                                                                        {result.interview?.title ||
                                                                            "Interview"}
                                                                    </p>

                                                                    <p className="mt-1 truncate text-xs text-zinc-500">
                                                                        {result.interview?.role ||
                                                                            "Interview session"}
                                                                    </p>
                                                                </div>

                                                                <div className="shrink-0 text-right">
                                                                    <span
                                                                        className={`text-sm font-semibold ${getScoreColor(
                                                                            score
                                                                        )}`}
                                                                    >
                                                                        {score.toFixed(
                                                                            1
                                                                        )}
                                                                    </span>

                                                                    <span className="text-xs text-zinc-500">
                                                                        /10
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div
                                                                className="analytics-score-track h-2 overflow-hidden rounded-full bg-white/[0.06]"
                                                                role="progressbar"
                                                                aria-label={`${result.interview?.title ||
                                                                    "Interview"
                                                                    } score`}
                                                                aria-valuenow={
                                                                    score * 10
                                                                }
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                            >
                                                                <motion.div
                                                                    initial={{
                                                                        width: 0,
                                                                    }}
                                                                    animate={{
                                                                        width: `${score * 10
                                                                            }%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.65,
                                                                        delay:
                                                                            index *
                                                                            0.06,
                                                                    }}
                                                                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={BarChart3}
                                            title="Your score history starts here"
                                            description="Complete an interview and its evaluation to see your scores."
                                        />
                                    )}
                                </motion.section>

                                {/* Strengths and weak areas */}
                                <motion.section
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="analytics-insights min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d0d13] p-5 sm:p-6"
                                >
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="rounded-xl bg-violet-500/10 p-3">
                                            <Brain
                                                size={19}
                                                className="text-violet-300"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="font-semibold">
                                                Your learning insights
                                            </h2>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                Patterns from your evaluations
                                            </p>
                                        </div>
                                    </div>

                                    {analytics.strengths.length > 0 ||
                                        analytics.weakTopics.length > 0 ? (
                                        <div className="space-y-6">
                                            <div>
                                                <div className="mb-3 flex items-center gap-2">
                                                    <CheckCircle2
                                                        size={16}
                                                        className="text-emerald-400"
                                                    />

                                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                                        Strengths
                                                    </h3>

                                                    <span className="ml-auto text-xs text-zinc-500">
                                                        {
                                                            analytics.strengths
                                                                .length
                                                        }
                                                    </span>
                                                </div>

                                                {analytics.strengths.length >
                                                    0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {analytics.strengths
                                                            .slice(0, 8)
                                                            .map(
                                                                (
                                                                    strength,
                                                                    index
                                                                ) => (
                                                                    <span
                                                                        key={`${strength}-${index}`}
                                                                        className="analytics-strength-chip max-w-full break-words rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-2 text-xs font-medium leading-5 text-emerald-100/90"
                                                                    >
                                                                        {strength}
                                                                    </span>
                                                                )
                                                            )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-zinc-500">
                                                        No strengths recorded
                                                        yet.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="border-t border-white/[0.06] pt-5">
                                                <div className="mb-3 flex items-center gap-2">
                                                    <AlertTriangle
                                                        size={16}
                                                        className="text-amber-400"
                                                    />

                                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                                                        Areas to improve
                                                    </h3>

                                                    <span className="ml-auto text-xs text-zinc-500">
                                                        {
                                                            analytics.weakTopics
                                                                .length
                                                        }
                                                    </span>
                                                </div>

                                                {analytics.weakTopics.length >
                                                    0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {analytics.weakTopics
                                                            .slice(0, 8)
                                                            .map(
                                                                (
                                                                    topic,
                                                                    index
                                                                ) => (
                                                                    <span
                                                                        key={`${topic}-${index}`}
                                                                        className="analytics-improve-chip max-w-full break-words rounded-lg border border-amber-500/15 bg-amber-500/[0.06] px-3 py-2 text-xs font-medium leading-5 text-amber-100/90"
                                                                    >
                                                                        {topic}
                                                                    </span>
                                                                )
                                                            )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-zinc-500">
                                                        No improvement areas
                                                        recorded yet.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Brain}
                                            title="Insights will appear here"
                                            description="Answer and evaluate interview questions to discover your strengths and improvement areas."
                                        />
                                    )}
                                </motion.section>
                            </div>

                            {/* Recent performance */}
                            <motion.section
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0d0d13] p-5 sm:p-6"
                            >
                                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-semibold">
                                            Recent performance
                                        </h2>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            A closer look at your completed
                                            interviews
                                        </p>
                                    </div>

                                    <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400">
                                        <CircleHelp size={14} />
                                        Scores are out of 10
                                    </div>
                                </div>

                                {analytics.recentResults.length > 0 ? (
                                    <div className="space-y-3">
                                        {analytics.recentResults.map(
                                            (result, index) => {
                                                const score = Math.max(
                                                    0,
                                                    Math.min(
                                                        10,
                                                        Number(
                                                            result.averageScore || 0
                                                        )
                                                    )
                                                );

                                                return (
                                                    <motion.article
                                                        key={
                                                            result.interview?._id ||
                                                            result._id ||
                                                            index
                                                        }
                                                        initial={{
                                                            opacity: 0,
                                                            y: 8,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.04,
                                                        }}
                                                        className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 transition-colors hover:border-violet-400/15 hover:bg-white/[0.035] sm:gap-4 sm:p-4"
                                                    >
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                                                            <BarChart3
                                                                size={18}
                                                                className="text-violet-300"
                                                            />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-zinc-200">
                                                                {result.interview?.title ||
                                                                    "Interview"}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-zinc-500">
                                                                {result.interview?.role ||
                                                                    "Interview session"}
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0 text-right">
                                                            <p
                                                                className={`text-sm font-semibold ${getScoreColor(
                                                                    score
                                                                )}`}
                                                            >
                                                                {score.toFixed(
                                                                    1
                                                                )}

                                                                <span className="ml-1 text-xs font-normal text-zinc-500">
                                                                    /10
                                                                </span>
                                                            </p>

                                                            <p className="mt-1 text-xs text-zinc-500">
                                                                {getScoreLabel(
                                                                    score
                                                                )}
                                                            </p>
                                                        </div>

                                                        <ArrowUpRight
                                                            size={16}
                                                            className="hidden shrink-0 text-zinc-600 sm:block"
                                                        />
                                                    </motion.article>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Target}
                                        title="No completed interviews yet"
                                        description="Once you complete and evaluate an interview, your recent performance will be displayed here."
                                    />
                                )}
                            </motion.section>
                        </div>
                    )}
                </div>
            </motion.main>
        </div>
    );
};

/* ================= EMPTY STATE ================= */

const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="analytics-empty-state flex min-h-[210px] items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.01] px-5 py-8">
        <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
                <Icon size={22} className="text-zinc-500" />
            </div>

            <p className="text-sm font-medium text-zinc-300">{title}</p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
                {description}
            </p>
        </div>
    </div>
);

export default Analytics;