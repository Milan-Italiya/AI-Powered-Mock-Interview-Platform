
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Brain,
    Check,
    CheckCircle2,
    ChevronLeft,
    CircleAlert,
    Clock3,
    Loader2,
    MessageSquareText,
    RefreshCw,
    Sparkles,
    Target,
    Trophy,
} from "lucide-react";
import { toast } from "sonner";

import {
    evaluateAnswer,
    getInterviewById,
} from "../../usecase/interview.usecase.js";

const InterviewSession = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");

    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState("");
    const [evaluation, setEvaluation] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    /* --------------------------------
       LOAD INTERVIEW
    -------------------------------- */

    const loadInterview = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getInterviewById(interviewId);

            const interviewData = response?.data?.interview;
            const questionsData = response?.data?.questions || [];

            if (!interviewData) {
                throw new Error("Interview information was not found.");
            }

            setInterview(interviewData);
            setQuestions(questionsData);
            setCurrentQuestion(0);

            const firstQuestion = questionsData[0];

            if (firstQuestion?.status === "Evaluated") {
                setEvaluation(firstQuestion);
                setAnswer(firstQuestion.answer || "");
            } else {
                setEvaluation(null);
                setAnswer(firstQuestion?.answer || "");
            }

            if (!questionsData.length) {
                setError("No questions found for this interview.");
            }
        } catch (error) {
            console.error("Failed to load interview:", error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to load interview.";

            setError(message);

            toast.error("Failed to load interview", {
                description: message,
            });
        } finally {
            setLoading(false);
        }
    }, [interviewId]);

    useEffect(() => {
        if (interviewId) {
            loadInterview();
        } else {
            setError("Interview ID is missing.");
            setLoading(false);
        }
    }, [interviewId, retryCount, loadInterview]);

    /* --------------------------------
       DERIVED STATE
    -------------------------------- */

    const question = questions[currentQuestion];

    const isLastQuestion =
        currentQuestion === questions.length - 1;

    const evaluatedCount = useMemo(
        () =>
            questions.filter(
                (item) => item.status === "Evaluated"
            ).length,
        [questions]
    );

    const progress = useMemo(() => {
        if (!questions.length) return 0;

        return ((currentQuestion + 1) / questions.length) * 100;
    }, [currentQuestion, questions.length]);

    const averageScore = useMemo(() => {
        const evaluatedQuestions = questions.filter(
            (item) =>
                item.status === "Evaluated" &&
                typeof item.score === "number"
        );

        if (!evaluatedQuestions.length) return null;

        const total = evaluatedQuestions.reduce(
            (sum, item) => sum + item.score,
            0
        );

        return (total / evaluatedQuestions.length).toFixed(1);
    }, [questions]);

    /* --------------------------------
       RESTORE CURRENT QUESTION STATE
    -------------------------------- */

    useEffect(() => {
        const current = questions[currentQuestion];

        if (!current) {
            setEvaluation(null);
            setAnswer("");
            return;
        }

        if (current.status === "Evaluated") {
            setEvaluation(current);
            setAnswer(current.answer || "");
        } else {
            setEvaluation(null);
            setAnswer(current.answer || "");
        }

        setError("");
    }, [currentQuestion, questions]);

    /* --------------------------------
       SUBMIT ANSWER
    -------------------------------- */

    const handleSubmitAnswer = async () => {
        const trimmedAnswer = answer.trim();

        if (!trimmedAnswer) {
            setError("Please enter an answer before submitting.");

            toast.warning("Answer required", {
                description: "Write your answer before submitting it for evaluation.",
            });

            return;
        }

        if (!question?._id) {
            setError("Question information is unavailable.");

            toast.error("Question unavailable", {
                description: "Unable to identify the current question.",
            });

            return;
        }

        if (evaluating || evaluation) return;

        try {
            setEvaluating(true);
            setError("");

            const response = await evaluateAnswer(
                question._id,
                trimmedAnswer
            );

            const evaluatedQuestion = response?.data?.question;

            if (!evaluatedQuestion) {
                throw new Error(
                    "The server did not return the evaluated question."
                );
            }

            setEvaluation(evaluatedQuestion);

            setQuestions((previousQuestions) =>
                previousQuestions.map((item) =>
                    item._id === evaluatedQuestion._id
                        ? evaluatedQuestion
                        : item
                )
            );

            setAnswer(evaluatedQuestion.answer || trimmedAnswer);

            toast.success("Answer evaluated", {
                description: "Your feedback and score are ready.",
            });
        } catch (error) {
            console.error("Answer evaluation error:", error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to evaluate answer.";

            setError(message);

            toast.error("Evaluation failed", {
                description: message,
            });
        } finally {
            setEvaluating(false);
        }
    };

    /* --------------------------------
       QUESTION NAVIGATION
    -------------------------------- */

    const goToQuestion = (index) => {
        if (evaluating || index < 0 || index >= questions.length) {
            return;
        }

        setCurrentQuestion(index);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handlePreviousQuestion = () => {
        goToQuestion(currentQuestion - 1);
    };

    const handleNextQuestion = () => {
        if (!evaluation) {
            setError("Please submit your answer before continuing.");
            return;
        }

        if (isLastQuestion) {
            navigate(`/interview/${interviewId}/result`);
            return;
        }

        goToQuestion(currentQuestion + 1);
    };

    /* --------------------------------
       EXIT INTERVIEW
    -------------------------------- */

    const handleExitInterview = () => {
        if (evaluating) return;

        navigate("/dashboard");
    };

    /* --------------------------------
       LOADING STATE
    -------------------------------- */

    if (loading) {
        return (
            <PageShell>
                <div className="flex min-h-[75vh] flex-col items-center justify-center px-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.08]">
                        <Loader2
                            size={25}
                            className="animate-spin text-violet-300"
                        />
                    </div>

                    <h2 className="mt-5 text-base font-semibold text-zinc-200">
                        Preparing your interview
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                        Loading your questions and preparing your practice workspace.
                    </p>

                    <div className="mt-6 h-1 w-36 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            animate={{ x: [-144, 144] }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                ease: "easeInOut",
                            }}
                            style={{ width: "50%" }}
                        />
                    </div>
                </div>
            </PageShell>
        );
    }

    /* --------------------------------
       ERROR / EMPTY STATE
    -------------------------------- */

    if (error && !questions.length) {
        return (
            <PageShell>
                <div className="flex min-h-[75vh] items-center justify-center px-5 py-10">
                    <div className="w-full max-w-md rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 text-center sm:p-9">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/10 bg-red-500/[0.06]">
                            <AlertCircle
                                size={24}
                                className="text-red-300"
                            />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold">
                            Unable to load interview
                        </h2>

                        <p className="mt-2 break-words text-sm leading-6 text-zinc-500">
                            {error}
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={() => setRetryCount((count) => count + 1)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium transition hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                            >
                                <RefreshCw size={15} />
                                Try again
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                            >
                                <ArrowLeft size={15} />
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </PageShell>
        );
    }

    if (!questions.length || !question) {
        return (
            <PageShell>
                <div className="flex min-h-[75vh] items-center justify-center px-5">
                    <div className="text-center">
                        <Brain
                            size={30}
                            className="mx-auto text-violet-300"
                        />

                        <h2 className="mt-4 text-lg font-semibold">
                            No questions available
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            This interview does not contain any questions.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                        >
                            <ArrowLeft size={15} />
                            Back to dashboard
                        </button>
                    </div>
                </div>
            </PageShell>
        );
    }

    /* --------------------------------
       MAIN INTERVIEW PAGE
    -------------------------------- */

    return (
        <PageShell>
            <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10 2xl:px-12">
                {/* Page heading */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"
                >
                    <div className="min-w-0">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.08] px-3 py-1.5 text-xs font-medium text-violet-300">
                            <Brain size={14} />
                            AI Interview Session
                        </div>

                        <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                            {interview?.title || "AI Interview"}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                            Take your time, structure your thoughts, and submit each answer to receive personalized AI feedback.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <MetaChip>{interview?.role || "Interview"}</MetaChip>

                            {interview?.difficulty && (
                                <MetaChip>{interview.difficulty}</MetaChip>
                            )}

                            {interview?.interviewType && (
                                <MetaChip>{interview.interviewType}</MetaChip>
                            )}

                            {interview?.experienceLevel && (
                                <MetaChip>{interview.experienceLevel}</MetaChip>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-stretch">
                        <StatCard
                            icon={CheckCircle2}
                            label="Evaluated"
                            value={`${evaluatedCount}/${questions.length}`}
                            color="text-emerald-300"
                        />

                        <StatCard
                            icon={Trophy}
                            label="Average score"
                            value={
                                averageScore === null
                                    ? "—"
                                    : `${averageScore}/10`
                            }
                            color="text-violet-300"
                        />
                    </div>
                </motion.div>

                {/* Progress card */}
                <div className="mb-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-medium text-zinc-400">
                                Your progress
                            </p>
                            <p className="mt-1 text-sm text-zinc-200">
                                Question {currentQuestion + 1}
                                <span className="mx-1.5 text-zinc-600">of</span>
                                {questions.length}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Clock3 size={14} />
                            {evaluatedCount === questions.length
                                ? "All questions evaluated"
                                : `${questions.length - evaluatedCount} questions remaining to evaluate`}
                        </div>
                    </div>

                    <div
                        className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]"
                        role="progressbar"
                        aria-label="Interview question progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress)}
                    >
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            initial={false}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.35 }}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {questions.map((item, index) => {
                            const active = index === currentQuestion;
                            const completed = item.status === "Evaluated";

                            return (
                                <button
                                    type="button"
                                    key={item._id || index}
                                    onClick={() => goToQuestion(index)}
                                    disabled={evaluating}
                                    aria-label={`Go to question ${index + 1}${completed ? ", evaluated" : ""}`}
                                    aria-current={active ? "step" : undefined}
                                    className={`flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-400/30 disabled:cursor-not-allowed disabled:opacity-50 ${active
                                        ? "border-violet-400/30 bg-violet-500/[0.12] text-violet-200"
                                        : completed
                                            ? "border-emerald-400/15 bg-emerald-500/[0.05] text-emerald-300"
                                            : "border-white/[0.07] bg-black/10 text-zinc-500 hover:border-white/[0.14] hover:text-zinc-200"
                                        }`}
                                >
                                    {completed ? (
                                        <Check size={13} />
                                    ) : null}
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Workspace */}
                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.62fr)]">
                    {/* Question and answer */}
                    <motion.section
                        key={question._id || currentQuestion}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] shadow-xl shadow-black/10"
                    >
                        <div className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-violet-300">
                                    <MessageSquareText size={15} />
                                    Question {currentQuestion + 1}
                                </div>

                                {evaluation && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-500/[0.06] px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                                        <CheckCircle2 size={12} />
                                        Evaluated
                                    </span>
                                )}
                            </div>

                            <h2 className="mt-5 break-words text-xl font-medium leading-8 text-white sm:text-2xl sm:leading-9">
                                {question.question}
                            </h2>
                        </div>

                        <div className="p-5 sm:p-7">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <label
                                    htmlFor="interview-answer"
                                    className="text-sm font-medium text-zinc-200"
                                >
                                    Your answer
                                </label>

                                <span className="text-[11px] tabular-nums text-zinc-600">
                                    {answer.length.toLocaleString()} characters
                                </span>
                            </div>

                            <textarea
                                id="interview-answer"
                                value={answer}
                                onChange={(event) => {
                                    setAnswer(event.target.value);
                                    if (error) setError("");
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.ctrlKey &&
                                        event.key === "Enter" &&
                                        !evaluating &&
                                        !evaluation &&
                                        answer.trim()
                                    ) {
                                        event.preventDefault();
                                        handleSubmitAnswer();
                                    }
                                }}
                                placeholder="Write your answer here. Explain your approach, reasoning, and examples where relevant..."
                                rows={11}
                                disabled={evaluating || Boolean(evaluation)}
                                autoComplete="off"
                                className="min-h-[260px] w-full resize-y rounded-xl border border-white/[0.08] bg-black/20 px-4 py-4 text-sm leading-7 text-zinc-200 outline-none transition placeholder:text-zinc-700 hover:border-white/[0.12] focus:border-violet-400/35 focus:bg-black/30 focus:ring-2 focus:ring-violet-500/[0.07] disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-[320px]"
                            />

                            <div className="mt-3 flex flex-col gap-2 text-[11px] leading-5 text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                    Be specific and explain your reasoning.
                                </span>
                                {!evaluation && (
                                    <span className="hidden sm:inline">
                                        Ctrl + Enter to submit
                                    </span>
                                )}
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-400/15 bg-red-500/[0.05] px-4 py-3 text-sm leading-6 text-red-300"
                                >
                                    <CircleAlert
                                        size={16}
                                        className="mt-1 shrink-0"
                                    />
                                    <span className="break-words">{error}</span>
                                </div>
                            )}

                            {evaluating && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className="mt-4 flex items-start gap-3 rounded-xl border border-violet-400/15 bg-violet-500/[0.05] p-4"
                                >
                                    <Loader2
                                        size={18}
                                        className="mt-0.5 shrink-0 animate-spin text-violet-300"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-violet-200">
                                            Evaluating your answer
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            AI is reviewing your response and preparing feedback.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={handlePreviousQuestion}
                                    disabled={currentQuestion === 0 || evaluating}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 text-sm text-zinc-400 transition hover:border-white/[0.15] hover:bg-white/[0.03] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/30 disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                    <ChevronLeft size={17} />
                                    Previous
                                </button>

                                {!evaluation ? (
                                    <button
                                        type="button"
                                        onClick={handleSubmitAnswer}
                                        disabled={!answer.trim() || evaluating}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-400/40 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {evaluating ? (
                                            <>
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                Evaluating...
                                            </>
                                        ) : (
                                            <>
                                                Evaluate answer
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleNextQuestion}
                                        disabled={evaluating}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-400/40 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {isLastQuestion
                                            ? "View results"
                                            : "Next question"}
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.section>

                    {/* Evaluation panel */}
                    <aside className="min-w-0 space-y-5">
                        {evaluation ? (
                            <EvaluationPanel evaluation={evaluation} />
                        ) : (
                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                                    <Sparkles
                                        size={19}
                                        className="text-violet-300"
                                    />
                                </div>

                                <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                                    Your AI feedback
                                </h3>

                                <p className="mt-2 text-xs leading-6 text-zinc-500">
                                    After you submit your answer, your evaluation will appear here.
                                </p>

                                <div className="mt-5 space-y-3">
                                    <PlaceholderRow label="Answer score" />
                                    <PlaceholderRow label="Personalized feedback" />
                                    <PlaceholderRow label="Strengths" />
                                    <PlaceholderRow label="Topics to improve" />
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                            <div className="flex items-center gap-2">
                                <Target
                                    size={16}
                                    className="text-violet-300"
                                />
                                <h3 className="text-sm font-semibold text-zinc-200">
                                    Session overview
                                </h3>
                            </div>

                            <div className="mt-5 space-y-4">
                                <OverviewRow
                                    label="Total questions"
                                    value={questions.length}
                                />
                                <OverviewRow
                                    label="Evaluated answers"
                                    value={evaluatedCount}
                                />
                                <OverviewRow
                                    label="Remaining evaluations"
                                    value={questions.length - evaluatedCount}
                                />
                                <OverviewRow
                                    label="Average score"
                                    value={
                                        averageScore === null
                                            ? "Not available"
                                            : `${averageScore}/10`
                                    }
                                />
                            </div>

                            <div className="mt-5 rounded-xl border border-violet-400/10 bg-violet-500/[0.045] p-3.5">
                                <p className="text-xs leading-5 text-zinc-400">
                                    Review the feedback after each answer to understand what went well and what you can improve.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleExitInterview}
                            disabled={evaluating}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] text-sm text-zinc-500 transition hover:border-white/[0.13] hover:bg-white/[0.025] hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-400/30 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ArrowLeft size={15} />
                            Exit to dashboard
                        </button>
                    </aside>
                </div>
            </main>
        </PageShell>
    );
};

/* =========================================================
   PAGE SHELL
========================================================= */

const PageShell = ({ children }) => {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#05050a] text-white">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-32 top-0 h-[440px] w-[440px] rounded-full bg-violet-500/[0.06] blur-[140px]" />
                <div className="absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full bg-fuchsia-500/[0.045] blur-[140px]" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/[0.035] blur-[130px]" />
            </div>

            <header className="relative z-10 border-b border-white/[0.07] bg-[#05050a]/80 backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10 2xl:px-12">
                    <div className="w-[100px] sm:w-[180px]">
                        <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600 sm:inline">
                            Practice workspace
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-900/20">
                            <Sparkles size={17} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold tracking-tight">
                                Synthex AI
                            </p>
                            <p className="hidden text-[10px] text-zinc-600 sm:block">
                                Interview workspace
                            </p>
                        </div>
                    </div>

                    <div className="flex w-[100px] justify-end sm:w-[180px]">
                        <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] text-zinc-500 sm:inline-flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Session active
                        </span>
                    </div>
                </div>
            </header>

            <div className="relative z-10">{children}</div>
        </div>
    );
};

