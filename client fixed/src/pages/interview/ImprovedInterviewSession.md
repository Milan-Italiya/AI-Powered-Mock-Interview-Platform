import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Brain,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Clock3,
    Sparkles,
    Target,
    Trophy,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { getInterviewResult } from "../../usecase/interviewResult.usecase.js";

const InterviewResult = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadResult = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getInterviewResult(interviewId);

                console.log("Interview result response:", response);

                setResult(response?.data);
            } catch (error) {
                console.error(
                    "Failed to load interview result:",
                    error
                );

                setError(
                    error?.response?.data?.message ||
                    "Failed to load interview result."
                );
            } finally {
                setLoading(false);
            }
        };

        if (interviewId) {
            loadResult();
        }
    }, [interviewId]);

    /* --------------------------------
       Loading
    -------------------------------- */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#05050a] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                        <Sparkles
                            size={20}
                            className="text-violet-400"
                        />

                        <div className="absolute inset-0 animate-spin rounded-2xl border-2 border-transparent border-t-violet-400" />
                    </div>

                    <p className="text-sm text-zinc-500">
                        Analyzing your interview...
                    </p>
                </div>
            </div>
        );
    }

    /* --------------------------------
       Error
    -------------------------------- */

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#05050a] px-6 text-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/10 bg-red-500/10">
                    <XCircle
                        size={26}
                        className="text-red-400"
                    />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                    Unable to load result
                </h2>

                <p className="mt-2 max-w-md text-center text-sm text-zinc-500">
                    {error}
                </p>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm text-zinc-300 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!result) {
        return null;
    }

    /* --------------------------------
       Score calculations
    -------------------------------- */

    const averageScore = Number(result.averageScore || 0);

    const scorePercentage = Math.min(
        Math.max(averageScore * 10, 0),
        100
    );

    const getPerformance = (score) => {
        if (score >= 8.5) {
            return {
                label: "Excellent Performance",
                description:
                    "You demonstrated strong knowledge and confidence.",
                icon: Trophy,
            };
        }

        if (score >= 7) {
            return {
                label: "Good Performance",
                description:
                    "You have a solid foundation with a few areas to improve.",
                icon: TrendingUp,
            };
        }

        if (score >= 5) {
            return {
                label: "Average Performance",
                description:
                    "You understand the basics, but more practice is needed.",
                icon: Target,
            };
        }

        return {
            label: "Needs Improvement",
            description:
                "Focus on your weak topics and practice consistently.",
            icon: CircleAlert,
        };
    };

    const performance = getPerformance(averageScore);

    const PerformanceIcon = performance.icon;

    const getScoreText = (score) => {
        if (score >= 8.5) return "text-emerald-300";
        if (score >= 7) return "text-violet-300";
        if (score >= 5) return "text-amber-300";
        return "text-red-300";
    };

    const getScoreBar = (score) => {
        if (score >= 8.5) return "bg-emerald-400";
        if (score >= 7) return "bg-violet-400";
        if (score >= 5) return "bg-amber-400";
        return "bg-red-400";
    };

    return (
        <div className="min-h-screen overflow-hidden bg-[#05050a] text-white">

            {/* =========================================
                BACKGROUND
            ========================================= */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/[0.07] blur-[140px]" />

                <div className="absolute right-[-180px] top-[25%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[0.06] blur-[140px]" />

                <div className="absolute bottom-[-250px] left-[30%] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-[140px]" />

            </div>

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="relative z-20 flex h-20 items-center border-b border-white/[0.07] bg-[#05050a]/80 px-6 backdrop-blur-xl lg:px-10">

                <button
                    onClick={() => navigate("/dashboard")}
                    className="group flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                >
                    <ArrowLeft
                        size={17}
                        className="transition-transform group-hover:-translate-x-1"
                    />

                    Dashboard
                </button>

                <div className="mx-auto flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-900/20">
                        <Sparkles size={15} />
                    </div>

                    <span className="text-sm font-semibold">
                        Synthex AI
                    </span>

                </div>

                <div className="w-[84px]" />

            </header>

            {/* =========================================
                MAIN
            ========================================= */}

            <main className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">

                {/* =====================================
                    HERO
                ===================================== */}

                <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.08] via-white/[0.025] to-fuchsia-500/[0.05] p-6 sm:p-8 lg:p-10">

                    {/* Decorative glow */}

                    <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-violet-500/[0.08] blur-[100px]" />

                    <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_280px]">

                        {/* Hero text */}

                        <div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">

                                <CheckCircle2 size={13} />

                                Interview Completed

                            </div>

                            <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">

                                {result.interview?.title}

                            </h1>

                            <p className="mt-3 text-sm text-zinc-500">
                                {result.interview?.role}
                            </p>

                            {/* Tags */}

                            <div className="mt-6 flex flex-wrap gap-2">

                                {result.interview?.difficulty && (
                                    <span className="rounded-lg border border-white/[0.07] bg-black/20 px-3 py-1.5 text-xs text-zinc-400">
                                        {result.interview.difficulty}
                                    </span>
                                )}

                                {result.interview?.interviewType && (
                                    <span className="rounded-lg border border-white/[0.07] bg-black/20 px-3 py-1.5 text-xs text-zinc-400">
                                        {result.interview.interviewType}
                                    </span>
                                )}

                                {result.interview?.experienceLevel && (
                                    <span className="rounded-lg border border-white/[0.07] bg-black/20 px-3 py-1.5 text-xs text-zinc-400">
                                        {result.interview.experienceLevel}
                                    </span>
                                )}

                            </div>

                            {/* Performance message */}

                            <div className="mt-8 flex items-start gap-3">

                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                                    <PerformanceIcon
                                        size={18}
                                        className="text-violet-400"
                                    />
                                </div>

                                <div>

                                    <p className="text-sm font-medium">
                                        {performance.label}
                                    </p>

                                    <p className="mt-1 max-w-lg text-xs leading-5 text-zinc-500">
                                        {performance.description}
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Score */}

                        <div className="flex justify-center lg:justify-end">

                            <div className="relative flex h-56 w-56 items-center justify-center">

                                {/* Outer ring */}

                                <div className="absolute inset-0 rounded-full border border-white/[0.05]" />

                                {/* Progress ring */}

                                <svg
                                    className="absolute inset-0 h-full w-full -rotate-90"
                                    viewBox="0 0 100 100"
                                >

                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="44"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="text-white/[0.05]"
                                    />

                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="44"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeDasharray="276.46"
                                        strokeDashoffset={
                                            276.46 -
                                            (276.46 *
                                                scorePercentage) /
                                            100
                                        }
                                        className="text-violet-400 transition-all duration-1000"
                                    />

                                </svg>

                                {/* Center */}

                                <div className="relative text-center">

                                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                                        Overall Score
                                    </p>

                                    <div className="mt-1">

                                        <span
                                            className={`text-6xl font-semibold tracking-tight ${getScoreText(
                                                averageScore
                                            )}`}
                                        >
                                            {averageScore}
                                        </span>

                                        <span className="ml-1 text-lg text-zinc-600">
                                            /10
                                        </span>

                                    </div>

                                    <p className="mt-1 text-xs text-zinc-600">
                                        AI evaluated
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =====================================
                    STATISTICS
                ===================================== */}

                <section className="mt-6 grid gap-4 sm:grid-cols-3">

                    {/* Total */}

                    <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-white/[0.12]">

                        <div className="flex items-center justify-between">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                                <Brain
                                    size={19}
                                    className="text-violet-400"
                                />
                            </div>

                            <span className="text-xs text-zinc-600">
                                QUESTIONS
                            </span>

                        </div>

                        <p className="mt-5 text-3xl font-semibold">
                            {result.totalQuestions}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                            Total questions
                        </p>

                    </div>

                    {/* Answered */}

                    <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-white/[0.12]">

                        <div className="flex items-center justify-between">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                <CheckCircle2
                                    size={19}
                                    className="text-emerald-400"
                                />
                            </div>

                            <span className="text-xs text-zinc-600">
                                ANSWERED
                            </span>

                        </div>

                        <p className="mt-5 text-3xl font-semibold">
                            {result.answeredQuestions}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                            Questions completed
                        </p>

                    </div>

                    {/* Total Score */}

                    <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-white/[0.12]">

                        <div className="flex items-center justify-between">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10">
                                <Trophy
                                    size={19}
                                    className="text-fuchsia-400"
                                />
                            </div>

                            <span className="text-xs text-zinc-600">
                                TOTAL SCORE
                            </span>

                        </div>

                        <p className="mt-5 text-3xl font-semibold">
                            {result.totalScore}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                            Combined score
                        </p>

                    </div>

                </section>

                {/* =====================================
                    INSIGHTS
                ===================================== */}

                <section className="mt-6 grid gap-6 lg:grid-cols-2">

                    {/* Strengths */}

                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

                        <div className="flex items-start justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <CheckCircle2
                                        size={19}
                                        className="text-emerald-400"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-medium">
                                        Your Strengths
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-600">
                                        Areas where you performed well
                                    </p>
                                </div>

                            </div>

                            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-400">
                                {result.strengths?.length || 0} FOUND
                            </span>

                        </div>

                        <div className="mt-6 space-y-3">

                            {result.strengths?.length > 0 ? (
                                result.strengths.map(
                                    (strength, index) => (
                                        <div
                                            key={index}
                                            className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-emerald-400/10 hover:bg-emerald-500/[0.03]"
                                        >

                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                                                <CheckCircle2
                                                    size={13}
                                                    className="text-emerald-400"
                                                />
                                            </div>

                                            <p className="text-sm leading-6 text-zinc-300">
                                                {strength}
                                            </p>

                                        </div>
                                    )
                                )
                            ) : (
                                <div className="rounded-xl border border-white/[0.06] bg-black/10 p-5 text-sm text-zinc-600">
                                    No strengths identified yet.
                                </div>
                            )}

                        </div>

                    </div>

                    {/* Weak Topics */}

                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

                        <div className="flex items-start justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10">
                                    <Target
                                        size={19}
                                        className="text-fuchsia-400"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-medium">
                                        Focus Areas
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-600">
                                        Topics that need more practice
                                    </p>
                                </div>

                            </div>

                            <span className="rounded-lg bg-fuchsia-500/10 px-2.5 py-1 text-[10px] text-fuchsia-400">
                                {result.weakTopics?.length || 0} FOUND
                            </span>

                        </div>

                        <div className="mt-6">

                            {result.weakTopics?.length > 0 ? (

                                <div className="grid gap-3 sm:grid-cols-2">

                                    {result.weakTopics.map(
                                        (topic, index) => (
                                            <div
                                                key={index}
                                                className="group flex items-center justify-between rounded-xl border border-fuchsia-400/10 bg-fuchsia-500/[0.04] px-4 py-3 transition hover:border-fuchsia-400/20 hover:bg-fuchsia-500/[0.07]"
                                            >

                                                <div className="flex items-center gap-3">

                                                    <div className="h-2 w-2 rounded-full bg-fuchsia-400" />

                                                    <span className="text-sm text-fuchsia-200">
                                                        {topic}
                                                    </span>

                                                </div>

                                                <ChevronRight
                                                    size={15}
                                                    className="text-fuchsia-400/40 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-400"
                                                />

                                            </div>
                                        )
                                    )}

                                </div>

                            ) : (
                                <div className="rounded-xl border border-white/[0.06] bg-black/10 p-5 text-sm text-zinc-600">
                                    No weak topics identified.
                                </div>
                            )}

                        </div>

                    </div>

                </section>

                {/* =====================================
                    QUESTION PERFORMANCE
                ===================================== */}

                <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                                <TrendingUp
                                    size={19}
                                    className="text-violet-400"
                                />
                            </div>

                            <div>
                                <h2 className="text-sm font-medium">
                                    Question Performance
                                </h2>

                                <p className="mt-1 text-xs text-zinc-600">
                                    Detailed breakdown of your answers
                                </p>
                            </div>

                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <div className="h-2 w-2 rounded-full bg-violet-400" />
                            Score out of 10
                        </div>

                    </div>

                    <div className="mt-7 space-y-4">

                        {result.questions?.map(
                            (question, index) => {

                                const score = Number(
                                    question.score || 0
                                );

                                return (
                                    <div
                                        key={question._id}
                                        className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-white/[0.1]"
                                    >

                                        <div className="flex items-start gap-4">

                                            {/* Number */}

                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-xs font-medium text-zinc-500">
                                                {String(
                                                    index + 1
                                                ).padStart(2, "0")}
                                            </div>

                                            {/* Question */}

                                            <div className="min-w-0 flex-1">

                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                                    <p className="text-sm leading-6 text-zinc-300">
                                                        {
                                                            question.question
                                                        }
                                                    </p>

                                                    <span
                                                        className={`shrink-0 text-sm font-semibold ${getScoreText(
                                                            score
                                                        )}`}
                                                    >
                                                        {score}
                                                        <span className="text-xs font-normal text-zinc-600">
                                                            /10
                                                        </span>
                                                    </span>

                                                </div>

                                                {/* Progress */}

                                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">

                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${getScoreBar(
                                                            score
                                                        )}`}
                                                        style={{
                                                            width: `${Math.min(
                                                                score *
                                                                10,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </section>

                {/* =====================================
                    FINAL CTA
                ===================================== */}

                <section className="relative mt-6 overflow-hidden rounded-2xl border border-violet-400/10 bg-gradient-to-r from-violet-500/[0.08] to-fuchsia-500/[0.06] p-6 sm:p-7">

                    <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/10 blur-[70px]" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-2">

                                <Clock3
                                    size={16}
                                    className="text-violet-400"
                                />

                                <p className="text-sm font-medium">
                                    Keep improving
                                </p>

                            </div>

                            <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-500">
                                Review your weak topics and take another
                                interview to improve your performance.
                            </p>

                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">

                            <button
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-5 py-3 text-sm text-zinc-300 transition hover:border-white/[0.15] hover:text-white"
                            >
                                Dashboard
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/interview/create")
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-medium shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-fuchsia-500"
                            >
                                Practice Again
                                <ArrowRight size={16} />
                            </button>

                        </div>

                    </div>

                </section>

            </main>
        </div>
    );
};

export default InterviewResult;