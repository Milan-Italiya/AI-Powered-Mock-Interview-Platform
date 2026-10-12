
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    AlertTriangle,
    ArrowDownWideNarrow,
    ArrowLeft,
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Code2,
    Filter,
    Loader2,
    Plus,
    Search,
    SlidersHorizontal,
    Sparkles,
    Trash2,
    X,
    BriefcaseBusiness,
    CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
    deleteInterview,
    getAllInterviews,
} from "../../usecase/interview.usecase.js";

import Sidebar from "../../components/dashboard/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemedSelect from "../../components/common/ThemedSelect.jsx";

const panelClass =
    "rounded-2xl border border-white/[0.07] bg-[#0b0b12]";

const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:bg-violet-400 active:scale-[0.98]";

const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white";

const normalize = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ");

const getStatus = (interview) => {
    const status = normalize(interview?.status);

    if (["completed", "evaluated", "finished"].includes(status)) {
        return "Completed";
    }

    if (
        ["in progress", "ongoing", "started"].includes(status)
    ) {
        return "In Progress";
    }

    return "Pending";
};

const getTimestamp = (value) => {
    if (!value) return 0;

    const timestamp = new Date(value).getTime();

    return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatDate = (date) => {
    const timestamp = getTimestamp(date);

    if (!timestamp) return "Date unavailable";

    return new Date(timestamp).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const getUniqueOptions = (items, field) => {
    const uniqueOptions = new Map();

    items.forEach((item) => {
        const originalValue = String(item?.[field] ?? "").trim();
        const normalizedValue = normalize(originalValue);

        if (normalizedValue && !uniqueOptions.has(normalizedValue)) {
            uniqueOptions.set(normalizedValue, originalValue);
        }
    });

    return [...uniqueOptions.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label }));
};
const MetaItem = ({ label, value, icon: Icon }) => (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-white/[0.055] bg-white/[0.02] p-3">
        {Icon && (
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300/70" />
        )}
        <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
                {label}
            </p>
            <p className="mt-1 truncate text-xs font-semibold capitalize text-white/75">
                {value || "—"}
            </p>
        </div>
    </div>
);

