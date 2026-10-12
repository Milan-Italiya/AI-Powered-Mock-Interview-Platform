import {
    AnimatePresence,
    motion,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from "motion/react";
import {
    ArrowRight,
    Brain,
    Check,
    ChevronDown,
    ChevronRight,
    CirclePlay,
    FileText,
    Menu,
    MessageSquare,
    Sparkles,
    Target,
    TrendingUp,
    Trophy,
    Users,
    X,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// =====================================================
// DATA
// =====================================================

const features = [
    {
        icon: FileText,
        title: "AI Generated Questions",
        description:
            "Get role-specific interview questions generated dynamically according to your experience, difficulty and technologies.",
    },
    {
        icon: Brain,
        title: "AI Answer Evaluation",
        description:
            "Receive intelligent feedback, scores, strengths and improvement suggestions after every answer.",
    },
    {
        icon: Target,
        title: "Weakness Detection",
        description:
            "Synthex AI identifies recurring weak topics so you know exactly where your knowledge needs improvement.",
    },
    {
        icon: TrendingUp,
        title: "Progress Tracking",
        description:
            "Track your interview performance and understand how your preparation changes over time.",
    },
];

const steps = [
    {
        number: "01",
        icon: Users,
        title: "Choose Your Role",
        description:
            "Select the role, difficulty, experience level and technologies you want to practice.",
    },
    {
        number: "02",
        icon: Brain,
        title: "AI Creates Your Interview",
        description:
            "Synthex AI generates personalized interview questions based on your selected profile.",
    },
    {
        number: "03",
        icon: MessageSquare,
        title: "Answer & Submit",
        description:
            "Answer each question just like a real interview and submit your response.",
    },
    {
        number: "04",
        icon: Trophy,
        title: "Get AI Feedback",
        description:
            "Receive scores, feedback, strengths and weak topics to understand your performance.",
    },
];

const skillData = [
    {
        name: "React.js",
        score: 90,
        style: "bg-violet-400",
    },
    {
        name: "Node.js",
        score: 75,
        style: "bg-blue-400",
    },
    {
        name: "MongoDB",
        score: 60,
        style: "bg-emerald-400",
    },
    {
        name: "System Design",
        score: 45,
        style: "bg-orange-400",
    },
];

const weaknessData = [
    {
        topic: "System Design",
        status: "Needs improvement",
        color: "bg-orange-400",
        score: 45,
    },
    {
        topic: "MongoDB",
        status: "Practice recommended",
        color: "bg-yellow-400",
        score: 60,
    },
    {
        topic: "Node.js",
        status: "Good",
        color: "bg-blue-400",
        score: 75,
    },
    {
        topic: "React.js",
        status: "Strong",
        color: "bg-emerald-400",
        score: 90,
    },
];

const dashboardStats = [
    {
        value: "24",
        label: "Interviews",
        sub: "Practice sessions",
    },
    {
        value: "78%",
        label: "Avg. Score",
        sub: "Overall performance",
    },
    {
        value: "3",
        label: "Weak Topics",
        sub: "Focus areas",
    },
];

const outcomes = [
    "Role-specific interview questions",
    "AI-powered answer evaluation",
    "Scores and detailed feedback",
    "Strength and weakness detection",
    "Interview performance history",
    "Actionable improvement insights",
];

const technologies = [
    "React.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "JavaScript",
    "Java",
    "Spring Boot",
    "Python",
    "Django",
    "SQL",
    "HTML",
    "CSS",
];

const faqs = [
    {
        question: "What is Synthex AI?",
        answer:
            "Synthex AI is an AI-powered interview practice platform that helps you create mock interviews, answer questions and receive AI-generated evaluation and feedback.",
    },
    {
        question: "How does AI evaluation work?",
        answer:
            "After you submit an answer, Synthex AI analyzes the response and provides a score, feedback, strengths and weak topics to help you understand your performance.",
    },
    {
        question: "Can I practice different technical roles?",
        answer:
            "Yes. You can configure interviews for roles such as Frontend Developer, Backend Developer, Full Stack Developer, Java Developer, Python Developer, Data Analyst and more.",
    },
    {
        question: "Does Synthex AI track my performance?",
        answer:
            "Yes. Completed interviews and evaluation results can be used to understand your interview performance and identify areas that need more practice.",
    },
    {
        question: "Is Synthex AI suitable for beginners?",
        answer:
            "Yes. You can choose an experience level and difficulty that matches your current preparation level and practice accordingly.",
    },
];

// =====================================================
// NAVIGATION
// =====================================================

const navItems = [
    {
        label: "Features",
        href: "#features",
    },
    {
        label: "How it works",
        href: "#how-it-works",
    },
    {
        label: "Why Synthex",
        href: "#why-synthex",
    },
];

// =====================================================
// ANIMATION
// =====================================================

const fadeUp = {
    hidden: {
        opacity: 0,
        y: 28,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const fadeUpFast = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

const scaleReveal = {
    hidden: {
        opacity: 0,
        scale: 0.94,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const viewport = {
    once: true,
    amount: 0.18,
};

// =====================================================
// REUSABLE REVEAL
// =====================================================

const Reveal = ({
    children,
    className = "",
    delay = 0,
    amount = 0.18,
}) => {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
                once: true,
                amount,
            }}
            transition={{
                delay,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// =====================================================
// SECTION HEADING
// =====================================================

const SectionHeading = ({
    eyebrow,
    title,
    highlight,
    description,
}) => {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="mx-auto max-w-2xl text-center"
        >
            <motion.p
                initial={{
                    opacity: 0,
                    letterSpacing: "0.05em",
                }}
                whileInView={{
                    opacity: 1,
                    letterSpacing: "0.2em",
                }}
                viewport={{
                    once: true,
                }}
                transition={{
                    duration: 0.7,
                }}
                className="text-xs font-semibold text-violet-400"
            >
                {eyebrow}
            </motion.p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                {title}

                {highlight && (
                    <span className="text-violet-400">
                        {" "}
                        {highlight}
                    </span>
                )}
            </h2>

            {description && (
                <p className="mt-5 text-sm leading-7 text-zinc-500 sm:text-base">
                    {description}
                </p>
            )}
        </motion.div>
    );
};

// =====================================================
// FEATURE CARD
// =====================================================

const FeatureCard = ({ feature, index }) => {
    const Icon = feature.icon;
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            transition={{
                delay: index * 0.08,
            }}
            whileHover={
                shouldReduceMotion
                    ? undefined
                    : {
                          y: -8,
                      }
            }
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl transition-colors duration-300 hover:border-violet-400/20 hover:bg-white/[0.04]"
        >
            {/* Hover glow */}

            <motion.div
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                              x: [0, 15, 0],
                              y: [0, -10, 0],
                          }
                }
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl"
            />

            {/* Card shine */}

            <motion.div
                initial={{
                    x: "-120%",
                }}
                whileHover={{
                    x: "120%",
                }}
                transition={{
                    duration: 0.7,
                    ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-y-0 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
            />

            <motion.div
                whileHover={{
                    scale: 1.08,
                    rotate: 4,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                }}
                className="relative h-14 w-14"
            >
                <div className="absolute inset-0 rounded-2xl bg-violet-500/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/10" />

                    <Icon
                        size={23}
                        strokeWidth={1.7}
                        className="relative z-10 text-violet-300"
                        aria-hidden="true"
                    />

                    <div className="absolute bottom-0 left-1/2 h-px w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
                </div>
            </motion.div>

            <h3 className="mt-7 text-lg font-semibold">
                {feature.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
                {feature.description}
            </p>

            <motion.div
                whileHover={{
                    x: 3,
                }}
                className="mt-7 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition-all duration-300 group-hover:border-violet-400/30 group-hover:bg-violet-500/10"
            >
                <ChevronRight
                    size={15}
                    className="text-zinc-500 transition-colors group-hover:text-violet-300"
                    aria-hidden="true"
                />
            </motion.div>
        </motion.div>
    );
};

// =====================================================
// SKILL BAR
// =====================================================

const SkillBar = ({ skill, index }) => {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                    {skill.name}
                </span>

                <motion.span
                    initial={{
                        opacity: 0,
                        x: 8,
                    }}
                    whileInView={{
                        opacity: 1,
                        x: 0,
                    }}
                    viewport={{
                        once: true,
                    }}
                    transition={{
                        delay: 0.4 + index * 0.12,
                    }}
                    className="font-medium text-zinc-300"
                >
                    {skill.score}%
                </motion.span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                    initial={{
                        width: 0,
                    }}
                    whileInView={{
                        width: `${skill.score}%`,
                    }}
                    viewport={{
                        once: true,
                    }}
                    transition={{
                        duration: 1.1,
                        delay: 0.2 + index * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`h-full rounded-full ${skill.style}`}
                />
            </div>
        </div>
    );
};

// =====================================================
// STEP CARD
// =====================================================

const StepCard = ({ step, index }) => {
    const Icon = step.icon;

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            transition={{
                delay: index * 0.12,
            }}
            className="relative text-center"
        >
            <motion.div
                whileHover={{
                    y: -7,
                    scale: 1.05,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                }}
                className="relative z-10 mx-auto h-20 w-20"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.35,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-3xl bg-violet-500/20 blur-2xl"
                />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-[#0b0b12] shadow-2xl shadow-violet-950/30">
                    <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5" />

                    <motion.div
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute inset-0 rounded-3xl border border-transparent border-t-violet-400/30"
                    />

                    <Icon
                        size={28}
                        strokeWidth={1.6}
                        className="relative z-10 text-violet-300"
                        aria-hidden="true"
                    />

                    <motion.span
                        initial={{
                            scale: 0,
                        }}
                        whileInView={{
                            scale: 1,
                        }}
                        viewport={{
                            once: true,
                        }}
                        transition={{
                            delay: 0.3 + index * 0.12,
                            type: "spring",
                        }}
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-violet-300/20 bg-violet-600 text-[10px] font-bold shadow-lg shadow-violet-900/50"
                    >
                        {step.number}
                    </motion.span>
                </div>
            </motion.div>

            <h3 className="mt-7 font-semibold">
                {step.title}
            </h3>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">
                {step.description}
            </p>
        </motion.div>
    );
};

// =====================================================
// FAQ ITEM
// =====================================================

const FAQItem = ({ item, isOpen, onToggle }) => {
    return (
        <motion.div
            layout
            className="border-b border-white/[0.07]"
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
            >
                <span className="text-sm font-medium text-zinc-200 transition-colors group-hover:text-white sm:text-base">
                    {item.question}
                </span>

                <motion.div
                    animate={{
                        rotate: isOpen ? 180 : 0,
                        scale: isOpen ? 1.05 : 1,
                    }}
                    transition={{
                        duration: 0.25,
                    }}
                    className="shrink-0 text-zinc-500 transition-colors group-hover:text-violet-300"
                >
                    <ChevronDown
                        size={18}
                        aria-hidden="true"
                    />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{
                            height: 0,
                            opacity: 0,
                        }}
                        animate={{
                            height: "auto",
                            opacity: 1,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                        }}
                        transition={{
                            height: {
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1],
                            },
                            opacity: {
                                duration: 0.2,
                            },
                        }}
                        className="overflow-hidden"
                    >
                        <motion.p
                            initial={{
                                y: -8,
                            }}
                            animate={{
                                y: 0,
                            }}
                            exit={{
                                y: -8,
                            }}
                            className="pb-5 pr-8 text-sm leading-6 text-zinc-500"
                        >
                            {item.answer}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// =====================================================
// LANDING PAGE
// =====================================================

const Landing = () => {
    const [mobileMenu, setMobileMenu] = useState(false);
    const [openFAQ, setOpenFAQ] = useState(0);

    const shouldReduceMotion = useReducedMotion();

    // Scroll progress
    const { scrollYProgress } = useScroll();

    const progressScale = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    // Dashboard parallax
    const dashboardY = useTransform(
        scrollYProgress,
        [0, 0.5],
        [0, shouldReduceMotion ? 0 : -35]
    );

    const closeMobileMenu = () => {
        setMobileMenu(false);
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#05050a] text-white">
            {/* =====================================================
                SCROLL PROGRESS
            ====================================================== */}

            <motion.div
                style={{
                    scaleX: progressScale,
                    transformOrigin: "0%",
                }}
                className="fixed left-0 right-0 top-0 z-[100] h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500"
            />

            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                  x: [0, 40, 0],
                                  y: [0, 25, 0],
                                  scale: [1, 1.08, 1],
                              }
                    }
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute left-[20%] top-[-300px] h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[160px]"
                />

                <motion.div
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                  x: [0, -30, 0],
                                  y: [0, 30, 0],
                                  scale: [1, 1.06, 1],
                              }
                    }
                    transition={{
                        duration: 16,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute right-[-200px] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]"
                />

                <motion.div
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                  x: [0, 30, 0],
                                  y: [0, -30, 0],
                              }
                    }
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-[10%] left-[-200px] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]"
                />

                {/* Moving grid */}

                <motion.div
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                  backgroundPosition: [
                                      "0px 0px",
                                      "80px 80px",
                                  ],
                            }
                    }
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* =====================================================
                NAVBAR
            ====================================================== */}

            <header className="relative z-50 border-b border-white/[0.05]">
                <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                    {/* Logo */}

                    <Link
                        to="/"
                        aria-label="Synthex AI home"
                        onClick={closeMobileMenu}
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -20,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            whileHover={{
                                scale: 1.02,
                            }}
                            className="flex items-center gap-3"
                        >
                            <div className="relative flex h-10 w-10 items-center justify-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.15, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 rounded-xl bg-violet-500/30 blur-lg"
                                />

                                <motion.div
                                    whileHover={{
                                        rotate: 8,
                                        scale: 1.05,
                                    }}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10"
                                >
                                    <Sparkles
                                        size={20}
                                        strokeWidth={1.6}
                                        className="text-violet-200"
                                        aria-hidden="true"
                                    />

                                    <motion.span
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.6, 1, 0.6],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-lg shadow-fuchsia-400"
                                    />
                                </motion.div>
                            </div>

                            <span className="text-lg font-semibold tracking-tight">
                                Synthex{" "}
                                <span className="text-violet-400">
                                    AI
                                </span>
                            </span>
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}

                    <div className="hidden items-center gap-8 text-sm text-zinc-400 lg:flex">
                        {navItems.map((item, index) => (
                            <motion.a
                                key={item.href}
                                href={item.href}
                                initial={{
                                    opacity: 0,
                                    y: -10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: 0.1 + index * 0.08,
                                }}
                                whileHover={{
                                    y: -1,
                                }}
                                className="transition-colors hover:text-white"
                            >
                                {item.label}
                            </motion.a>
                        ))}
                    </div>

                    {/* Desktop Actions */}

                    <div className="hidden items-center gap-4 sm:flex">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                        >
                            Login
                        </Link>

                        <motion.div
                            whileHover={{
                                scale: 1.03,
                            }}
                            whileTap={{
                                scale: 0.97,
                            }}
                        >
                            <Link
                                to="/register"
                                className="block rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-medium shadow-lg shadow-violet-900/30"
                            >
                                Get Started
                            </Link>
                        </motion.div>
                    </div>

                    {/* Mobile Menu */}

                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenu((prev) => !prev)
                        }
                        aria-label={
                            mobileMenu
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        aria-expanded={mobileMenu}
                        aria-controls="mobile-navigation"
                        className="rounded-lg border border-white/10 p-2 transition-colors hover:bg-white/[0.05] sm:hidden"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {mobileMenu ? (
                                <motion.div
                                    key="close"
                                    initial={{
                                        opacity: 0,
                                        rotate: -90,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        rotate: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        rotate: 90,
                                    }}
                                >
                                    <X
                                        size={20}
                                        aria-hidden="true"
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{
                                        opacity: 0,
                                        rotate: 90,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        rotate: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        rotate: -90,
                                    }}
                                >
                                    <Menu
                                        size={20}
                                        aria-hidden="true"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </nav>

                <AnimatePresence>
                    {mobileMenu && (
                        <motion.div
                            id="mobile-navigation"
                            initial={{
                                opacity: 0,
                                height: 0,
                            }}
                            animate={{
                                opacity: 1,
                                height: "auto",
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                            }}
                            transition={{
                                duration: 0.25,
                                ease: "easeOut",
                            }}
                            className="overflow-hidden border-t border-white/10 bg-[#08080d] sm:hidden"
                        >
                            <motion.div
                                initial={{
                                    y: -10,
                                }}
                                animate={{
                                    y: 0,
                                }}
                                exit={{
                                    y: -10,
                                }}
                                className="flex flex-col gap-5 px-5 py-5 text-sm text-zinc-300"
                            >
                                {navItems.map((item, index) => (
                                    <motion.a
                                        key={item.href}
                                        href={item.href}
                                        onClick={closeMobileMenu}
                                        initial={{
                                            opacity: 0,
                                            x: -10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            delay:
                                                index * 0.05,
                                        }}
                                        className="transition-colors hover:text-white"
                                    >
                                        {item.label}
                                    </motion.a>
                                ))}

                                <Link
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className="transition-colors hover:text-white"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    onClick={closeMobileMenu}
                                    className="rounded-xl bg-violet-600 px-4 py-3 text-center font-medium"
                                >
                                    Get Started
                                </Link>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* =====================================================
                MAIN
            ====================================================== */}

            <main className="relative z-10">
                {/* =================================================
                    HERO
                ================================================= */}

                <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
                    <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
                        {/* LEFT */}

                        <div>
                            <motion.div
                                variants={fadeUpFast}
                                initial="hidden"
                                animate="visible"
                                className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.07] px-4 py-2 text-xs font-medium tracking-wide text-violet-200"
                            >
                                <motion.span
                                    animate={{
                                        rotate: [0, 15, -15, 0],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Sparkles
                                        size={14}
                                        aria-hidden="true"
                                    />
                                </motion.span>

                                AI-POWERED INTERVIEW PLATFORM
                            </motion.div>

                            <motion.h1
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                transition={{
                                    delay: 0.1,
                                }}
                                className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
                            >
                                Practice Smarter.
                                <br />

                                <motion.span
                                    initial={{
                                        backgroundPosition:
                                            "0% 50%",
                                    }}
                                    animate={{
                                        backgroundPosition:
                                            "100% 50%",
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut",
                                    }}
                                    className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-blue-400 bg-[length:200%_auto] bg-clip-text text-transparent"
                                >
                                    Get Hired Faster.
                                </motion.span>
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                transition={{
                                    delay: 0.2,
                                }}
                                className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg"
                            >
                                Synthex AI generates personalized
                                interviews, evaluates your answers,
                                detects weak areas and helps you
                                understand where to improve.
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                transition={{
                                    delay: 0.3,
                                }}
                                className="mt-9 flex flex-col gap-3 sm:flex-row"
                            >
                                <motion.div
                                    whileHover={{
                                        scale: 1.03,
                                        boxShadow:
                                            "0 15px 45px rgba(139,92,246,.35)",
                                    }}
                                    whileTap={{
                                        scale: 0.97,
                                    }}
                                >
                                    <Link
                                        to="/register"
                                        className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 font-medium"
                                    >
                                        Start Practicing

                                        <motion.span
                                            className="flex"
                                            whileHover={{
                                                x: 4,
                                            }}
                                        >
                                            <ArrowRight
                                                size={18}
                                                aria-hidden="true"
                                            />
                                        </motion.span>
                                    </Link>
                                </motion.div>

                                <motion.a
                                    href="#features"
                                    whileHover={{
                                        scale: 1.02,
                                        y: -2,
                                    }}
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-medium text-zinc-200 backdrop-blur-xl transition-colors hover:bg-white/[0.07]"
                                >
                                    <CirclePlay
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    Explore Features
                                </motion.a>
                            </motion.div>

                            {/* Trust / Positioning */}

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 12,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.7,
                                    delay: 0.5,
                                }}
                                className="mt-10 flex items-center gap-4"
                            >
                                <div className="flex -space-x-3">
                                    {["M", "A", "R", "S"].map(
                                        (letter, index) => (
                                            <motion.div
                                                key={letter}
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                transition={{
                                                    delay:
                                                        0.65 +
                                                        index *
                                                            0.08,
                                                    type: "spring",
                                                }}
                                                whileHover={{
                                                    y: -4,
                                                    zIndex: 10,
                                                }}
                                                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#05050a] bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-semibold"
                                            >
                                                {letter}
                                            </motion.div>
                                        )
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-zinc-300">
                                        Built for ambitious
                                        developers
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Practice. Analyze. Improve.
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT DASHBOARD */}

                        <motion.div
                            style={{
                                y: dashboardY,
                            }}
                            initial={{
                                opacity: 0,
                                x: 50,
                                rotateY: 8,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                rotateY: 0,
                            }}
                            transition={{
                                duration: 0.9,
                                delay: 0.25,
                            }}
                            className="relative"
                        >
                            <motion.div
                                animate={
                                    shouldReduceMotion
                                        ? undefined
                                        : {
                                              scale: [
                                                  1,
                                                  1.08,
                                                  1,
                                              ],
                                              opacity: [
                                                  0.5,
                                                  0.8,
                                                  0.5,
                                              ],
                                          }
                                }
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-10 rounded-full bg-violet-600/20 blur-[100px]"
                            />

                            <motion.div
                                animate={{
                                    rotate: 360,
                                }}
                                transition={{
                                    duration: 25,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="absolute -inset-10 rounded-full border border-violet-500/20"
                            />

                            <motion.div
                                animate={
                                    shouldReduceMotion
                                        ? undefined
                                        : {
                                              y: [0, -8, 0],
                                          }
                                }
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="relative rounded-[28px] border border-violet-400/20 bg-[#0c0c15]/90 p-3 shadow-2xl shadow-violet-950/30 backdrop-blur-2xl"
                            >
                                {/* Sample label */}

                                <div className="mb-3 flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <motion.span
                                            animate={{
                                                scale: [
                                                    1,
                                                    1.4,
                                                    1,
                                                ],
                                                opacity: [
                                                    0.6,
                                                    1,
                                                    0.6,
                                                ],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
                                        />

                                        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                                            Dashboard Preview
                                        </span>
                                    </div>

                                    <span className="text-[10px] text-zinc-600">
                                        SAMPLE DATA
                                    </span>
                                </div>

                                {/* Top */}

                                <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] px-5 py-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Your Performance
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            Interview analytics
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
                                        Last 7 days
                                    </div>
                                </div>

                                {/* Dashboard Grid */}

                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {/* Score */}

                                    <motion.div
                                        whileHover={{
                                            y: -4,
                                            borderColor:
                                                "rgba(139,92,246,.25)",
                                        }}
                                        className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5"
                                    >
                                        <p className="text-xs text-zinc-500">
                                            Overall Score
                                        </p>

                                        <div className="mt-6 flex items-center justify-center">
                                            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-white/[0.04]">
                                                <motion.div
                                                    initial={{
                                                        rotate: -90,
                                                    }}
                                                    whileInView={{
                                                        rotate: 210,
                                                    }}
                                                    viewport={{
                                                        once: true,
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: 0.4,
                                                    }}
                                                    className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-t-violet-500 border-r-fuchsia-500"
                                                />

                                                <motion.div
                                                    animate={{
                                                        scale: [
                                                            1,
                                                            1.04,
                                                            1,
                                                        ],
                                                    }}
                                                    transition={{
                                                        duration: 2.5,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                    className="text-center"
                                                >
                                                    <div className="text-4xl font-semibold">
                                                        82%
                                                    </div>

                                                    <div className="mt-1 text-xs text-zinc-500">
                                                        Strong progress
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-center gap-1 text-xs text-emerald-400">
                                            <TrendingUp
                                                size={13}
                                                aria-hidden="true"
                                            />

                                            Improving over time
                                        </div>
                                    </motion.div>

                                    {/* Skills */}

                                    <motion.div
                                        whileHover={{
                                            y: -4,
                                            borderColor:
                                                "rgba(139,92,246,.25)",
                                        }}
                                        className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">
                                                Skills Breakdown
                                            </p>

                                            <motion.div
                                                animate={{
                                                    rotate: [
                                                        0,
                                                        10,
                                                        -10,
                                                        0,
                                                    ],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                }}
                                            >
                                                <Zap
                                                    size={16}
                                                    className="text-violet-400"
                                                    aria-hidden="true"
                                                />
                                            </motion.div>
                                        </div>

                                        <div className="mt-6 space-y-5">
                                            {skillData.map(
                                                (
                                                    skill,
                                                    index
                                                ) => (
                                                    <SkillBar
                                                        key={
                                                            skill.name
                                                        }
                                                        skill={
                                                            skill
                                                        }
                                                        index={
                                                            index
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Stats */}

                                <div className="mt-3 grid grid-cols-3 gap-3">
                                    {dashboardStats.map(
                                        (stat, index) => (
                                            <motion.div
                                                key={
                                                    stat.label
                                                }
                                                initial={{
                                                    opacity: 0,
                                                    y: 15,
                                                }}
                                                whileInView={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                viewport={{
                                                    once: true,
                                                }}
                                                transition={{
                                                    delay:
                                                        0.3 +
                                                        index *
                                                            0.1,
                                                }}
                                                whileHover={{
                                                    y: -4,
                                                }}
                                                className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                                            >
                                                <p className="text-2xl font-semibold">
                                                    {
                                                        stat.value
                                                    }
                                                </p>

                                                <p className="mt-1 text-[11px] text-zinc-500">
                                                    {
                                                        stat.label
                                                    }
                                                </p>

                                                <p className="mt-2 text-[10px] text-zinc-600">
                                                    {
                                                        stat.sub
                                                    }
                                                </p>
                                            </motion.div>
                                        )
                                    )}
                                </div>

                                {/* AI Badge */}

                                <motion.div
                                    animate={{
                                        y: [0, -8, 0],
                                        rotate: [0, 2, -2, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute -bottom-12 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-2xl border border-violet-400/30 bg-[#11101c] shadow-xl shadow-violet-900/40"
                                >
                                    <div className="relative flex h-12 w-12 items-center justify-center">
                                        <motion.div
                                            animate={{
                                                scale: [
                                                    1,
                                                    1.2,
                                                    1,
                                                ],
                                                opacity: [
                                                    0.5,
                                                    0.9,
                                                    0.5,
                                                ],
                                            }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                            }}
                                            className="absolute inset-0 rounded-full bg-violet-500/30 blur-xl"
                                        />

                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                                            <Brain
                                                size={25}
                                                strokeWidth={1.5}
                                                className="text-violet-300"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* =====================================================
                    FEATURES
                ====================================================== */}

                <section
                    id="features"
                    className="mx-auto max-w-7xl scroll-mt-20 px-5 py-28 sm:px-6 lg:px-8"
                >
                    <SectionHeading
                        eyebrow="POWERFUL FEATURES"
                        title="Everything you need to"
                        highlight="prepare with purpose."
                        description="Synthex AI turns every interview attempt into actionable insights that help you understand what to improve next."
                    />

                    <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={feature.title}
                                feature={feature}
                                index={index}
                            />
                        ))}
                    </div>
                </section>

                {/* =====================================================
                    OUTCOMES
                ====================================================== */}

                <section className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                        <Reveal>
                            <p className="text-xs font-semibold tracking-[0.2em] text-violet-400">
                                WHAT YOU GET
                            </p>

                            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Every interview gives you
                                <span className="text-violet-400">
                                    {" "}
                                    something to improve.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-500 sm:text-base">
                                Instead of simply finishing a mock
                                interview, Synthex AI helps turn each
                                attempt into useful performance data.
                            </p>

                            <motion.div
                                whileHover={{
                                    x: 4,
                                }}
                                className="mt-7 inline-block"
                            >
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
                                >
                                    Start practicing
                                    <ArrowRight
                                        size={16}
                                        aria-hidden="true"
                                    />
                                </Link>
                            </motion.div>
                        </Reveal>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {outcomes.map((item, index) => (
                                <motion.div
                                    key={item}
                                    initial={{
                                        opacity: 0,
                                        x: index % 2 === 0 ? -20 : 20,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                        amount: 0.2,
                                    }}
                                    transition={{
                                        delay: index * 0.07,
                                        duration: 0.5,
                                    }}
                                    whileHover={{
                                        x: 4,
                                    }}
                                    className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-violet-400/15 hover:bg-white/[0.035]"
                                >
                                    <motion.div
                                        whileHover={{
                                            scale: 1.15,
                                            rotate: 8,
                                        }}
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10"
                                    >
                                        <Check
                                            size={14}
                                            className="text-emerald-400"
                                            aria-hidden="true"
                                        />
                                    </motion.div>

                                    <span className="text-sm text-zinc-300">
                                        {item}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    WHY SYNTHEX
                ====================================================== */}

                <section
                    id="why-synthex"
                    className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-6 lg:px-8"
                >
                    <motion.div
                        variants={scaleReveal}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewport}
                        className="overflow-hidden rounded-[32px] border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.025] to-blue-500/[0.05] p-8 sm:p-12 lg:p-16"
                    >
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-violet-400">
                                    WHY SYNTHEX AI
                                </p>

                                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
                                    Stop practicing randomly.
                                    <br />

                                    <span className="text-violet-400">
                                        Start practicing intelligently.
                                    </span>
                                </h2>

                                <p className="mt-6 max-w-lg leading-7 text-zinc-400">
                                    A mock interview becomes more useful
                                    when you understand not only your
                                    score, but also the topics and
                                    patterns behind your performance.
                                </p>

                                <div className="mt-8 space-y-4">
                                    {[
                                        "Understand recurring weak topics",
                                        "Receive targeted improvement suggestions",
                                        "Review your interview performance",
                                        "Track your preparation over time",
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item}
                                            initial={{
                                                opacity: 0,
                                                x: -15,
                                            }}
                                            whileInView={{
                                                opacity: 1,
                                                x: 0,
                                            }}
                                            viewport={{
                                                once: true,
                                            }}
                                            transition={{
                                                delay:
                                                    index *
                                                    0.08,
                                            }}
                                            whileHover={{
                                                x: 5,
                                            }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                                                <Check
                                                    size={14}
                                                    className="text-emerald-400"
                                                    aria-hidden="true"
                                                />
                                            </div>

                                            <span className="text-sm text-zinc-300">
                                                {item}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Analysis Card */}

                            <motion.div
                                whileHover={{
                                    y: -6,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                }}
                                className="relative"
                            >
                                <motion.div
                                    animate={{
                                        scale: [
                                            1,
                                            1.08,
                                            1,
                                        ],
                                        opacity: [
                                            0.4,
                                            0.7,
                                            0.4,
                                        ],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 rounded-3xl bg-violet-500/10 blur-3xl"
                                />

                                <div className="relative rounded-3xl border border-white/10 bg-[#09090f]/80 p-6 shadow-2xl backdrop-blur-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">
                                                AI Weakness Analysis
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                Example performance
                                                analysis
                                            </p>
                                        </div>

                                        <motion.div
                                            animate={{
                                                rotate: [
                                                    0,
                                                    8,
                                                    -8,
                                                    0,
                                                ],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                            }}
                                        >
                                            <Target
                                                size={20}
                                                className="text-violet-400"
                                                aria-hidden="true"
                                            />
                                        </motion.div>
                                    </div>

                                    <div className="mt-7 space-y-4">
                                        {weaknessData.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <motion.div
                                                    key={
                                                        item.topic
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    whileInView={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    viewport={{
                                                        once: true,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            index *
                                                            0.08,
                                                    }}
                                                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm">
                                                            {
                                                                item.topic
                                                            }
                                                        </span>

                                                        <span className="text-right text-xs text-zinc-500">
                                                            {
                                                                item.status
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                                        <motion.div
                                                            initial={{
                                                                width: 0,
                                                            }}
                                                            whileInView={{
                                                                width: `${item.score}%`,
                                                            }}
                                                            viewport={{
                                                                once: true,
                                                            }}
                                                            transition={{
                                                                duration: 1,
                                                                delay:
                                                                    0.2 +
                                                                    index *
                                                                        0.1,
                                                            }}
                                                            className={`h-full rounded-full ${item.color}`}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )
                                        )}
                                    </div>

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                        }}
                                        transition={{
                                            delay: 0.5,
                                        }}
                                        className="mt-5 rounded-xl border border-violet-400/10 bg-violet-500/[0.05] p-4"
                                    >
                                        <div className="flex gap-3">
                                            <motion.div
                                                animate={{
                                                    rotate: [
                                                        0,
                                                        10,
                                                        -10,
                                                        0,
                                                    ],
                                                }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                }}
                                            >
                                                <Sparkles
                                                    size={18}
                                                    className="mt-0.5 shrink-0 text-violet-300"
                                                    aria-hidden="true"
                                                />
                                            </motion.div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    Recommended next
                                                    step
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                                    Focus on the topics
                                                    where your
                                                    performance needs
                                                    more practice.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>

                {/* =====================================================
                    HOW IT WORKS
                ====================================================== */}

                <section
                    id="how-it-works"
                    className="mx-auto max-w-7xl scroll-mt-20 px-5 py-28 sm:px-6 lg:px-8"
                >
                    <SectionHeading
                        eyebrow="HOW IT WORKS"
                        title="Simple steps."
                        highlight="Smarter preparation."
                        description="Create an interview, answer questions and use the resulting feedback to guide your next practice session."
                    />

                    <div className="relative mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                        <motion.div
                            initial={{
                                scaleX: 0,
                            }}
                            whileInView={{
                                scaleX: 1,
                            }}
                            viewport={{
                                once: true,
                            }}
                            transition={{
                                duration: 1.2,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute left-[12%] right-[12%] top-10 hidden h-px origin-left bg-gradient-to-r from-violet-500/0 via-violet-500/30 to-violet-500/0 lg:block"
                        />

                        {steps.map((step, index) => (
                            <StepCard
                                key={step.number}
                                step={step}
                                index={index}
                            />
                        ))}
                    </div>
                </section>

                {/* =====================================================
                    TECHNOLOGY COVERAGE
                ====================================================== */}

                <section className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
                    <motion.div
                        variants={scaleReveal}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewport}
                        className="rounded-[28px] border border-white/[0.07] bg-white/[0.02] p-8 sm:p-10 lg:p-12"
                    >
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-xl">
                                <p className="text-xs font-semibold tracking-[0.2em] text-violet-400">
                                    TECHNOLOGY COVERAGE
                                </p>

                                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Practice across the stack.
                                </h2>

                                <p className="mt-4 text-sm leading-7 text-zinc-500 sm:text-base">
                                    Build interview sessions around
                                    technologies you are learning,
                                    working with or preparing to discuss
                                    in interviews.
                                </p>
                            </div>

                            <div className="flex max-w-xl flex-wrap gap-2 lg:justify-end">
                                {technologies.map(
                                    (technology, index) => (
                                        <motion.span
                                            key={technology}
                                            initial={{
                                                opacity: 0,
                                                scale: 0.85,
                                            }}
                                            whileInView={{
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            viewport={{
                                                once: true,
                                            }}
                                            transition={{
                                                delay:
                                                    index *
                                                    0.045,
                                                type: "spring",
                                                stiffness: 200,
                                                damping: 18,
                                            }}
                                            whileHover={{
                                                y: -3,
                                                scale: 1.04,
                                            }}
                                            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition-colors hover:border-violet-400/20 hover:text-violet-300"
                                        >
                                            {technology}
                                        </motion.span>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* =====================================================
                    FAQ
                ====================================================== */}

                <section className="mx-auto max-w-4xl px-5 py-24 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="FAQ"
                        title="Questions,"
                        highlight="answered."
                        description="A few things you may want to know before starting your first interview."
                    />

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                        }}
                        transition={{
                            duration: 0.6,
                        }}
                        className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 sm:px-8"
                    >
                        {faqs.map((item, index) => (
                            <FAQItem
                                key={item.question}
                                item={item}
                                isOpen={openFAQ === index}
                                onToggle={() =>
                                    setOpenFAQ(
                                        openFAQ === index
                                            ? -1
                                            : index
                                    )
                                }
                            />
                        ))}
                    </motion.div>
                </section>

                {/* =====================================================
                    CTA
                ====================================================== */}

                <section className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.96,
                            y: 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative overflow-hidden rounded-[32px] border border-violet-400/20 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-blue-600/10 px-6 py-16 text-center sm:px-12"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.4, 0.7, 0.4],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[100px]"
                        />

                        <div className="relative">
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="relative mx-auto flex h-14 w-14 items-center justify-center"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                    }}
                                    className="absolute inset-0 rounded-full bg-violet-500/30 blur-xl"
                                />

                                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                                    <Sparkles
                                        size={25}
                                        strokeWidth={1.5}
                                        className="text-violet-300"
                                        aria-hidden="true"
                                    />
                                </div>
                            </motion.div>

                            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                                Your next interview starts
                                with better practice.
                            </h2>

                            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
                                Practice with AI. Understand your
                                performance. Improve with every
                                interview.
                            </p>

                            <motion.div
                                whileHover={{
                                    scale: 1.04,
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.97,
                                }}
                                className="mt-8 inline-block"
                            >
                                <Link
                                    to="/register"
                                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-medium text-black shadow-xl shadow-white/10"
                                >
                                    Get Started for Free

                                    <motion.span
                                        className="flex"
                                        whileHover={{
                                            x: 4,
                                        }}
                                    >
                                        <ArrowRight
                                            size={18}
                                            aria-hidden="true"
                                        />
                                    </motion.span>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* =====================================================
                FOOTER
            ====================================================== */}

            <motion.footer
                initial={{
                    opacity: 0,
                }}
                whileInView={{
                    opacity: 1,
                }}
                viewport={{
                    once: true,
                }}
                transition={{
                    duration: 0.7,
                }}
                className="relative z-10 border-t border-white/[0.06]"
            >
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div>
                        <motion.div
                            whileHover={{
                                x: 3,
                            }}
                            className="flex items-center gap-2"
                        >
                            <Sparkles
                                size={16}
                                className="text-violet-400"
                                aria-hidden="true"
                            />

                            <span className="font-medium text-zinc-300">
                                Synthex{" "}
                                <span className="text-violet-400">
                                    AI
                                </span>
                            </span>
                        </motion.div>

                        <p className="mt-2 text-xs text-zinc-600">
                            AI-powered interview preparation.
                        </p>

                        <p className="mt-1 text-xs text-zinc-700">
                            © {new Date().getFullYear()} Synthex AI
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
                        <a
                            href="#features"
                            className="transition-colors hover:text-white"
                        >
                            Features
                        </a>

                        <a
                            href="#how-it-works"
                            className="transition-colors hover:text-white"
                        >
                            How it works
                        </a>

                        <a
                            href="#why-synthex"
                            className="transition-colors hover:text-white"
                        >
                            Why Synthex
                        </a>

                        <Link
                            to="/login"
                            className="transition-colors hover:text-white"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="text-violet-400 transition-colors hover:text-violet-300"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};

export default Landing;