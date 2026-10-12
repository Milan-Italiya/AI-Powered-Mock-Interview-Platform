import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Brain,
    CheckCircle2,
    Sparkles,
    Target,
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

    /* --------------------------------
       Load Interview
    -------------------------------- */

    useEffect(() => {
        const loadInterview = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getInterviewById(interviewId);

                const interviewData = response?.data?.interview;
                const questionsData = response?.data?.questions || [];

                setInterview(interviewData);
                setQuestions(questionsData);

                if (!interviewData || questionsData.length === 0) {
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
        };

        if (interviewId) {
            loadInterview();
        }
    }, [interviewId]);

    /* --------------------------------
       Current Question
    -------------------------------- */

    const question = questions[currentQuestion];

    const isLastQuestion =
        currentQuestion === questions.length - 1;

    const progress = useMemo(() => {
        if (!questions.length) {
            return 0;
        }

        return ((currentQuestion + 1) / questions.length) * 100;
    }, [currentQuestion, questions.length]);

    /* --------------------------------
       Submit Answer
    -------------------------------- */

    const handleSubmitAnswer = async () => {
        const trimmedAnswer = answer.trim();

        if (!trimmedAnswer) {
            setError("Please enter an answer before submitting.");

            toast.warning("Answer required", {
                description:
                    "Please enter your answer before submitting.",
            });

            return;
        }

        if (!question?._id) {
            setError("Question information is unavailable.");

            toast.error("Question unavailable", {
                description:
                    "Unable to identify the current question.",
            });

            return;
        }

        if (evaluating) {
            return;
        }

        try {
            setEvaluating(true);
            setError("");

            const response = await evaluateAnswer(
                question._id,
                trimmedAnswer
            );

            const evaluatedQuestion =
                response?.data?.question;

            if (!evaluatedQuestion) {
                throw new Error(
                    "Invalid evaluation response from server."
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

            toast.success("Answer evaluated", {
                description:
                    "Your answer has been evaluated successfully.",
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
       Next Question
    -------------------------------- */

    const handleNextQuestion = () => {
        if (isLastQuestion) {
            navigate(`/interview/${interviewId}/result`);
            return;
        }

        const nextQuestionIndex = currentQuestion + 1;
        const nextQuestion = questions[nextQuestionIndex];

        setCurrentQuestion(nextQuestionIndex);

        if (nextQuestion?.status === "Evaluated") {
            setEvaluation(nextQuestion);
            setAnswer(nextQuestion.answer || "");
        } else {
            setEvaluation(null);
            setAnswer("");
        }

        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /* --------------------------------
       Exit Interview
    -------------------------------- */

    const handleExitInterview = () => {
        if (evaluating) {
            return;
        }

        navigate("/dashboard");
    };

    /* --------------------------------
       Loading State
    -------------------------------- */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#05050a] px-6 text-white">
                <div className="flex flex-col items-center text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-500/[0.08]">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-zinc-300">
                        Loading interview...
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                        Preparing your AI interview session
                    </p>

                </div>
            </div>
        );
    }

    /* --------------------------------
       Error State
    -------------------------------- */

    if (error && !questions.length) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#05050a] px-6 text-white">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/10 bg-red-500/[0.06]">
                    <AlertCircle
                        size={22}
                        className="text-red-400"
                    />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                    Unable to load interview
                </h2>

                <p className="mt-2 max-w-md text-center text-sm leading-6 text-zinc-500">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-zinc-400 transition hover:border-white/[0.12] hover:bg-white/[0.03] hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>

            </div>
        );
    }

    /* --------------------------------
       Empty State
    -------------------------------- */

    if (!questions.length) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#05050a] px-6 text-white">

                <div className="text-center">

                    <Brain
                        size={28}
                        className="mx-auto text-violet-400"
                    />

                    <h2 className="mt-4 text-lg font-semibold">
                        No questions available
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                        This interview does not contain any questions.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="mt-6 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-zinc-400 transition hover:border-white/[0.12] hover:bg-white/[0.03] hover:text-white"
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05050a] text-white">

            {/* Background Glow */}

            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-violet-600/[0.05] blur-3xl" />

                <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-fuchsia-600/[0.04] blur-3xl" />
            </div>

            {/* Header */}

            <header className="flex h-20 items-center border-b border-white/[0.07] px-6 lg:px-10">

                <button
                    type="button"
                    onClick={handleExitInterview}
                    disabled={evaluating}
                    className="group flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ArrowLeft
                        size={17}
                        className="transition-transform duration-200 group-hover:-translate-x-1"
                    />

                    Exit Interview
                </button>

                <div className="mx-auto flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-900/20">
                        <Sparkles size={15} />
                    </div>

                    <span className="text-sm font-semibold">
                        Synthex AI
                    </span>

                </div>

                <div className="w-[108px]" />

            </header>

            {/* Main */}

            <main className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:py-14">

                {/* Interview Information */}

                <div className="mb-8">

                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
                        <Brain size={13} />
                        AI Interview
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {interview?.title || "AI Interview"}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">

                        <span>
                            {interview?.role || "Interview"}
                        </span>

                        {interview?.difficulty && (
                            <>
                                <span className="text-zinc-700">
                                    •
                                </span>

                                <span>
                                    {interview.difficulty}
                                </span>
                            </>
                        )}

                        {interview?.interviewType && (
                            <>
                                <span className="text-zinc-700">
                                    •
                                </span>

                                <span>
                                    {interview.interviewType}
                                </span>
                            </>
                        )}

                    </div>

                </div>

                {/* Progress */}

                <div className="mb-8">

                    <div className="mb-3 flex items-center justify-between text-xs">

                        <span className="text-zinc-500">
                            Question {currentQuestion + 1} of{" "}
                            {questions.length}
                        </span>

                        <span className="font-medium text-violet-400">
                            {Math.round(progress)}%
                        </span>

                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                            }}
                        />

                    </div>

                </div>

                {/* Question Card */}

                <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6 lg:p-8">

                    {/* Question Header */}

                    <div className="flex items-center justify-between gap-4">

                        <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
                            Question {currentQuestion + 1}
                        </p>

                        {evaluation && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-500/[0.06] px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                                <CheckCircle2 size={12} />
                                Evaluated
                            </span>
                        )}

                    </div>

                    {/* Question */}

                    <h2 className="mt-4 text-xl font-medium leading-8 text-white sm:text-2xl">
                        {question?.question}
                    </h2>

                    {/* Answer */}

                    {!evaluation && (
                        <div className="mt-8">

                            <div className="mb-2 flex items-center justify-between">

                                <label
                                    htmlFor="answer"
                                    className="text-xs font-medium text-zinc-500"
                                >
                                    Your Answer
                                </label>

                                <span className="text-[11px] text-zinc-700">
                                    {answer.length} characters
                                </span>

                            </div>

                            <textarea
                                id="answer"
                                value={answer}
                                onChange={(event) => {
                                    setAnswer(event.target.value);

                                    if (error) {
                                        setError("");
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.ctrlKey &&
                                        event.key === "Enter"
                                    ) {
                                        event.preventDefault();

                                        if (
                                            answer.trim() &&
                                            !evaluating
                                        ) {
                                            handleSubmitAnswer();
                                        }
                                    }
                                }}
                                placeholder="Type your answer here..."
                                rows={8}
                                disabled={evaluating}
                                autoComplete="off"
                                className="w-full resize-none rounded-xl border border-white/[0.07] bg-black/20 px-4 py-4 text-sm leading-6 text-white outline-none transition-all duration-200 placeholder:text-zinc-700 focus:border-violet-400/30 focus:bg-black/30 focus:ring-2 focus:ring-violet-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <div className="mt-2 flex justify-between text-[11px] text-zinc-700">

                                <span>
                                    Answer clearly and explain your reasoning where relevant.
                                </span>

                                <span className="hidden sm:block">
                                    Ctrl + Enter to submit
                                </span>

                            </div>

                            {/* Error */}

                            {error && (
                                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/10 bg-red-500/[0.05] px-4 py-3 text-sm text-red-300">

                                    <AlertCircle
                                        size={16}
                                        className="mt-0.5 shrink-0"
                                    />

                                    <span>
                                        {error}
                                    </span>

                                </div>
                            )}

                            {/* Submit */}

                            <div className="mt-5 flex justify-end">

                                <button
                                    type="button"
                                    onClick={handleSubmitAnswer}
                                    disabled={
                                        !answer.trim() ||
                                        evaluating
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-medium shadow-lg shadow-violet-900/20 transition-all duration-200 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-900/30 disabled:cursor-not-allowed disabled:opacity-40"
                                >

                                    {evaluating ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Evaluating...
                                        </>
                                    ) : (
                                        <>
                                            Submit Answer
                                            <ArrowRight size={17} />
                                        </>
                                    )}

                                </button>

                            </div>

                        </div>
                    )}

                    {/* Evaluation */}

                    {evaluation && (
                        <div className="mt-8 space-y-5">

                            {/* Score */}

                            <div className="rounded-xl border border-violet-400/10 bg-violet-500/[0.05] p-5">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-xs text-zinc-500">
                                            Your Score
                                        </p>

                                        <div className="mt-1 flex items-baseline gap-1">

                                            <p className="text-3xl font-semibold text-violet-300">
                                                {evaluation.score}
                                            </p>

                                            <span className="text-base text-zinc-600">
                                                /10
                                            </span>

                                        </div>

                                    </div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                                        <CheckCircle2
                                            size={26}
                                            className="text-violet-400"
                                        />
                                    </div>

                                </div>

                            </div>

                            {/* Feedback */}

                            <div className="rounded-xl border border-white/[0.07] bg-black/10 p-5">

                                <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                                    AI Feedback
                                </p>

                                <p className="mt-3 text-sm leading-6 text-zinc-300">
                                    {evaluation.feedback ||
                                        "No feedback was provided."}
                                </p>

                            </div>

                            {/* Strengths */}

                            {evaluation.strengths?.length > 0 && (
                                <div className="rounded-xl border border-white/[0.07] bg-black/10 p-5">

                                    <div className="flex items-center gap-2">

                                        <CheckCircle2
                                            size={16}
                                            className="text-emerald-400"
                                        />

                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                                            Strengths
                                        </p>

                                    </div>

                                    <div className="mt-4 space-y-2.5">

                                        {evaluation.strengths.map(
                                            (strength, index) => (
                                                <div
                                                    key={`${strength}-${index}`}
                                                    className="flex gap-2 text-sm leading-6 text-zinc-300"
                                                >
                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />

                                                    <span>
                                                        {strength}
                                                    </span>
                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* Weak Topics */}

                            {evaluation.weakTopics?.length > 0 && (
                                <div className="rounded-xl border border-white/[0.07] bg-black/10 p-5">

                                    <div className="flex items-center gap-2">

                                        <Target
                                            size={16}
                                            className="text-fuchsia-400"
                                        />

                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                                            Weak Topics
                                        </p>

                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">

                                        {evaluation.weakTopics.map(
                                            (topic, index) => (
                                                <span
                                                    key={`${topic}-${index}`}
                                                    className="rounded-lg border border-fuchsia-400/10 bg-fuchsia-500/[0.05] px-3 py-1.5 text-xs text-fuchsia-300"
                                                >
                                                    {topic}
                                                </span>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* Next */}

                            <div className="flex justify-end pt-2">

                                <button
                                    type="button"
                                    onClick={handleNextQuestion}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-medium shadow-lg shadow-violet-900/20 transition-all duration-200 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-900/30"
                                >

                                    {isLastQuestion
                                        ? "Finish Interview"
                                        : "Next Question"}

                                    <ArrowRight size={17} />

                                </button>

                            </div>

                        </div>
                    )}

                </section>

            </main>
        </div>
    );
};

export default InterviewSession;