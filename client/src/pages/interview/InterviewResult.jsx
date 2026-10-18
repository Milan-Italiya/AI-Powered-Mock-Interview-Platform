
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft,
    ArrowRight,
    Award,
    Brain,
    CheckCircle2,
    ChevronDown,
    CircleAlert,
    Clock3,
    FileText,
    ListChecks,
    RotateCcw,
    Sparkles,
    Target,
    Trophy,
    XCircle,
} from "lucide-react";
import { getInterviewResult } from "../../usecase/interviewResult.usecase.js";

const InterviewResult = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const loadResult = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            if (!interviewId) {
                throw new Error("Interview ID is missing.");
            }

            const response = await getInterviewResult(interviewId);

            const resultData =
                response?.data?.result ??
                response?.data?.data?.result ??
                response?.data?.data ??
                response?.data ??
                response?.result ??
                response ??
                null;

            if (!resultData || typeof resultData !== "object") {
                throw new Error("No interview result data was found.");
            }

            setResult(resultData);
        } catch (err) {
            console.error("Failed to load interview result:", err);

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load interview result.";

            setError(message);
            setResult(null);

            toast.error("Unable to load result", {
                description: message,
            });
        } finally {
            setLoading(false);
        }
    }, [interviewId]);

    useEffect(() => {
        loadResult();
    }, [loadResult, retryCount]);

    const questions = useMemo(() => {
        if (!result) return [];

        const data =
            result.questions ??
            result.evaluatedQuestions ??
            result.questionResults ??
            result.interview?.questions ??
            result.interviewData?.questions ??
            [];

        return Array.isArray(data) ? data : [];
    }, [result]);

    const isQuestionEvaluated = useCallback((question) => {
        return (
            question?.status?.toLowerCase() === "evaluated" ||
            Boolean(
                typeof question?.feedback === "string"
                    ? question.feedback.trim()
                    : question?.feedback
            )
        );
    }, []);

    const totalQuestions = useMemo(() => {
        const value =
            result?.totalQuestions ??
            result?.total ??
            questions.length;

        return Math.max(0, Number(value) || 0);
    }, [result, questions.length]);

    const answeredQuestions = useMemo(() => {
        if (result?.answeredQuestions != null) {
            return Math.max(
                0,
                Number(result.answeredQuestions) || 0
            );
        }

        if (result?.answered != null) {
            return Math.max(0, Number(result.answered) || 0);
        }

        return questions.filter((question) => {
            return (
                question?.status?.toLowerCase() === "answered" ||
                isQuestionEvaluated(question) ||
                (typeof question?.answer === "string" &&
                    question.answer.trim().length > 0)
            );
        }).length;
    }, [result, questions, isQuestionEvaluated]);

    const evaluatedQuestions = useMemo(() => {
        const explicitCount =
            result?.evaluatedQuestionsCount ??
            result?.evaluatedCount ??
            (typeof result?.evaluatedQuestions === "number"
                ? result.evaluatedQuestions
                : null);

        if (explicitCount != null) {
            return Math.max(0, Number(explicitCount) || 0);
        }

        return questions.filter(isQuestionEvaluated).length;
    }, [result, questions, isQuestionEvaluated]);

    const totalScore = useMemo(() => {
        if (typeof result?.totalScore === "number") {
            return Math.max(0, result.totalScore);
        }

        return questions.reduce((total, question) => {
            if (!isQuestionEvaluated(question)) return total;

            const score = Number(question?.score);

            return total + (
                Number.isFinite(score)
                    ? Math.min(10, Math.max(0, score))
                    : 0
            );
        }, 0);
    }, [result, questions, isQuestionEvaluated]);

    const averageScore = useMemo(() => {
        if (typeof result?.averageScore === "number") {
            return Math.min(
                10,
                Math.max(0, result.averageScore)
            );
        }

        if (evaluatedQuestions === 0) return 0;

        return Math.min(
            10,
            Math.max(0, totalScore / evaluatedQuestions)
        );
    }, [result, totalScore, evaluatedQuestions]);

    const strengths = useMemo(() => {
        if (Array.isArray(result?.strengths)) {
            return [...new Set(result.strengths.filter(Boolean))];
        }

        return [
            ...new Set(
                questions.flatMap((question) =>
                    Array.isArray(question?.strengths)
                        ? question.strengths.filter(Boolean)
                        : []
                )
            ),
        ];
    }, [result, questions]);

    const weakTopics = useMemo(() => {
        if (Array.isArray(result?.weakTopics)) {
            return [...new Set(result.weakTopics.filter(Boolean))];
        }

        return [
            ...new Set(
                questions.flatMap((question) =>
                    Array.isArray(question?.weakTopics)
                        ? question.weakTopics.filter(Boolean)
                        : []
                )
            ),
        ];
    }, [result, questions]);

    const interview = useMemo(() => {
        if (!result) return null;

        return (
            result.interview ??
            result.interviewData ??
            result.data ??
            result
        );
    }, [result]);

    const interviewTitle =
        interview?.title ||
        result?.title ||
        "Interview Result";

    const role = interview?.role || result?.role || "Interview";
    const interviewType =
        interview?.interviewType || result?.interviewType || "Mixed";
    const difficulty =
        interview?.difficulty || result?.difficulty || "Medium";
    const experienceLevel =
        interview?.experienceLevel || result?.experienceLevel || "";

    const answeredPercentage =
        totalQuestions > 0
            ? Math.min(100, (answeredQuestions / totalQuestions) * 100)
            : 0;

    const evaluatedPercentage =
        totalQuestions > 0
            ? Math.min(100, (evaluatedQuestions / totalQuestions) * 100)
            : 0;

    const scorePercentage = Math.min(
        100,
        Math.max(0, (averageScore / 10) * 100)
    );

    const getScoreLabel = (score) => {
        if (score >= 8.5) return "Excellent";
        if (score >= 7) return "Strong Performance";
        if (score >= 5) return "Good Progress";
        if (score > 0) return "Keep Practicing";
        return "Not Evaluated";
    };

    const getScoreStyle = (score) => {
        if (score >= 8.5) {
            return {
                text: "text-emerald-300",
                bg: "bg-emerald-400/10",
                border: "border-emerald-400/20",
                ring: "#34d399",
                icon: CheckCircle2,
            };
        }

        if (score >= 7) {
            return {
                text: "text-violet-300",
                bg: "bg-violet-400/10",
                border: "border-violet-400/20",
                ring: "#a78bfa",
                icon: Trophy,
            };
        }

        if (score >= 5) {
            return {
                text: "text-amber-300",
                bg: "bg-amber-400/10",
                border: "border-amber-400/20",
                ring: "#fbbf24",
                icon: CircleAlert,
            };
        }

        return {
            text: "text-rose-300",
            bg: "bg-rose-400/10",
            border: "border-rose-400/20",
            ring: "#fb7185",
            icon: XCircle,
        };
    };

    const scoreStyle = getScoreStyle(averageScore);
    const ScoreIcon = scoreStyle.icon;

    const handleBack = () => navigate("/interviews");
    const handleNewInterview = () => navigate("/interview/create");
    const handleRetry = () => setRetryCount((previous) => previous + 1);

    const toggleQuestion = (index) => {
        setExpandedQuestion((previous) =>
            previous === index ? null : index
        );
    };

    const formatAnswer = (answer) => {
        if (
            answer == null ||
            (typeof answer === "string" && !answer.trim())
        ) {
            return "No answer was submitted for this question.";
        }

        return typeof answer === "string"
            ? answer
            : String(answer);
    };

    const formatFeedback = (feedback) => {
        if (!feedback) {
            return "No AI feedback is available for this question.";
        }

        return typeof feedback === "string"
            ? feedback
            : String(feedback);
    };

    if (loading) {
        return (
            <PageShell>
                <div className="flex min-h-[75vh] flex-col items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                        <Brain className="h-7 w-7 text-violet-300" />
                    </div>

                    <div className="mt-5 h-6 w-6 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />

                    <h2 className="mt-5 text-base font-semibold text-white">
                        Preparing your report
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                        Analysing your interview performance...
                    </p>
                </div>
            </PageShell>
        );
    }

    if (error || !result) {
        return (
            <PageShell>
                <div className="flex min-h-[75vh] items-center justify-center">
                    <div className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#100e1b]/90 p-7 text-center sm:p-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10">
                            <CircleAlert className="h-7 w-7 text-rose-300" />
                        </div>

                        <h1 className="mt-5 text-xl font-semibold text-white">
                            Unable to load interview result
                        </h1>

                        <p className="mt-3 break-words text-sm leading-6 text-zinc-400">
                            {error || "No result data was found."}
                        </p>

                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Interviews
                            </button>

                            <button
                                type="button"
                                onClick={handleRetry}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#090812]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="hidden sm:inline">All Interviews</span>
                        <span className="sm:hidden">Back</span>
                    </button>

                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                            <Sparkles className="h-4 w-4 text-violet-300" />
                        </div>

                        <span className="hidden text-zinc-200 sm:inline">
                            Synthex <span className="text-violet-300">AI</span>
                        </span>

                        <span className="text-zinc-200 sm:hidden">
                            Interview Report
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleNewInterview}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400 sm:px-4 sm:text-sm"
                    >
                        <span>New Interview</span>
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 sm:py-10 lg:px-10">
                <motion.section
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Evaluation Report
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[11px] text-zinc-400">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Results available
                        </span>
                    </div>

                    <div className="mt-5 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                        <div className="min-w-0">
                            <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                                {interviewTitle}
                            </h1>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                                Understand your performance, recognise your strengths,
                                and build a clear plan for improvement.
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {[role, interviewType, difficulty, experienceLevel]
                                    .filter(Boolean)
                                    .map((item, index) => (
                                        <span
                                            key={`${item}-${index}`}
                                            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300"
                                        >
                                            {item}
                                        </span>
                                    ))}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
                            <Clock3 className="h-4 w-4 text-violet-300" />
                            Interview performance summary
                        </div>
                    </div>
                </motion.section>

                <section className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.8fr)]">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="relative overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-[#17112b] via-[#110e1e] to-[#0d0b16] p-6 shadow-xl shadow-black/10 sm:p-8"
                    >
                        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-500/10 blur-[70px]" />

                        <div className="relative flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                                    Overall Score
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Your interview performance
                                </p>
                            </div>

                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${scoreStyle.border} ${scoreStyle.bg}`}>
                                <ScoreIcon className={`h-5 w-5 ${scoreStyle.text}`} />
                            </div>
                        </div>

                        <div className="relative mt-7 flex flex-col items-center">
                            <div
                                className="relative flex h-44 w-44 items-center justify-center rounded-full sm:h-48 sm:w-48"
                                style={{
                                    background: `conic-gradient(${scoreStyle.ring} ${scorePercentage}%, rgba(255,255,255,0.07) ${scorePercentage}% 100%)`,
                                }}
                                role="img"
                                aria-label={`Average score ${averageScore.toFixed(1)} out of 10`}
                            >
                                <div className="absolute inset-[7px] flex flex-col items-center justify-center rounded-full border border-white/[0.06] bg-[#100d1b]">
                                    <span className={`text-5xl font-bold tracking-tight ${scoreStyle.text}`}>
                                        {averageScore.toFixed(1)}
                                    </span>
                                    <span className="mt-1 text-sm text-zinc-500">
                                        out of 10
                                    </span>
                                </div>
                            </div>

                            <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${scoreStyle.border} ${scoreStyle.bg} ${scoreStyle.text}`}>
                                <Award className="h-4 w-4" />
                                {getScoreLabel(averageScore)}
                            </div>

                            <p className="mt-3 max-w-xs text-center text-xs leading-5 text-zinc-500">
                                {evaluatedQuestions > 0
                                    ? `Based on ${evaluatedQuestions} evaluated ${evaluatedQuestions === 1 ? "question" : "questions"}.`
                                    : "Your score will be available when answers have been evaluated."}
                            </p>
                        </div>

                        <div className="relative mt-7 border-t border-white/[0.08] pt-5">
                            <div className="flex items-center justify-between gap-3 text-xs">
                                <span className="text-zinc-500">
                                    Total points earned
                                </span>
                                <span className="font-semibold text-zinc-200">
                                    {totalScore.toFixed(1)} / {evaluatedQuestions * 10}
                                </span>
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all duration-700"
                                    style={{
                                        width: `${
                                            evaluatedQuestions > 0
                                                ? Math.min(100, (totalScore / (evaluatedQuestions * 10)) * 100)
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.08 }}
                        className="rounded-3xl border border-white/[0.08] bg-[#100e1a]/90 p-5 sm:p-7"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10">
                                <ListChecks className="h-5 w-5 text-violet-300" />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Performance Summary
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Your interview progress at a glance.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <StatCard
                                icon={FileText}
                                label="Total Questions"
                                value={totalQuestions}
                                description="Questions in interview"
                                iconClass="text-sky-300"
                                iconBg="bg-sky-400/10"
                            />

                            <StatCard
                                icon={CheckCircle2}
                                label="Answered"
                                value={answeredQuestions}
                                description="Answers submitted"
                                iconClass="text-emerald-300"
                                iconBg="bg-emerald-400/10"
                            />

                            <StatCard
                                icon={Brain}
                                label="Evaluated"
                                value={evaluatedQuestions}
                                description="AI-reviewed answers"
                                iconClass="text-violet-300"
                                iconBg="bg-violet-400/10"
                            />
                        </div>

                        <div className="mt-6 space-y-5 border-t border-white/[0.07] pt-5">
                            <ProgressRow
                                label="Questions answered"
                                value={answeredQuestions}
                                total={totalQuestions}
                                percentage={answeredPercentage}
                                color="bg-emerald-400"
                            />

                            <ProgressRow
                                label="Questions evaluated"
                                value={evaluatedQuestions}
                                total={totalQuestions}
                                percentage={evaluatedPercentage}
                                color="bg-violet-400"
                            />
                        </div>

                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-violet-400/10 bg-violet-500/[0.06] p-4">
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                            <p className="text-xs leading-5 text-zinc-400">
                                Review the detailed feedback below to understand
                                what went well and which areas deserve more practice.
                            </p>
                        </div>
                    </motion.div>
                </section>

                <section className="mt-8 grid gap-5 xl:grid-cols-2">
                    <InsightSection
                        icon={CheckCircle2}
                        title="Your Strengths"
                        subtitle="What you did well"
                        description="Positive patterns identified in your evaluated answers."
                        items={strengths}
                        emptyText="No specific strengths were identified yet."
                        type="strength"
                    />

                    <InsightSection
                        icon={Target}
                        title="Focus Areas"
                        subtitle="Where to improve"
                        description="Topics that may benefit from additional practice."
                        items={weakTopics}
                        emptyText="No specific weak topics were identified yet."
                        type="weak"
                    />
                </section>

                <section className="mt-10">
                    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                                <Brain className="h-4 w-4" />
                                Detailed Evaluation
                            </div>

                            <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                                Question-by-question review
                            </h2>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                                Open each question to review your answer, AI feedback,
                                strengths, weak topics, and individual score.
                            </p>
                        </div>

                        <span className="w-fit rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
                            {questions.length} {questions.length === 1 ? "question" : "questions"}
                        </span>
                    </div>

                    {questions.length === 0 ? (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#100e1a]/80 px-5 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                                <FileText className="h-5 w-5 text-zinc-500" />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                                No question data available
                            </h3>

                            <p className="mt-2 text-sm text-zinc-500">
                                Question-level evaluation details could not be found for this interview.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((question, index) => {
                                const rawScore = Number(question?.score);
                                const score = Number.isFinite(rawScore)
                                    ? Math.min(10, Math.max(0, rawScore))
                                    : 0;

                                const questionScoreStyle = getScoreStyle(score);
                                const isExpanded = expandedQuestion === index;
                                const isEvaluated = isQuestionEvaluated(question);

                                return (
                                    <motion.div
                                        key={question?._id || index}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.25,
                                            delay: Math.min(index * 0.035, 0.25),
                                        }}
                                        className={`overflow-hidden rounded-2xl border transition-colors ${
                                            isExpanded
                                                ? "border-violet-400/20 bg-[#100e1b]"
                                                : "border-white/[0.08] bg-[#0e0c17]/80 hover:border-white/[0.14]"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleQuestion(index)}
                                            aria-expanded={isExpanded}
                                            className="flex w-full items-center gap-3 p-4 text-left sm:gap-4 sm:p-5"
                                        >
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-xs font-semibold text-zinc-400">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm font-semibold leading-6 text-zinc-200">
                                                    {question?.question || "Question unavailable"}
                                                </p>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className={`text-xs font-medium ${questionScoreStyle.text}`}>
                                                        {score.toFixed(1)} / 10
                                                    </span>

                                                    <span className="h-1 w-1 rounded-full bg-zinc-700" />

                                                    <span className={`text-xs ${isEvaluated ? "text-emerald-400" : "text-zinc-500"}`}>
                                                        {question?.status || (isEvaluated ? "Evaluated" : "Pending")}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`hidden shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold sm:block ${questionScoreStyle.bg} ${questionScoreStyle.border} ${questionScoreStyle.text}`}>
                                                {score.toFixed(1)} / 10
                                            </div>

                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="shrink-0 text-zinc-500"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    key="question-details"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{
                                                        height: { duration: 0.3 },
                                                        opacity: { duration: 0.2 },
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <QuestionReview
                                                        question={question}
                                                        scoreStyle={questionScoreStyle}
                                                        formatAnswer={formatAnswer}
                                                        formatFeedback={formatFeedback}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="mt-10 flex flex-col-reverse gap-3 border-t border-white/[0.07] py-7 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Interviews
                    </button>

                    <button
                        type="button"
                        onClick={handleNewInterview}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-violet-400"
                    >
                        <Sparkles className="h-4 w-4" />
                        Start New Interview
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </section>

                <footer className="pb-3 text-center text-xs text-zinc-600">
                    Powered by Synthex AI
                </footer>
            </main>
        </PageShell>
    );
};

