
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    ArrowLeft,
    ArrowRight,
    Brain,
    Check,
    Code2,
    Layers3,
    Loader2,
    Sparkles,
    X,
    BriefcaseBusiness,
    SlidersHorizontal,
    CircleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createInterview } from "../../usecase/interview.usecase";

const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Java Developer",
    "Python Developer",
    "Data Analyst",
    "DevOps Engineer",
    "UI/UX Designer",
];

const interviewTypes = [
    "Technical",
    "HR",
    "Behavioral",
    "Mixed",
];

const difficulties = ["Easy", "Medium", "Hard"];

const experienceLevels = [
    "Student",
    "Fresher",
    "1-2 years",
    "3-5 years",
    "5+ years",
];

const technologies = [
    "React.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Java",
    "Spring Boot",
    "Python",
    "Django",
    "SQL",
    "JavaScript",
    "HTML",
    "CSS",
];

const CreateInterview = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        role: "",
        interviewType: "",
        difficulty: "",
        experienceLevel: "",
        technologies: [],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const selectedTechnologyCount = formData.technologies.length;

    const canSubmit = useMemo(
        () =>
            formData.title.trim().length >= 3 &&
            formData.role &&
            formData.interviewType &&
            formData.difficulty &&
            formData.experienceLevel &&
            selectedTechnologyCount > 0 &&
            !loading,
        [formData, selectedTechnologyCount, loading]
    );

    const handleFieldChange = (field, value) => {
        setError("");
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleTechnologyToggle = (technology) => {
        setError("");

        setFormData((previous) => {
            const isSelected =
                previous.technologies.includes(technology);

            return {
                ...previous,
                technologies: isSelected
                    ? previous.technologies.filter(
                          (item) => item !== technology
                      )
                    : [...previous.technologies, technology],
            };
        });
    };

    const handleClearTechnologies = () => {
        setFormData((previous) => ({
            ...previous,
            technologies: [],
        }));
        setError("");
    };

    const validateForm = () => {
        const title = formData.title.trim();

        if (!title) {
            return "Please enter an interview title.";
        }

        if (title.length < 3) {
            return "Interview title must be at least 3 characters.";
        }

        if (!formData.role) {
            return "Please select a target role.";
        }

        if (!formData.interviewType) {
            return "Please select an interview type.";
        }

        if (!formData.difficulty) {
            return "Please select a difficulty.";
        }

        if (!formData.experienceLevel) {
            return "Please select your experience level.";
        }

        if (formData.technologies.length === 0) {
            return "Please select at least one technology.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const interviewData = {
                title: formData.title.trim(),
                role: formData.role,
                interviewType: formData.interviewType,
                difficulty: formData.difficulty,
                experienceLevel: formData.experienceLevel,
                technologies: formData.technologies,
            };

            const response = await createInterview(interviewData);

            const interviewId =
                response?.data?.interview?._id ||
                response?.interview?._id ||
                response?.data?._id ||
                response?._id;

            if (!interviewId) {
                throw new Error(
                    "Interview was created, but the interview ID was not returned."
                );
            }

            navigate(`/interview/${interviewId}`);
        } catch (error) {
            console.error("Create Interview Error:", error);
            console.error("Backend Error:", error?.response?.data);

            setError(
                error?.response?.data?.message ||
                    error?.message ||
                    "Failed to create interview. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#05050a] text-white">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
                <div className="absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full bg-fuchsia-500/[0.05] blur-[140px]" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/[0.04] blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/[0.07] bg-[#05050a]/80 backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10 2xl:px-12">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                    >
                        <ArrowLeft
                            size={17}
                            className="transition-transform group-hover:-translate-x-1"
                        />
                        <span className="hidden sm:inline">
                            Back to dashboard
                        </span>
                        <span className="sm:hidden">Dashboard</span>
                    </button>

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

                    <div className="w-9 sm:w-32" />
                </div>
            </header>

            <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 2xl:px-12">
                {/* Page heading */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-end lg:justify-between"
                >
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.08] px-3 py-1.5 text-xs font-medium text-violet-300">
                            <Brain size={14} />
                            AI Interview Setup
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px]">
                            Create your interview
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-[15px]">
                            Build a personalized practice session tailored
                            to your career goals, experience, and
                            technologies.
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.09]">
                            <Sparkles size={18} className="text-violet-300" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-200">
                                Personalized practice
                            </p>
                            <p className="mt-1 text-[11px] text-zinc-600">
                                Generated with AI
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06, duration: 0.4 }}
                    className="space-y-6"
                >
                    {/* Details and target role */}
                    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                        <FormSection
                            icon={Layers3}
                            title="Interview details"
                            description="Give your practice session a recognizable name."
                            number="01"
                        >
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="interview-title"
                                        className="text-xs font-medium text-zinc-400"
                                    >
                                        Interview title
                                    </label>
                                    <span className="text-[11px] tabular-nums text-zinc-600">
                                        {formData.title.length}/80
                                    </span>
                                </div>

                                <input
                                    id="interview-title"
                                    type="text"
                                    maxLength={80}
                                    minLength={3}
                                    autoComplete="off"
                                    placeholder="e.g. Full Stack Mock Interview"
                                    value={formData.title}
                                    onChange={(event) =>
                                        handleFieldChange(
                                            "title",
                                            event.target.value
                                        )
                                    }
                                    aria-invalid={
                                        Boolean(error) &&
                                        formData.title.trim().length < 3
                                    }
                                    className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 hover:border-white/[0.13] focus:border-violet-400/40 focus:bg-black/30 focus:ring-2 focus:ring-violet-400/[0.08]"
                                />

                                <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                                    Choose a title that helps you identify
                                    this session later.
                                </p>
                            </div>

                            <div className="mt-6 rounded-xl border border-white/[0.05] bg-black/15 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-lg bg-violet-500/[0.08] p-2">
                                        <Brain
                                            size={16}
                                            className="text-violet-300"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-zinc-300">
                                            Your interview, your goals
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                                            Your choices help configure a
                                            practice session that matches
                                            the role you want to prepare for.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection
                            icon={BriefcaseBusiness}
                            title="Target role"
                            description="Select the position you are preparing for."
                            number="02"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                {roles.map((role) => {
                                    const selected = formData.role === role;

                                    return (
                                        <motion.button
                                            type="button"
                                            key={role}
                                            onClick={() =>
                                                handleFieldChange("role", role)
                                            }
                                            whileTap={{ scale: 0.985 }}
                                            aria-pressed={selected}
                                            className={`group flex min-h-[54px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-400/30 ${
                                                selected
                                                    ? "border-violet-400/35 bg-violet-500/[0.09] text-violet-200"
                                                    : "border-white/[0.06] bg-black/10 text-zinc-400 hover:border-white/[0.14] hover:bg-white/[0.025] hover:text-white"
                                            }`}
                                        >
                                            <span>{role}</span>
                                            <span
                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                                                    selected
                                                        ? "border-violet-400/40 bg-violet-500/20 text-violet-300"
                                                        : "border-white/[0.1] text-transparent group-hover:border-white/20"
                                                }`}
                                            >
                                                <Check size={12} />
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </FormSection>
                    </div>

                    {/* Interview configuration */}
                    <FormSection
                        icon={SlidersHorizontal}
                        title="Interview configuration"
                        description="Choose the interview format, challenge level, and experience range."
                        number="03"
                    >
                        <div className="grid gap-6 lg:grid-cols-3">
                            <SelectionGroup
                                label="Interview type"
                                description="What kind of questions?"
                                options={interviewTypes}
                                value={formData.interviewType}
                                onChange={(value) =>
                                    handleFieldChange("interviewType", value)
                                }
                            />

                            <SelectionGroup
                                label="Difficulty"
                                description="Choose your challenge level."
                                options={difficulties}
                                value={formData.difficulty}
                                onChange={(value) =>
                                    handleFieldChange("difficulty", value)
                                }
                            />

                            <SelectionGroup
                                label="Experience level"
                                description="Match your current stage."
                                options={experienceLevels}
                                value={formData.experienceLevel}
                                onChange={(value) =>
                                    handleFieldChange("experienceLevel", value)
                                }
                            />
                        </div>
                    </FormSection>

                    {/* Technologies */}
                    <FormSection
                        icon={Code2}
                        title="Technologies"
                        description="Select the technologies you want to practice during this interview."
                        number="04"
                        trailing={
                            <div className="flex items-center gap-3">
                                <span
                                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
                                        selectedTechnologyCount > 0
                                            ? "border-violet-400/15 bg-violet-500/[0.08] text-violet-300"
                                            : "border-white/[0.07] text-zinc-500"
                                    }`}
                                >
                                    {selectedTechnologyCount} selected
                                </span>

                                {selectedTechnologyCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearTechnologies}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                                    >
                                        <X size={13} />
                                        Clear
                                    </button>
                                )}
                            </div>
                        }
                    >
                        <div className="flex flex-wrap gap-2.5">
                            {technologies.map((technology) => {
                                const selected =
                                    formData.technologies.includes(technology);

                                return (
                                    <motion.button
                                        type="button"
                                        key={technology}
                                        onClick={() =>
                                            handleTechnologyToggle(technology)
                                        }
                                        whileTap={{ scale: 0.96 }}
                                        aria-pressed={selected}
                                        className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-violet-400/30 ${
                                            selected
                                                ? "border-violet-400/30 bg-violet-500/[0.09] text-violet-200"
                                                : "border-white/[0.07] bg-black/10 text-zinc-400 hover:border-white/[0.14] hover:bg-white/[0.025] hover:text-white"
                                        }`}
                                    >
                                        {selected ? (
                                            <Check
                                                size={14}
                                                className="text-violet-300"
                                            />
                                        ) : (
                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                                        )}
                                        {technology}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="mt-5 flex flex-col gap-2 border-t border-white/[0.05] pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-5 text-zinc-600">
                                Select at least one technology to continue.
                            </p>

                            {selectedTechnologyCount > 0 && (
                                <p className="text-xs text-zinc-400">
                                    Ready to practice{" "}
                                    <span className="font-medium text-violet-300">
                                        {selectedTechnologyCount}{" "}
                                        {selectedTechnologyCount === 1
                                            ? "technology"
                                            : "technologies"}
                                    </span>
                                </p>
                            )}
                        </div>
                    </FormSection>

                    {/* Submit area */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                role="alert"
                                className="mb-4 flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-500/[0.06] px-4 py-3.5 text-sm leading-5 text-red-300"
                            >
                                <CircleAlert
                                    size={17}
                                    className="mt-0.5 shrink-0"
                                />
                                <span className="min-w-0 break-words">
                                    {error}
                                </span>
                            </motion.div>
                        )}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.07]">
                                    <Sparkles
                                        size={16}
                                        className="text-violet-300"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">
                                        Ready to get started?
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                                        Create your session to begin
                                        personalized interview practice.
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={!canSubmit}
                                whileHover={
                                    canSubmit ? { scale: 1.015 } : undefined
                                }
                                whileTap={
                                    canSubmit ? { scale: 0.985 } : undefined
                                }
                                className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition-all hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:ring-offset-2 focus:ring-offset-[#08080d] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[210px]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Creating interview...
                                    </>
                                ) : (
                                    <>
                                        Create interview
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.form>
            </main>
        </div>
    );
};

/* =========================================================
   FORM SECTION
========================================================= */

const FormSection = ({
    icon: Icon,
    title,
    description,
    number,
    trailing,
    children,
}) => {
    return (
        <section className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 shadow-[0_8px_35px_rgba(0,0,0,0.08)] sm:p-6 lg:p-7">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                        <Icon size={18} className="text-violet-300" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold text-zinc-100 sm:text-[15px]">
                                {title}
                            </h2>
                            <span className="rounded-md border border-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-zinc-600">
                                {number}
                            </span>
                        </div>
                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-zinc-500">
                            {description}
                        </p>
                    </div>
                </div>

                {trailing && (
                    <div className="flex shrink-0 items-center">
                        {trailing}
                    </div>
                )}
            </div>

            {children}
        </section>
    );
};

/* =========================================================
   SELECTION GROUP
========================================================= */

const SelectionGroup = ({
    label,
    description,
    options,
    value,
    onChange,
}) => {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-300">
                {label}
            </p>
            <p className="mt-1 text-[11px] text-zinc-600">
                {description}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col">
                {options.map((option) => {
                    const selected = value === option;

                    return (
                        <motion.button
                            type="button"
                            key={option}
                            onClick={() => onChange(option)}
                            whileTap={{ scale: 0.985 }}
                            aria-pressed={selected}
                            className={`flex min-h-10 flex-1 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition-all focus:outline-none focus:ring-2 focus:ring-violet-400/30 lg:flex-none ${
                                selected
                                    ? "border-violet-400/30 bg-violet-500/[0.08] text-violet-200"
                                    : "border-white/[0.06] bg-black/10 text-zinc-400 hover:border-white/[0.13] hover:bg-white/[0.025] hover:text-white"
                            }`}
                        >
                            <span>{option}</span>

                            {selected && (
                                <Check
                                    size={14}
                                    className="shrink-0 text-violet-300"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default CreateInterview;