const AllInterviews = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("sidebar-collapsed") === "true";
        } catch {
            return false;
        }
    });

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [experienceFilter, setExperienceFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [filtersOpen, setFiltersOpen] = useState(true);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        try {
            localStorage.setItem("sidebar-collapsed", String(collapsed));
        } catch (storageError) {
            console.error("Could not save sidebar state:", storageError);
        }
    }, [collapsed]);

    useEffect(() => {
        let active = true;

        const fetchInterviews = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getAllInterviews();

                const interviewData =
                    response?.data?.interviews ??
                    response?.interviews ??
                    response?.data?.data ??
                    [];

                if (!Array.isArray(interviewData)) {
                    throw new Error("Unexpected interviews response.");
                }

                if (active) {
                    setInterviews(interviewData);
                }
            } catch (fetchError) {
                console.error("Fetch interviews error:", fetchError);

                if (active) {
                    setError(
                        fetchError?.response?.data?.message ||
                        fetchError?.message ||
                        "Failed to load interviews."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchInterviews();

        return () => {
            active = false;
        };
    }, [retryCount]);

    const handleDelete = async () => {
        if (!deleteTarget || deletingId) return;

        const interviewId = deleteTarget._id;

        try {
            setDeletingId(interviewId);
            await deleteInterview(interviewId);

            setInterviews((current) =>
                current.filter((interview) => interview._id !== interviewId)
            );

            setDeleteTarget(null);
            toast.success("Interview deleted successfully.");
        } catch (deleteError) {
            console.error("Delete interview error:", deleteError);

            toast.error(
                deleteError?.response?.data?.message ||
                deleteError?.message ||
                "Failed to delete interview."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleInterviewAction = (interview) => {
        if (!interview?._id) return;

        navigate(
            getStatus(interview) === "Completed"
                ? `/interview/${interview._id}/result`
                : `/interview/${interview._id}`
        );
    };

    const typeOptions = useMemo(
        () => getUniqueOptions(interviews, "interviewType"),
        [interviews]
    );

    const difficultyOptions = useMemo(
        () => getUniqueOptions(interviews, "difficulty"),
        [interviews]
    );

    const experienceOptions = useMemo(
        () => getUniqueOptions(interviews, "experienceLevel"),
        [interviews]
    );

    const completedCount = interviews.filter(
        (interview) => getStatus(interview) === "Completed"
    ).length;

    const inProgressCount = interviews.filter(
        (interview) => getStatus(interview) === "In Progress"
    ).length;

    const pendingCount = interviews.filter(
        (interview) => getStatus(interview) === "Pending"
    ).length;

    const activeFilterCount = [
        statusFilter !== "all",
        typeFilter !== "all",
        difficultyFilter !== "all",
        experienceFilter !== "all",
        Boolean(search.trim()),
        sortBy !== "newest",
    ].filter(Boolean).length;

    const filteredInterviews = useMemo(() => {
        const searchText = normalize(search);

        const result = interviews.filter((interview) => {
            const searchableText = [
                interview?.title,
                interview?.role,
                interview?.interviewType,
                interview?.difficulty,
                interview?.experienceLevel,
                interview?.status,
                ...(Array.isArray(interview?.technologies)
                    ? interview.technologies
                    : []),
            ]
                .map(normalize)
                .join(" ");

            return (
                (!searchText || searchableText.includes(searchText)) &&
                (statusFilter === "all" ||
                    normalize(getStatus(interview)) === normalize(statusFilter)) &&
                (typeFilter === "all" ||
                    normalize(interview?.interviewType) === typeFilter) &&
                (difficultyFilter === "all" ||
                    normalize(interview?.difficulty) === difficultyFilter) &&
                (experienceFilter === "all" ||
                    normalize(interview?.experienceLevel) === experienceFilter)
            );
        });

        result.sort((a, b) => {
            const dateA = getTimestamp(a?.createdAt);
            const dateB = getTimestamp(b?.createdAt);

            if (sortBy === "oldest") {
                return dateA - dateB;
            }

            if (sortBy === "title") {
                return String(a?.title || "").localeCompare(
                    String(b?.title || "")
                );
            }

            if (sortBy === "difficulty") {
                const rank = {
                    easy: 1,
                    medium: 2,
                    hard: 3,
                };

                return (
                    (rank[normalize(a?.difficulty)] || 99) -
                    (rank[normalize(b?.difficulty)] || 99)
                );
            }

            return dateB - dateA;
        });

        return result;
    }, [
        interviews,
        search,
        statusFilter,
        typeFilter,
        difficultyFilter,
        experienceFilter,
        sortBy,
    ]);

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setTypeFilter("all");
        setDifficultyFilter("all");
        setExperienceFilter("all");
        setSortBy("newest");
    };

    const statusTabs = [
        { value: "all", label: "All interviews", count: interviews.length },
        { value: "completed", label: "Completed", count: completedCount },
        { value: "in progress", label: "In progress", count: inProgressCount },
        { value: "pending", label: "Pending", count: pendingCount },
    ];

    const stats = [
        {
            label: "Total interviews",
            count: interviews.length,
            description: "All your sessions",
            icon: BarChart3,
            style: "bg-violet-500/10 text-violet-300",
        },
        {
            label: "Completed",
            count: completedCount,
            description: "Ready to review",
            icon: CheckCircle2,
            style: "bg-emerald-500/10 text-emerald-300",
        },
        {
            label: "In progress",
            count: inProgressCount,
            description: "Continue practising",
            icon: Clock3,
            style: "bg-sky-500/10 text-sky-300",
        },
        {
            label: "Pending",
            count: pendingCount,
            description: "Not started yet",
            icon: Sparkles,
            style: "bg-amber-500/10 text-amber-300",
        },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#05050a] text-white">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onLogout={logout}
            />

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className={`min-h-screen min-w-0 pt-16 transition-[margin] duration-300 md:pt-0 ${collapsed ? "md:ml-20" : "md:ml-[260px]"
                    }`}
            >
                <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Page heading */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative mb-7 overflow-hidden rounded-3xl border border-violet-400/[0.14] bg-gradient-to-br from-violet-500/[0.12] via-[#10101b] to-[#0a0a11] p-5 sm:p-7 lg:p-8"
                    >
                        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-violet-500/[0.09] blur-3xl" />

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="relative mb-5 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </button>

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[0.08] px-3 py-1.5 text-xs font-medium text-violet-200">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Your practice library
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10">
                                        <BarChart3 className="h-5 w-5 text-violet-300" />
                                    </div>

                                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                                        All Interviews
                                    </h1>
                                </div>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                                    Manage your mock interviews, continue
                                    unfinished sessions, and revisit your
                                    AI-powered results.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/interview/create")}
                                className={`${primaryButton} h-11 shrink-0 self-start sm:self-auto`}
                            >
                                <Plus className="h-4 w-4" />
                                New interview
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.section>

                    {/* Statistics */}
                    <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;

                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.25,
                                        delay: index * 0.04,
                                    }}
                                    className={`${panelClass} p-4 transition hover:border-white/[0.12] sm:p-5`}
                                >
                                    <div className="mb-4 flex items-center justify-between gap-2">
                                        <p className="text-xs font-medium text-white/45 sm:text-sm">
                                            {stat.label}
                                        </p>
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.style}`}
                                        >
                                            <Icon className="h-[18px] w-[18px]" />
                                        </div>
                                    </div>

                                    <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                        {loading ? "—" : stat.count}
                                    </p>
                                    <p className="mt-1.5 text-xs text-white/35">
                                        {stat.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </section>

                    {/* Search and themed filters */}
                    <section className={`${panelClass} mb-6 p-4 sm:p-5`}>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                                        <SlidersHorizontal className="h-[18px] w-[18px] text-violet-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Find an interview
                                        </h2>
                                        <p className="mt-0.5 text-xs text-white/40">
                                            Search and combine filters
                                        </p>
                                    </div>

                                    {activeFilterCount > 0 && (
                                        <span className="rounded-full border border-violet-400/15 bg-violet-500/10 px-2 py-1 text-[10px] font-semibold text-violet-200">
                                            {activeFilterCount} active
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="text-xs font-medium text-violet-300 transition hover:text-violet-200"
                                        >
                                            Clear all
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFiltersOpen((open) => !open)
                                        }
                                        aria-expanded={filtersOpen}
                                        className={secondaryButton}
                                    >
                                        <Filter className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            Filters
                                        </span>
                                        <ChevronDown
                                            className={`h-4 w-4 transition ${filtersOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/35" />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search title, role, technologies, type..."
                                    aria-label="Search interviews"
                                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#101019] pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-violet-400/40"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        aria-label="Clear search"
                                        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <AnimatePresence initial={false}>
                                {filtersOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-visible"
                                    >

                                        <div className="grid grid-cols-1 gap-4 border-t border-white/[0.06] pt-4 sm:grid-cols-2 xl:grid-cols-4">
                                            <div>
                                                <label className="mb-2 block text-xs font-medium text-white/45">
                                                    Interview type
                                                </label>

                                                <ThemedSelect
                                                    name="interviewType"
                                                    value={typeFilter}
                                                    onChange={(event) => setTypeFilter(event.target.value)}
                                                    placeholder="All types"
                                                    icon={Sparkles}
                                                    options={[
                                                        { value: "all", label: "All types" },
                                                        ...typeOptions.map((option) => ({
                                                            value: option.value,
                                                            label: option.label,
                                                        }))
                                                    ]}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium text-white/45">
                                                    Difficulty
                                                </label>

                                                <ThemedSelect
                                                    name="difficulty"
                                                    value={difficultyFilter}
                                                    onChange={(event) => setDifficultyFilter(event.target.value)}
                                                    placeholder="All difficulties"
                                                    icon={SlidersHorizontal}
                                                    options={[
                                                        { value: "all", label: "All difficulties" },
                                                        ...difficultyOptions.map((option) => ({
                                                            value: option.value,
                                                            label: option.label,
                                                        }))
                                                    ]}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium text-white/45">
                                                    Experience level
                                                </label>

                                                <ThemedSelect
                                                    name="experienceLevel"
                                                    value={experienceFilter}
                                                    onChange={(event) => setExperienceFilter(event.target.value)}
                                                    placeholder="All experience levels"
                                                    icon={Code2}
                                                    options={[
                                                        {
                                                            value: "all",
                                                            label: "All experience levels",
                                                        },
                                                        ...experienceOptions.map((option) => ({
                                                            value: option.value,
                                                            label: option.label,
                                                        }))
                                                    ]}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium text-white/45">
                                                    Sort by
                                                </label>

                                                <ThemedSelect
                                                    name="sortBy"
                                                    value={sortBy}
                                                    onChange={(event) => setSortBy(event.target.value)}
                                                    placeholder="Newest first"
                                                    icon={ArrowDownWideNarrow}
                                                    options={[
                                                        { value: "newest", label: "Newest first" },
                                                        { value: "oldest", label: "Oldest first" },
                                                        { value: "title", label: "Title A–Z" },
                                                        { value: "difficulty", label: "Difficulty" },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* Status tabs */}
                    {!loading && !error && interviews.length > 0 && (
                        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                            {statusTabs.map((tab) => {
                                const selected = statusFilter === tab.value;

                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setStatusFilter(tab.value)}
                                        aria-pressed={selected}
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition ${selected
                                            ? "border-violet-400/25 bg-violet-500/10 text-violet-200"
                                            : "border-white/[0.07] bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                                            }`}
                                    >
                                        {tab.label}
                                        <span
                                            className={`rounded-md px-1.5 py-0.5 text-[10px] ${selected
                                                ? "bg-violet-400/15 text-violet-200"
                                                : "bg-white/[0.05] text-white/40"
                                                }`}
                                        >
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className={`${panelClass} flex min-h-72 items-center justify-center`}>
                            <div className="flex items-center gap-3 text-sm text-white/45">
                                <Loader2 className="h-5 w-5 animate-spin text-violet-300" />
                                Loading interviews...
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className={`${panelClass} flex min-h-72 flex-col items-center justify-center px-5 py-10 text-center`}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                                <AlertTriangle className="h-6 w-6 text-red-300" />
                            </div>

                            <h2 className="mt-4 text-base font-semibold">
                                Couldn't load interviews
                            </h2>
                            <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => setRetryCount((count) => count + 1)}
                                disabled={loading}
                                className={`${secondaryButton} mt-5 disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                <ArrowRight className="h-4 w-4" />
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty library */}
                    {!loading && !error && interviews.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${panelClass} flex min-h-80 flex-col items-center justify-center px-5 py-12 text-center`}
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10">
                                <Sparkles className="h-6 w-6 text-violet-300" />
                            </div>

                            <h2 className="mt-5 text-lg font-semibold">
                                Your interview library is empty
                            </h2>
                            <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
                                Create your first AI-powered mock interview
                                and start building your interview skills.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/interview/create")}
                                className={`${primaryButton} mt-6`}
                            >
                                <Plus className="h-4 w-4" />
                                Create interview
                            </button>
                        </motion.div>
                    )}

                    {/* No matches */}
                    {!loading &&
                        !error &&
                        interviews.length > 0 &&
                        filteredInterviews.length === 0 && (
                            <div className={`${panelClass} flex min-h-72 flex-col items-center justify-center px-5 py-10 text-center`}>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                                    <Search className="h-5 w-5 text-white/35" />
                                </div>

                                <h2 className="mt-4 text-base font-semibold">
                                    No matching interviews
                                </h2>
                                <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
                                    Try a different search term or remove some
                                    filters to see more interviews.
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className={`${secondaryButton} mt-5`}
                                >
                                    <X className="h-4 w-4" />
                                    Clear filters
                                </button>
                            </div>
                        )}

                    {/* Interview cards */}
                    {!loading && !error && filteredInterviews.length > 0 && (
                        <section>
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-sm font-semibold text-white/85">
                                        Your interviews
                                    </h2>
                                    <p className="mt-1 text-xs text-white/40">
                                        Showing {filteredInterviews.length} of{" "}
                                        {interviews.length}{" "}
                                        {interviews.length === 1
                                            ? "interview"
                                            : "interviews"}
                                    </p>
                                </div>

                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-xs text-violet-300 transition hover:text-violet-200"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
                                {filteredInterviews.map((interview, index) => {
                                    const status = getStatus(interview);
                                    const completed = status === "Completed";
                                    const inProgress = status === "In Progress";
                                    const isDeleting = deletingId === interview._id;

                                    const statusStyle = completed
                                        ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                                        : inProgress
                                            ? "border-sky-400/20 bg-sky-400/[0.08] text-sky-300"
                                            : "border-amber-400/20 bg-amber-400/[0.08] text-amber-200";

                                    return (
                                        <motion.article
                                            key={interview._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.25,
                                                delay: Math.min(index * 0.035, 0.2),
                                            }}
                                            className={`${panelClass} group relative flex min-w-0 flex-col overflow-hidden transition duration-200 hover:border-violet-400/25 hover:bg-[#0d0d16]`}
                                        >
                                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent opacity-0 transition group-hover:opacity-100" />

                                            <div className="p-4 sm:p-5">
                                                {/* Card header */}
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.16] to-violet-500/[0.04]">
                                                        <Sparkles className="h-5 w-5 text-violet-300" />
                                                    </div>

                                                    <div className="min-w-0 flex-1 pt-0.5">
                                                        <h3 className="break-words text-[15px] font-semibold leading-5 text-white/90 sm:text-base">
                                                            {interview.title || "Mock interview"}
                                                        </h3>

                                                        <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-white/45">
                                                            <BriefcaseBusiness className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300/70" />
                                                            <span className="break-words">
                                                                {interview.role || "Role not specified"}
                                                            </span>
                                                        </p>

                                                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/30">
                                                            <CalendarDays className="h-3 w-3 shrink-0" />
                                                            Created {formatDate(interview.createdAt)}
                                                        </p>
                                                    </div>

                                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${statusStyle}`}
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                            {status}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteTarget(interview)}
                                                            disabled={Boolean(deletingId)}
                                                            aria-label={`Delete ${interview.title || "interview"}`}
                                                            title="Delete interview"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/30 transition hover:border-red-400/20 hover:bg-red-500/[0.08] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {isDeleting ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Technologies */}
                                                <div className="mt-5 border-t border-white/[0.055] pt-4">
                                                    <div className="mb-2.5 flex items-center justify-between gap-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/35">
                                                            Technologies
                                                        </p>
                                                        {Array.isArray(interview.technologies) &&
                                                            interview.technologies.length > 0 && (
                                                                <span className="text-[10px] text-white/30">
                                                                    {interview.technologies.length} selected
                                                                </span>
                                                            )}
                                                    </div>

                                                    {Array.isArray(interview.technologies) &&
                                                        interview.technologies.length > 0 ? (
                                                        <div className="flex min-h-7 flex-wrap gap-1.5">
                                                            {interview.technologies
                                                                .slice(0, 4)
                                                                .map((technology) => (
                                                                    <span
                                                                        key={technology}
                                                                        className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-violet-400/[0.12] bg-violet-500/[0.045] px-2.5 py-1.5 text-[11px] text-white/65"
                                                                    >
                                                                        <Code2 className="h-3 w-3 shrink-0 text-violet-300/80" />
                                                                        <span className="max-w-[150px] truncate">
                                                                            {technology}
                                                                        </span>
                                                                    </span>
                                                                ))}

                                                            {interview.technologies.length > 4 && (
                                                                <span className="inline-flex items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-[11px] text-white/40">
                                                                    +{interview.technologies.length - 4} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-white/30">
                                                            No technologies specified
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Metadata grid */}
                                                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                    <MetaItem
                                                        label="Interview type"
                                                        value={interview.interviewType}
                                                        icon={Sparkles}
                                                    />
                                                    <MetaItem
                                                        label="Difficulty"
                                                        value={interview.difficulty}
                                                        icon={SlidersHorizontal}
                                                    />
                                                    <MetaItem
                                                        label="Experience"
                                                        value={interview.experienceLevel}
                                                        icon={BriefcaseBusiness}
                                                    />
                                                </div>
                                            </div>

                                            {/* Consistent card footer */}
                                            <div className="mt-auto border-t border-white/[0.06] bg-white/[0.012] p-4 sm:px-5">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-white/65">
                                                            {completed
                                                                ? "Your evaluation is ready"
                                                                : inProgress
                                                                    ? "Continue where you left off"
                                                                    : "Ready when you are"}
                                                        </p>
                                                        <p className="mt-1 text-[11px] text-white/35">
                                                            {completed
                                                                ? "Review feedback and performance"
                                                                : inProgress
                                                                    ? "Resume your practice session"
                                                                    : "Start your mock interview"}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleInterviewAction(interview)}
                                                        className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:w-auto ${completed
                                                            ? "border border-violet-400/20 bg-violet-500/10 text-violet-200 hover:border-violet-400/35 hover:bg-violet-500/15"
                                                            : "bg-violet-500 text-white shadow-lg shadow-violet-500/10 hover:bg-violet-400"
                                                            }`}
                                                    >
                                                        {completed ? "View results" : inProgress ? "Continue interview" : "Start interview"}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.article>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <footer className="flex flex-col gap-2 py-7 text-center text-[11px] text-white/25 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <p className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
                            <Sparkles className="h-3.5 w-3.5 text-violet-400/70" />
                            Synthex AI
                        </p>
                        <p>Practice with purpose. Improve with every interview.</p>
                    </footer>
                </div>
            </motion.main>

            {/* Delete confirmation modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-6">
                        <motion.button
                            type="button"
                            aria-label="Close delete confirmation"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                if (!deletingId) setDeleteTarget(null);
                            }}
                            className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-md"
                        />

                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-interview-title"
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 8 }}
                            transition={{ duration: 0.18 }}
                            className="relative my-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b0b12] shadow-2xl shadow-black/50"
                        >
                            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-red-500/[0.08] blur-3xl" />

                            <div className="relative p-5 sm:p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/[0.14] bg-red-500/[0.08]">
                                    <AlertTriangle className="h-5 w-5 text-red-300" />
                                </div>

                                <h2
                                    id="delete-interview-title"
                                    className="mt-5 text-lg font-semibold"
                                >
                                    Delete interview?
                                </h2>

                                <p className="mt-2 break-words text-sm leading-6 text-white/45">
                                    Are you sure you want to delete{" "}
                                    <span className="font-medium text-white/80">
                                        "{deleteTarget.title || "Mock interview"}"
                                    </span>
                                    ?
                                </p>

                                <div className="mt-4 rounded-xl border border-red-400/[0.12] bg-red-500/[0.04] p-3.5">
                                    <p className="text-xs leading-5 text-red-200/75">
                                        This action may permanently remove the
                                        interview and its associated questions,
                                        answers, and evaluation data. It cannot
                                        be undone.
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        disabled={Boolean(deletingId)}
                                        onClick={() => setDeleteTarget(null)}
                                        className={`${secondaryButton} flex-1 disabled:opacity-50`}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        disabled={Boolean(deletingId)}
                                        onClick={handleDelete}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/[0.15] bg-red-500/[0.09] px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deletingId ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                Delete interview
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllInterviews;