const PageShell = ({ children }) => (
    <div className="relative min-h-screen overflow-hidden bg-[#070610] text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_65%)]" />
        <div className="pointer-events-none absolute -left-40 top-[500px] h-80 w-80 rounded-full bg-violet-700/[0.06] blur-[100px]" />
        <div className="pointer-events-none absolute -right-40 top-[850px] h-96 w-96 rounded-full bg-fuchsia-700/[0.05] blur-[120px]" />
        <div className="relative">{children}</div>
    </div>
);

const StatCard = ({
    icon: Icon,
    label,
    value,
    description,
    iconClass,
    iconBg,
}) => (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-white/[0.12]">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>

        <p className="mt-4 text-xs text-zinc-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-[11px] leading-5 text-zinc-600">{description}</p>
    </div>
);

const ProgressRow = ({ label, value, total, percentage, color }) => (
    <div>
        <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">{label}</span>
            <span className="shrink-0 text-xs font-medium text-zinc-300">
                {value} / {total}
            </span>
        </div>

        <div
            className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={Math.min(value, total)}
        >
            <div
                className={`h-full rounded-full transition-all duration-700 ${color}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    </div>
);

const InsightSection = ({
    icon: Icon,
    title,
    subtitle,
    description,
    items,
    emptyText,
    type,
}) => {
    const isStrength = type === "strength";

    const accent = isStrength
        ? {
              text: "text-emerald-300",
              iconBg: "bg-emerald-400/10",
              border: "border-emerald-400/15",
              dot: "bg-emerald-400",
          }
        : {
              text: "text-amber-300",
              iconBg: "bg-amber-400/10",
              border: "border-amber-400/15",
              dot: "bg-amber-400",
          };

    return (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#100e1a]/85">
            <div className="flex items-start gap-4 border-b border-white/[0.07] p-5 sm:p-6">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accent.border} ${accent.iconBg}`}>
                    <Icon className={`h-5 w-5 ${accent.text}`} />
                </div>

                <div className="min-w-0">
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${accent.text}`}>
                        {subtitle}
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-white">
                        {title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="p-5 sm:p-6">
                {items.length > 0 ? (
                    <ul className="space-y-3">
                        {items.map((item, index) => (
                            <li
                                key={`${item}-${index}`}
                                className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5"
                            >
                                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />
                                <span className="text-sm leading-6 text-zinc-300">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="rounded-xl border border-dashed border-white/[0.09] px-4 py-7 text-center">
                        <Icon className="mx-auto h-5 w-5 text-zinc-600" />
                        <p className="mt-3 text-sm text-zinc-500">{emptyText}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const QuestionReview = ({
    question,
    scoreStyle,
    formatAnswer,
    formatFeedback,
}) => {
    const strengths = Array.isArray(question?.strengths)
        ? question.strengths.filter(Boolean)
        : [];

    const weakTopics = Array.isArray(question?.weakTopics)
        ? question.weakTopics.filter(Boolean)
        : [];

    const score = Number(question?.score);
    const displayScore = Number.isFinite(score)
        ? Math.min(10, Math.max(0, score))
        : 0;

    return (
        <div className="border-t border-white/[0.07] bg-black/10 p-4 sm:p-6 lg:p-7">
            <div className="grid gap-6 xl:grid-cols-2">
                <div className="min-w-0 space-y-6">
                    <ReviewBlock label="Interview Question" icon={FileText}>
                        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                            {question?.question || "Question unavailable"}
                        </p>
                    </ReviewBlock>

                    <ReviewBlock label="Your Answer" icon={Brain}>
                        <div className="whitespace-pre-wrap break-words rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 text-sm leading-7 text-zinc-400">
                            {formatAnswer(question?.answer)}
                        </div>
                    </ReviewBlock>
                </div>

                <div className="min-w-0 space-y-6">
                    <ReviewBlock label="AI Feedback" icon={Sparkles}>
                        <div className="whitespace-pre-wrap break-words rounded-xl border border-violet-400/10 bg-violet-500/[0.045] p-4 text-sm leading-7 text-zinc-300">
                            {formatFeedback(question?.feedback)}
                        </div>
                    </ReviewBlock>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <ReviewList
                            title="Strengths"
                            items={strengths}
                            emptyText="No strengths recorded."
                            type="strength"
                        />

                        <ReviewList
                            title="Weak Topics"
                            items={weakTopics}
                            emptyText="No weak topics recorded."
                            type="weak"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
                <div>
                    <p className="text-xs font-medium text-zinc-300">
                        AI Evaluation Score
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                        Individual question result
                    </p>
                </div>

                <span className={`rounded-xl border px-4 py-2 text-sm font-semibold ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}`}>
                    {displayScore.toFixed(1)} / 10
                </span>
            </div>
        </div>
    );
};

const ReviewBlock = ({ label, icon: Icon, children }) => (
    <div className="min-w-0">
        <div className="mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4 text-violet-300" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                {label}
            </span>
        </div>
        {children}
    </div>
);

const ReviewList = ({ title, items, emptyText, type }) => {
    const isStrength = type === "strength";

    return (
        <div className="min-w-0">
            <p className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.13em] ${isStrength ? "text-emerald-300" : "text-amber-300"}`}>
                {title}
            </p>

            {items.length > 0 ? (
                <ul className="space-y-2.5">
                    {items.map((item, index) => (
                        <li
                            key={`${item}-${index}`}
                            className="flex items-start gap-2 text-xs leading-5 text-zinc-400"
                        >
                            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isStrength ? "bg-emerald-400" : "bg-amber-400"}`} />
                            <span className="break-words">{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs leading-5 text-zinc-600">{emptyText}</p>
            )}
        </div>
    );
};

export default InterviewResult;
