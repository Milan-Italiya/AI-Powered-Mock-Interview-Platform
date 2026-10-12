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

const difficulties = [
    "Easy",
    "Medium",
    "Hard",
];

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

    /* =========================================================
       DERIVED STATE
    ========================================================= */

    const selectedTechnologyCount =
        formData.technologies.length;

    const canSubmit = useMemo(() => {
        return (
            formData.title.trim().length >= 3 &&
            formData.role &&
            formData.interviewType &&
            formData.difficulty &&
            formData.experienceLevel &&
            formData.technologies.length > 0 &&
            !loading
        );
    }, [formData, loading]);

    /* =========================================================
       HANDLE FIELD CHANGE
    ========================================================= */

    const handleFieldChange = (field, value) => {
        setError("");

        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    /* =========================================================
       TECHNOLOGY TOGGLE
    ========================================================= */

    const handleTechnologyToggle = (technology) => {
        setError("");

        setFormData((previous) => {
            const isSelected =
                previous.technologies.includes(
                    technology
                );

            return {
                ...previous,
                technologies: isSelected
                    ? previous.technologies.filter(
                          (item) =>
                              item !== technology
                      )
                    : [
                          ...previous.technologies,
                          technology,
                      ],
            };
        });
    };

    /* =========================================================
       CLEAR TECHNOLOGIES
    ========================================================= */

    const handleClearTechnologies = () => {
        setFormData((previous) => ({
            ...previous,
            technologies: [],
        }));

        setError("");
    };

    /* =========================================================
       VALIDATION
    ========================================================= */

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

        if (
            formData.technologies.length === 0
        ) {
            return "Please select at least one technology.";
        }

        return "";
    };

    /* =========================================================
       SUBMIT
    ========================================================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setError("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const interviewData = {
                title: formData.title.trim(),
                role: formData.role,
                interviewType:
                    formData.interviewType,
                difficulty: formData.difficulty,
                experienceLevel:
                    formData.experienceLevel,
                technologies:
                    formData.technologies,
            };

            const response =
                await createInterview(
                    interviewData
                );

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

            navigate(
                `/interview/${interviewId}`
            );
        } catch (error) {
            console.error(
                "Create Interview Error:",
                error
            );

            console.error(
                "Backend Error:",
                error?.response?.data
            );

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
        <div className="min-h-screen bg-[#05050a] text-white">
            {/* =====================================================
                BACKGROUND
            ===================================================== */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-violet-500/[0.06] blur-[120px]" />

                <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-fuchsia-500/[0.05] blur-[120px]" />
            </div>

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="relative z-10 flex h-20 items-center border-b border-white/[0.07] px-4 sm:px-6 lg:px-10">
                <button
                    type="button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                    className="
                        group
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        px-2
                        py-2
                        text-sm
                        text-zinc-500
                        transition-colors
                        hover:bg-white/[0.03]
                        hover:text-white
                        focus:outline-none
                        focus:ring-1
                        focus:ring-violet-400/30
                    "
                >
                    <ArrowLeft
                        size={17}
                        className="
                            transition-transform
                            duration-200
                            group-hover:-translate-x-1
                        "
                    />

                    Dashboard
                </button>

                <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-900/20">
                        <Sparkles size={15} />
                    </div>

                    <span className="hidden text-sm font-semibold sm:block">
                        Synthex AI
                    </span>
                </div>

                <div className="ml-auto w-20" />
            </header>

            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
                {/* =================================================
                    HEADING
                ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.35,
                    }}
                >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
                        <Brain size={13} />

                        AI Interview Setup
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Create your interview
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                        Configure your interview and
                        let Synthex AI generate a
                        personalized practice session.
                    </p>
                </motion.div>

                {/* =================================================
                    FORM
                ================================================= */}

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.1,
                        duration: 0.4,
                    }}
                    className="mt-10 space-y-6"
                >
                    {/* =================================================
                        TITLE
                    ================================================= */}

                    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/[0.08]">
                                <Layers3
                                    size={17}
                                    className="text-violet-400"
                                />
                            </div>

                            <div>
                                <h2 className="text-sm font-medium">
                                    Interview details
                                </h2>

                                <p className="mt-1 text-xs text-zinc-600">
                                    Give your interview a
                                    name
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="interview-title"
                                    className="text-xs text-zinc-500"
                                >
                                    Interview title
                                </label>

                                <span className="text-[11px] text-zinc-700">
                                    {
                                        formData.title
                                            .length
                                    }
                                    /80
                                </span>
                            </div>

                            <input
                                id="interview-title"
                                type="text"
                                maxLength={80}
                                placeholder="e.g. Full Stack Mock Interview"
                                value={
                                    formData.title
                                }
                                onChange={(event) =>
                                    handleFieldChange(
                                        "title",
                                        event.target
                                            .value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/[0.07]
                                    bg-black/20
                                    px-4
                                    py-3
                                    text-sm
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-violet-400/40
                                    focus:bg-black/30
                                    focus:ring-1
                                    focus:ring-violet-400/10
                                "
                            />
                        </div>
                    </section>

                    {/* =================================================
                        ROLE
                    ================================================= */}

                    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/[0.08]">
                                <Code2
                                    size={17}
                                    className="text-violet-400"
                                />
                            </div>

                            <div>
                                <h2 className="text-sm font-medium">
                                    Target role
                                </h2>

                                <p className="mt-1 text-xs text-zinc-600">
                                    What role are you
                                    preparing for?
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {roles.map((role) => {
                                const selected =
                                    formData.role ===
                                    role;

                                return (
                                    <motion.button
                                        type="button"
                                        key={role}
                                        onClick={() =>
                                            handleFieldChange(
                                                "role",
                                                role
                                            )
                                        }
                                        whileTap={{
                                            scale: 0.985,
                                        }}
                                        className={`
                                            flex
                                            min-h-11
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            px-4
                                            py-3
                                            text-left
                                            text-sm
                                            transition-all
                                            duration-200
                                            focus:outline-none
                                            focus:ring-1
                                            focus:ring-violet-400/30

                                            ${
                                                selected
                                                    ? "border-violet-400/30 bg-violet-500/[0.08] text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.05)]"
                                                    : "border-white/[0.06] bg-black/10 text-zinc-500 hover:border-white/[0.12] hover:bg-white/[0.02] hover:text-white"
                                            }
                                        `}
                                    >
                                        <span>
                                            {role}
                                        </span>

                                        {selected && (
                                            <Check
                                                size={16}
                                                className="shrink-0 text-violet-400"
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </section>

                    {/* =================================================
                        INTERVIEW CONFIGURATION
                    ================================================= */}

                    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                        <div>
                            <h2 className="text-sm font-medium">
                                Interview configuration
                            </h2>

                            <p className="mt-1 text-xs text-zinc-600">
                                Customize how your AI
                                interview should behave.
                            </p>
                        </div>

                        <div className="mt-5 grid gap-6 md:grid-cols-3">
                            {/* Interview Type */}

                            <SelectionGroup
                                label="Interview Type"
                                options={
                                    interviewTypes
                                }
                                value={
                                    formData.interviewType
                                }
                                onChange={(value) =>
                                    handleFieldChange(
                                        "interviewType",
                                        value
                                    )
                                }
                            />

                            {/* Difficulty */}

                            <SelectionGroup
                                label="Difficulty"
                                options={
                                    difficulties
                                }
                                value={
                                    formData.difficulty
                                }
                                onChange={(value) =>
                                    handleFieldChange(
                                        "difficulty",
                                        value
                                    )
                                }
                            />

                            {/* Experience */}

                            <SelectionGroup
                                label="Experience Level"
                                options={
                                    experienceLevels
                                }
                                value={
                                    formData.experienceLevel
                                }
                                onChange={(value) =>
                                    handleFieldChange(
                                        "experienceLevel",
                                        value
                                    )
                                }
                            />
                        </div>
                    </section>

                    {/* =================================================
                        TECHNOLOGIES
                    ================================================= */}

                    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-sm font-medium">
                                    Technologies
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Select the technologies
                                    you want to practice.
                                </p>
                            </div>

                            {selectedTechnologyCount >
                                0 && (
                                <button
                                    type="button"
                                    onClick={
                                        handleClearTechnologies
                                    }
                                    className="
                                        inline-flex
                                        w-fit
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        px-2.5
                                        py-1.5
                                        text-[11px]
                                        text-zinc-600
                                        transition
                                        hover:bg-white/[0.04]
                                        hover:text-zinc-300
                                    "
                                >
                                    <X size={12} />

                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {technologies.map(
                                (technology) => {
                                    const selected =
                                        formData.technologies.includes(
                                            technology
                                        );

                                    return (
                                        <motion.button
                                            type="button"
                                            key={
                                                technology
                                            }
                                            onClick={() =>
                                                handleTechnologyToggle(
                                                    technology
                                                )
                                            }
                                            whileTap={{
                                                scale: 0.96,
                                            }}
                                            aria-pressed={
                                                selected
                                            }
                                            className={`
                                                rounded-lg
                                                border
                                                px-3
                                                py-2
                                                text-xs
                                                transition-all
                                                duration-200
                                                focus:outline-none
                                                focus:ring-1
                                                focus:ring-violet-400/30

                                                ${
                                                    selected
                                                        ? "border-violet-400/30 bg-violet-500/[0.08] text-violet-300"
                                                        : "border-white/[0.06] bg-black/10 text-zinc-500 hover:border-white/[0.12] hover:bg-white/[0.02] hover:text-white"
                                                }
                                            `}
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                {selected && (
                                                    <Check
                                                        size={
                                                            13
                                                        }
                                                    />
                                                )}

                                                {technology}
                                            </span>
                                        </motion.button>
                                    );
                                }
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="text-[11px] text-zinc-700">
                                Select at least one
                                technology.
                            </p>

                            <span
                                className={`
                                    text-[11px]
                                    ${
                                        selectedTechnologyCount >
                                        0
                                            ? "text-violet-400"
                                            : "text-zinc-700"
                                    }
                                `}
                            >
                                {selectedTechnologyCount}{" "}
                                selected
                            </span>
                        </div>
                    </section>

                    {/* =================================================
                        SUBMIT AREA
                    ================================================= */}

                    <div className="flex flex-col gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
                        {/* Error */}

                        <div className="min-w-0 flex-1">
                            {error && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: -5,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    role="alert"
                                    className="
                                        rounded-xl
                                        border
                                        border-red-400/10
                                        bg-red-500/[0.05]
                                        px-4
                                        py-3
                                        text-sm
                                        leading-5
                                        text-red-300
                                    "
                                >
                                    {error}
                                </motion.div>
                            )}
                        </div>

                        {/* Submit */}

                        <motion.button
                            type="submit"
                            disabled={!canSubmit}
                            whileHover={
                                canSubmit
                                    ? {
                                          scale: 1.02,
                                      }
                                    : undefined
                            }
                            whileTap={
                                canSubmit
                                    ? {
                                          scale: 0.98,
                                      }
                                    : undefined
                            }
                            className="
                                inline-flex
                                h-11
                                w-full
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-violet-600
                                to-fuchsia-600
                                px-6
                                text-sm
                                font-medium
                                text-white
                                shadow-lg
                                shadow-violet-900/20
                                transition-all
                                hover:from-violet-500
                                hover:to-fuchsia-500
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                                sm:w-auto
                            "
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </>
                            ) : (
                                <>
                                    Create Interview

                                    <ArrowRight
                                        size={17}
                                    />
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.form>
            </main>
        </div>
    );
};

/* =========================================================
   SELECTION GROUP
========================================================= */

const SelectionGroup = ({
    label,
    options,
    value,
    onChange,
}) => {
    return (
        <div>
            <p className="mb-3 text-xs text-zinc-600">
                {label}
            </p>

            <div className="space-y-2">
                {options.map((option) => {
                    const selected =
                        value === option;

                    return (
                        <motion.button
                            type="button"
                            key={option}
                            onClick={() =>
                                onChange(option)
                            }
                            whileTap={{
                                scale: 0.985,
                            }}
                            aria-pressed={selected}
                            className={`
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-xl
                                border
                                px-3
                                py-2.5
                                text-left
                                text-xs
                                transition-all
                                duration-200
                                focus:outline-none
                                focus:ring-1
                                focus:ring-violet-400/30

                                ${
                                    selected
                                        ? "border-violet-400/30 bg-violet-500/[0.08] text-violet-300"
                                        : "border-white/[0.06] bg-black/10 text-zinc-500 hover:border-white/[0.12] hover:bg-white/[0.02] hover:text-white"
                                }
                            `}
                        >
                            <span>
                                {option}
                            </span>

                            {selected && (
                                <Check
                                    size={14}
                                    className="text-violet-400"
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