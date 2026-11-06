import { motion } from "motion/react";
import {
    Brain,
    CheckCircle2,
    Target,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";

const PerformanceOverview = ({
    evaluatedInterviews = [],
    averageScore = null,
    strongTopics = [],
    weakTopics = [],
    latestFeedback = "",
}) => {
    if (evaluatedInterviews.length === 0) {
        return (
            <motion.div
                initial={{
                    opacity: 0,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="rounded-2xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.07] via-white/[0.02] to-fuchsia-500/[0.04] p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                        <Brain
                            size={20}
                            className="text-violet-400"
                        />
                    </div>

                    <div>
                        <h3 className="font-medium">
                            AI Performance Analysis
                        </h3>

                        <p className="mt-1 text-xs text-zinc-600">
                            Your personalized AI analysis
                        </p>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/20 p-5">
                    <div className="flex items-center gap-3">
                        <Target
                            size={18}
                            className="text-violet-400"
                        />

                        <p className="text-sm text-zinc-400">
                            Complete your first interview to unlock
                            your AI performance analysis.
                        </p>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-600">
                        Synthex AI will analyze your answers,
                        identify strong and weak topics,
                        calculate your performance score,
                        and generate personalized improvement
                        insights.
                    </p>
                </div>
            </motion.div>
        );
    }

    // Convert score from /10 to percentage
    const scorePercentage =
        typeof averageScore === "number"
            ? Math.min(
                  100,
                  Math.max(
                      0,
                      Math.round((averageScore / 10) * 100)
                  )
              )
            : 0;

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
        >
            {/* Header */}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.08]">
                        <Brain
                            size={18}
                            className="text-violet-400"
                        />
                    </div>

                    <div>
                        <h3 className="font-medium">
                            AI Performance Overview
                        </h3>

                        <p className="mt-1 text-xs text-zinc-600">
                            Based on your completed interviews
                        </p>
                    </div>
                </div>

                <TrendingUp
                    size={18}
                    className="text-emerald-400"
                />
            </div>

            {/* Score */}

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/20 p-5">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs text-zinc-600">
                            Overall Score
                        </p>

                        <p className="mt-2 text-4xl font-semibold tracking-tight">
                            {typeof averageScore === "number"
                                ? averageScore
                                : "—"}

                            <span className="text-lg text-zinc-600">
                                /10
                            </span>
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-zinc-600">
                            Evaluated
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                            {evaluatedInterviews.length} interview
                            {evaluatedInterviews.length > 1
                                ? "s"
                                : ""}
                        </p>
                    </div>
                </div>

                {/* Score Progress */}

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                        initial={{
                            width: 0,
                        }}
                        animate={{
                            width: `${scorePercentage}%`,
                        }}
                        transition={{
                            duration: 1,
                            ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    />
                </div>

                <div className="mt-2 flex justify-between text-[10px] text-zinc-700">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                </div>
            </div>

            {/* Topics */}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Strong Topics */}

                <div className="rounded-xl border border-emerald-400/10 bg-emerald-500/[0.03] p-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2
                            size={16}
                            className="text-emerald-400"
                        />

                        <p className="text-xs font-medium text-zinc-300">
                            Strong Topics
                        </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {strongTopics.length > 0 ? (
                            strongTopics.map((topic, index) => (
                                <span
                                    key={`${topic}-${index}`}
                                    className="rounded-lg border border-emerald-400/10 bg-emerald-500/[0.06] px-2.5 py-1.5 text-[11px] text-emerald-300"
                                >
                                    {topic}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-zinc-600">
                                No strong topics detected.
                            </span>
                        )}
                    </div>
                </div>

                {/* Weak Topics */}

                <div className="rounded-xl border border-amber-400/10 bg-amber-500/[0.03] p-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle
                            size={16}
                            className="text-amber-400"
                        />

                        <p className="text-xs font-medium text-zinc-300">
                            Weak Topics
                        </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {weakTopics.length > 0 ? (
                            weakTopics.map((topic, index) => (
                                <span
                                    key={`${topic}-${index}`}
                                    className="rounded-lg border border-amber-400/10 bg-amber-500/[0.06] px-2.5 py-1.5 text-[11px] text-amber-300"
                                >
                                    {topic}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-zinc-600">
                                No weak topics detected.
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Feedback */}

            {latestFeedback && (
                <div className="mt-4 rounded-xl border border-violet-400/10 bg-violet-500/[0.04] p-4">
                    <p className="text-xs font-medium text-violet-300">
                        AI Insight
                    </p>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {latestFeedback}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default PerformanceOverview;