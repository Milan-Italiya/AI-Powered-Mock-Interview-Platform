import { motion } from "motion/react";
import {
    ArrowRight,
    Clock3,
    Code2,
    Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentInterviewCard = ({ interview }) => {
    const navigate = useNavigate();

    const isCompleted =
        interview.status === "Completed" ||
        interview.status === "completed";

    const handleInterviewAction = () => {
        if (isCompleted) {
            navigate(`/interview/${interview._id}/result`);
        } else {
            navigate(`/interview/${interview._id}`);
        }
    };

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
            whileHover={{
                y: -2,
            }}
            className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:border-violet-400/15 hover:bg-white/[0.035]"
        >
            <div className="flex items-start justify-between gap-4">

                {/* Left */}
                <div className="flex min-w-0 items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                        <Sparkles
                            size={19}
                            className="text-violet-400"
                        />
                    </div>

                    <div className="min-w-0">

                        <h4 className="truncate text-sm font-medium text-white">
                            {interview.title}
                        </h4>

                        <p className="mt-1 text-xs text-zinc-500">
                            {interview.role}
                        </p>

                    </div>

                </div>

                {/* Action Button */}
                <button
                    onClick={handleInterviewAction}
                    title={
                        isCompleted
                            ? "View Interview Result"
                            : "Continue Interview"
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-600 transition-all group-hover:border-violet-400/15 group-hover:text-violet-400"
                >
                    <ArrowRight size={15} />
                </button>

            </div>

            {/* Technologies */}

            {interview.technologies?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">

                    {interview.technologies.map(
                        (technology) => (
                            <span
                                key={technology}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[11px] text-zinc-500"
                            >
                                <Code2 size={11} />

                                {technology}
                            </span>
                        )
                    )}

                </div>
            )}

            {/* Bottom metadata */}

            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px]">

                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-zinc-500">
                    {interview.interviewType}
                </span>

                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-zinc-500">
                    {interview.difficulty}
                </span>

                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-zinc-500">
                    {interview.experienceLevel}
                </span>

                <span
                    className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${
                        isCompleted
                            ? "border border-emerald-400/10 bg-emerald-500/[0.08] text-emerald-400"
                            : "border border-amber-400/10 bg-amber-500/[0.08] text-amber-400"
                    }`}
                >
                    <Clock3 size={11} />

                    {isCompleted
                        ? "Completed"
                        : interview.status}

                </span>

            </div>

            {/* Action Text */}

            <div className="mt-4 flex justify-end">

                <button
                    onClick={handleInterviewAction}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        isCompleted
                            ? "text-violet-400 hover:text-violet-300"
                            : "text-amber-400 hover:text-amber-300"
                    }`}
                >
                    {isCompleted
                        ? "View Result"
                        : "Continue Interview"}

                    <ArrowRight size={13} />

                </button>

            </div>

        </motion.div>
    );
};

export default RecentInterviewCard;