/* =========================================================
   METADATA CHIP
========================================================= */

const MetaChip = ({ children }) => (
    <span className="inline-flex items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-400">
        {children}
    </span>
);

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="min-w-[135px] rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
        <div className="flex items-center gap-2">
            <Icon size={14} className={color} />
            <p className="text-[11px] text-zinc-500">{label}</p>
        </div>
        <p className={`mt-2 text-xl font-semibold tabular-nums ${color}`}>
            {value}
        </p>
    </div>
);

/* =========================================================
   EVALUATION PANEL
========================================================= */

const EvaluationPanel = ({ evaluation }) => {
    const score = Number(evaluation.score);
    const validScore = Number.isFinite(score)
        ? Math.max(0, Math.min(10, score))
        : 0;

    const scorePercentage = validScore * 10;

    return (
        <div className="space-y-5">
            {/* Score */}
            <section className="rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.08] to-fuchsia-500/[0.035] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-violet-200">
                            <Trophy size={15} />
                            Answer score
                        </div>

                        <div className="mt-3 flex items-baseline gap-1.5">
                            <span className="text-4xl font-semibold tracking-tight text-white">
                                {evaluation.score ?? "—"}
                            </span>
                            <span className="text-sm text-zinc-500">/10</span>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-zinc-500">
                            AI evaluation for this answer
                        </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.1]">
                        <CheckCircle2
                            size={25}
                            className="text-violet-300"
                        />
                    </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/25">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${scorePercentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                </div>
            </section>

            {/* Feedback */}
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                <div className="flex items-center gap-2">
                    <MessageSquareText
                        size={16}
                        className="text-violet-300"
                    />
                    <h3 className="text-sm font-semibold text-zinc-200">
                        AI feedback
                    </h3>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
                    {evaluation.feedback || "No feedback was provided."}
                </p>
            </section>

            {/* Strengths */}
            {evaluation.strengths?.length > 0 && (
                <section className="rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.025] p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                        <CheckCircle2
                            size={16}
                            className="text-emerald-300"
                        />
                        <h3 className="text-sm font-semibold text-zinc-200">
                            Strengths
                        </h3>
                        <span className="ml-auto rounded-md border border-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">
                            {evaluation.strengths.length}
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        {evaluation.strengths.map((strength, index) => (
                            <div
                                key={`${strength}-${index}`}
                                className="flex items-start gap-2.5 text-sm leading-6 text-zinc-400"
                            >
                                <Check
                                    size={15}
                                    className="mt-1 shrink-0 text-emerald-300"
                                />
                                <span className="break-words">{strength}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Weak topics */}
            {evaluation.weakTopics?.length > 0 && (
                <section className="rounded-2xl border border-fuchsia-400/10 bg-fuchsia-500/[0.025] p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                        <Target size={16} className="text-fuchsia-300" />
                        <h3 className="text-sm font-semibold text-zinc-200">
                            Topics to improve
                        </h3>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {evaluation.weakTopics.map((topic, index) => (
                            <span
                                key={`${topic}-${index}`}
                                className="max-w-full break-words rounded-lg border border-fuchsia-400/10 bg-fuchsia-500/[0.05] px-3 py-2 text-xs leading-5 text-fuchsia-200"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

/* =========================================================
   PLACEHOLDER ROW
========================================================= */

const PlaceholderRow = ({ label }) => (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-black/10 px-3 py-3">
        <div className="h-7 w-7 shrink-0 rounded-lg border border-white/[0.05] bg-white/[0.025]" />
        <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-500">{label}</p>
            <div className="mt-2 h-1.5 w-2/3 rounded-full bg-white/[0.04]" />
        </div>
    </div>
);

/* =========================================================
   OVERVIEW ROW
========================================================= */

const OverviewRow = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="break-words text-right text-xs font-medium text-zinc-200">
            {value}
        </span>
    </div>
);

export default InterviewSession;
