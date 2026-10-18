import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    AlertTriangle,
    ArrowLeft,
    Briefcase,
    Check,
    FileText,
    Gauge,
    GraduationCap,
    Image as ImageIcon,
    Loader2,
    Mail,
    MessageSquare,
    Save,
    Target,
    Trash2,
    User,
    Wrench,
    X,
    RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Sidebar from "../../components/dashboard/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemedSelect from "../../components/common/ThemedSelect.jsx";

import {
    getProfile,
    removeProfilePicture,
    updateProfile,
} from "../../usecase/user.usecase.js";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_BIO_LENGTH = 300;
const MAX_COMPANY_LENGTH = 100;
const MAX_LIST_ITEM_LENGTH = 100;
const MAX_LIST_ITEMS = 30;

const EMPTY_FORM = {
    fullName: "",
    email: "",
    profilePicture: "",
    bio: "",
    selectedRole: "",
    experienceLevel: "",
    targetCompany: "",
    skills: [],
    learningGoals: [],
    preferredDifficulty: "Medium",
    preferredInterviewType: "Mixed",
};

const ROLE_OPTIONS = [
    { value: "Frontend Developer", label: "Frontend Developer" },
    { value: "Backend Developer", label: "Backend Developer" },
    { value: "Full Stack Developer", label: "Full Stack Developer" },
    { value: "Java Developer", label: "Java Developer" },
    { value: "Python Developer", label: "Python Developer" },
    { value: "Data Analyst", label: "Data Analyst" },
    { value: "DevOps Engineer", label: "DevOps Engineer" },
    { value: "UI/UX Designer", label: "UI/UX Designer" },
];

const EXPERIENCE_OPTIONS = [
    { value: "Student", label: "Student" },
    { value: "Fresher", label: "Fresher" },
    { value: "1-2 Years", label: "1-2 Years" },
    { value: "3-5 Years", label: "3-5 Years" },
    { value: "5+ Years", label: "5+ Years" },
];

const DIFFICULTY_OPTIONS = [
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
];

const INTERVIEW_TYPE_OPTIONS = [
    { value: "Technical", label: "Technical" },
    { value: "HR", label: "HR" },
    { value: "Behavioral", label: "Behavioral" },
    { value: "Mixed", label: "Mixed" },
];

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message ||
    error?.message ||
    fallback;

const getProfileFromResponse = (response) =>
    response?.data?.user ??
    response?.user ??
    response?.data?.profile ??
    response?.profile ??
    null;

const normalizeProfile = (user = {}) => ({
    ...EMPTY_FORM,
    ...user,
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    profilePicture: user?.profilePicture ?? "",
    bio: user?.bio ?? "",
    selectedRole: user?.selectedRole ?? "",
    experienceLevel: user?.experienceLevel ?? "",
    targetCompany: user?.targetCompany ?? "",
    skills: Array.isArray(user?.skills)
        ? [...user.skills]
        : [],
    learningGoals: Array.isArray(user?.learningGoals)
        ? [...user.learningGoals]
        : [],
    preferredDifficulty: user?.preferredDifficulty || "Medium",
    preferredInterviewType:
        user?.preferredInterviewType || "Mixed",
});

const revokeBlobUrl = (url) => {
    if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
    }
};

const getComparableForm = (form) => ({
    fullName: form.fullName,
    email: form.email,
    profilePicture: form.profilePicture,
    bio: form.bio,
    selectedRole: form.selectedRole,
    experienceLevel: form.experienceLevel,
    targetCompany: form.targetCompany,
    skills: form.skills,
    learningGoals: form.learningGoals,
    preferredDifficulty: form.preferredDifficulty,
    preferredInterviewType: form.preferredInterviewType,
});

/* =========================================================
   EDIT PROFILE
========================================================= */

const EditProfile = () => {
    const navigate = useNavigate();
    const { logout, refreshUser } = useAuth();

    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem("sidebar-collapsed") === "true"
    );

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [initialFormData, setInitialFormData] = useState(null);

    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] =
        useState("");
    const [pictureRemoved, setPictureRemoved] = useState(false);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);

    const [removePictureModalOpen, setRemovePictureModalOpen] =
        useState(false);
    const [removingPicture, setRemovingPicture] = useState(false);

    const [retryCount, setRetryCount] = useState(0);

    /* =====================================================
       SIDEBAR SYNC
    ===================================================== */

    useEffect(() => {
        const syncSidebar = () => {
            setCollapsed(
                localStorage.getItem("sidebar-collapsed") === "true"
            );
        };

        window.addEventListener("storage", syncSidebar);

        return () => {
            window.removeEventListener("storage", syncSidebar);
        };
    }, []);

    /* =====================================================
       FETCH PROFILE
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            setLoading(true);
            setLoadError("");

            try {
                const response = await getProfile();
                const user = getProfileFromResponse(response);

                if (!user || typeof user !== "object") {
                    throw new Error("Unable to load your profile.");
                }

                const normalizedProfile = normalizeProfile(user);

                if (!isMounted) return;

                setFormData(normalizedProfile);
                setInitialFormData(normalizedProfile);

                setProfilePicture(null);
                setPictureRemoved(false);
                setProfilePicturePreview(
                    normalizedProfile.profilePicture
                );
            } catch (error) {
                console.error("Fetch Profile Error:", error);

                const message = getErrorMessage(
                    error,
                    "Failed to load your profile."
                );

                if (isMounted) {
                    setLoadError(message);
                    toast.error(message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [retryCount]);

    /* =====================================================
       FORM CHANGE HANDLERS
    ===================================================== */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSelectChange = (fieldName, selectedValue) => {
        const value =
            typeof selectedValue === "string"
                ? selectedValue
                : selectedValue?.value ??
                selectedValue?.target?.value ??
                "";

        setFormData((previous) => ({
            ...previous,
            [fieldName]: String(value).trim(),
        }));
    };

    /* =====================================================
       UNSAVED CHANGES
    ===================================================== */

    const hasChanges = useMemo(() => {
        if (!initialFormData) return false;

        const current = getComparableForm(formData);
        const initial = getComparableForm(initialFormData);

        return (
            JSON.stringify(current) !== JSON.stringify(initial) ||
            profilePicture !== null ||
            pictureRemoved
        );
    }, [
        formData,
        initialFormData,
        profilePicture,
        pictureRemoved,
    ]);

    /* =====================================================
       PROFILE PICTURE
    ===================================================== */

    const handleProfilePictureChange = (event) => {
        const file = event.target.files?.[0];

        // Permit choosing the same image again.
        event.target.value = "";

        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Choose a JPG, PNG, or WEBP image.");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toast.error("Image size must be less than 5 MB.");
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setProfilePicture(file);
        setProfilePicturePreview(previewUrl);
        setPictureRemoved(false);
    };

    const handleRemoveProfilePicture = async () => {
        if (removingPicture) return;

        const hasSavedPicture = Boolean(formData.profilePicture);
        const hasNewPicture = Boolean(profilePicture);

        try {
            setRemovingPicture(true);

            /*
             * If the user selected a new image, discard that selection
             * without deleting the previously saved server image.
             *
             * If there is a saved image and no new local selection,
             * call the existing API to remove the saved image.
             */
            if (hasSavedPicture && !hasNewPicture) {
                const response = await removeProfilePicture();

                if (response?.success === false) {
                    throw new Error(
                        response?.message ||
                        "Failed to remove profile picture."
                    );
                }
            }

            const previousPreview = profilePicturePreview;

            setProfilePicture(null);
            setProfilePicturePreview("");
            setPictureRemoved(true);

            setFormData((previous) => ({
                ...previous,
                profilePicture: "",
            }));

            setInitialFormData((previous) =>
                previous
                    ? {
                        ...previous,
                        profilePicture: "",
                    }
                    : previous
            );

            setRemovePictureModalOpen(false);

            revokeBlobUrl(previousPreview);

            toast.success(
                hasSavedPicture && !hasNewPicture
                    ? "Profile picture removed successfully."
                    : "Profile picture selection removed."
            );
        } catch (error) {
            console.error("Remove Profile Picture Error:", error);

            toast.error(
                getErrorMessage(
                    error,
                    "Failed to remove profile picture."
                )
            );
        } finally {
            setRemovingPicture(false);
        }
    };

    /* =====================================================
       CLEAN UP TEMPORARY IMAGE URL
    ===================================================== */

    useEffect(() => {
        return () => {
            revokeBlobUrl(profilePicturePreview);
        };
    }, [profilePicturePreview]);

    /* =====================================================
       SKILLS AND LEARNING GOALS
    ===================================================== */

    const addListItem = (event, fieldName, label) => {
        if (event.key !== "Enter") return;

        event.preventDefault();

        const input = event.currentTarget;
        const value = input.value.trim();

        if (!value) return;

        if (value.length > MAX_LIST_ITEM_LENGTH) {
            toast.error(
                `${label} cannot exceed ${MAX_LIST_ITEM_LENGTH} characters.`
            );
            return;
        }

        const existingItems = formData[fieldName];

        if (existingItems.length >= MAX_LIST_ITEMS) {
            toast.error(
                `You can add up to ${MAX_LIST_ITEMS} ${label.toLowerCase()} items.`
            );
            return;
        }

        const alreadyExists = existingItems.some(
            (item) =>
                item.trim().toLowerCase() === value.toLowerCase()
        );

        if (alreadyExists) {
            toast.error(`${label} already added.`);
            input.value = "";
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [fieldName]: [...previous[fieldName], value],
        }));

        input.value = "";
    };

    const removeListItem = (fieldName, index) => {
        setFormData((previous) => ({
            ...previous,
            [fieldName]: previous[fieldName].filter(
                (_, itemIndex) => itemIndex !== index
            ),
        }));
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        const fullName = formData.fullName.trim();
        const bio = formData.bio.trim();
        const targetCompany = formData.targetCompany.trim();

        if (fullName.length < 3) {
            toast.error("Full name must be at least 3 characters.");
            return false;
        }

        if (fullName.length > 50) {
            toast.error("Full name cannot exceed 50 characters.");
            return false;
        }

        if (bio.length > MAX_BIO_LENGTH) {
            toast.error(
                `Bio cannot exceed ${MAX_BIO_LENGTH} characters.`
            );
            return false;
        }

        if (targetCompany.length > MAX_COMPANY_LENGTH) {
            toast.error(
                `Target company cannot exceed ${MAX_COMPANY_LENGTH} characters.`
            );
            return false;
        }

        const selectedRole = String(
            formData.selectedRole ?? ""
        ).trim();

        const experienceLevel = String(
            formData.experienceLevel ?? ""
        ).trim();

        if (
            !ROLE_OPTIONS.some(
                (option) => option.value === selectedRole
            )
        ) {
            toast.error("Please select a valid target role.");
            return false;
        }

        if (
            !EXPERIENCE_OPTIONS.some(
                (option) => option.value === experienceLevel
            )
        ) {
            toast.error("Please select a valid experience level.");
            return false;
        }

        if (
            !DIFFICULTY_OPTIONS.some(
                (option) =>
                    option.value === formData.preferredDifficulty
            )
        ) {
            toast.error("Please select a valid interview difficulty.");
            return false;
        }

        if (
            !INTERVIEW_TYPE_OPTIONS.some(
                (option) =>
                    option.value === formData.preferredInterviewType
            )
        ) {
            toast.error("Please select a valid interview type.");
            return false;
        }

        return true;
    };

    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving || !hasChanges) return;

        if (!validateForm()) return;

        try {
            setSaving(true);

            const payload = {
                fullName: formData.fullName.trim(),
                bio: formData.bio.trim(),
                selectedRole: formData.selectedRole.trim(),
                experienceLevel: formData.experienceLevel.trim(),
                targetCompany: formData.targetCompany.trim(),
                skills: formData.skills
                    .map((skill) => skill.trim())
                    .filter(Boolean),
                learningGoals: formData.learningGoals
                    .map((goal) => goal.trim())
                    .filter(Boolean),
                preferredDifficulty: formData.preferredDifficulty,
                preferredInterviewType: formData.preferredInterviewType,
                profilePicture:
                    profilePicture instanceof File
                        ? profilePicture
                        : null,
            };

            const response = await updateProfile(payload);

            if (response?.success === false) {
                throw new Error(
                    response.message || "Failed to update profile."
                );
            }

            /*
             * The update has succeeded at this point.
             * A subsequent refresh failure should not tell the user
             * that the profile update itself failed.
             */
            toast.success(
                response?.message || "Profile updated successfully."
            );

            let normalizedProfile = normalizeProfile({
                ...formData,
                fullName: payload.fullName,
                bio: payload.bio,
                selectedRole: payload.selectedRole,
                experienceLevel: payload.experienceLevel,
                targetCompany: payload.targetCompany,
                skills: payload.skills,
                learningGoals: payload.learningGoals,
                preferredDifficulty: payload.preferredDifficulty,
                preferredInterviewType: payload.preferredInterviewType,
            });

            try {
                const refreshedResponse = await getProfile();
                const refreshedUser =
                    getProfileFromResponse(refreshedResponse);

                if (
                    refreshedUser &&
                    typeof refreshedUser === "object"
                ) {
                    normalizedProfile = normalizeProfile(refreshedUser);
                }
            } catch (refreshError) {
                console.error(
                    "Refresh Profile After Update Error:",
                    refreshError
                );
            }

            setFormData(normalizedProfile);
            setInitialFormData(normalizedProfile);

            setProfilePicture(null);
            setPictureRemoved(false);
            setProfilePicturePreview(
                normalizedProfile.profilePicture
            );

            try {
                await refreshUser();
            } catch (authRefreshError) {
                console.error(
                    "Refresh Authentication User Error:",
                    authRefreshError
                );
            }

            navigate("/profile", { replace: true });
        } catch (error) {
            console.error("Update Profile Error:", error);

            toast.error(
                getErrorMessage(error, "Failed to update profile.")
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       LOADING STATE
    ===================================================== */

    if (loading) {
        return (
            <PageLayout
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                logout={logout}
            >
                <div className="flex min-h-[70vh] flex-col items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-500/[0.07]">
                        <Loader2
                            size={28}
                            className="animate-spin text-violet-400"
                        />
                    </div>

                    <p className="mt-4 text-sm font-medium text-zinc-300">
                        Loading your profile
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                        Please wait a moment...
                    </p>
                </div>
            </PageLayout>
        );
    }

    /* =====================================================
       ERROR STATE
    ===================================================== */

    if (loadError && !initialFormData) {
        return (
            <PageLayout
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                logout={logout}
            >
                <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/10 bg-red-500/[0.07]">
                        <AlertTriangle
                            size={24}
                            className="text-red-400"
                        />
                    </div>

                    <h1 className="mt-5 text-lg font-semibold text-white">
                        Unable to load profile
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {loadError}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setRetryCount((previous) => previous + 1)
                        }
                        disabled={loading}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2
                                size={15}
                                className="animate-spin"
                            />
                        ) : (
                            <RefreshCw size={15} />
                        )}

                        {loading ? "Retrying..." : "Try Again"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="mt-3 text-sm text-zinc-500 transition hover:text-white"
                    >
                        Return to Profile
                    </button>
                </div>
            </PageLayout>
        );
    }

    /* =====================================================
       MAIN
    ===================================================== */

    return (
        <PageLayout
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            logout={logout}
        >
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
                {/* PAGE HEADER */}

                <div className="mb-7 flex items-center gap-3 sm:mb-9 sm:gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        aria-label="Back to profile"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs text-zinc-600">
                                Account Settings
                            </p>

                            {hasChanges && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/10 bg-amber-400/[0.06] px-2 py-0.5 text-[10px] font-medium text-amber-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    Unsaved changes
                                </span>
                            )}
                        </div>

                        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                            Edit Profile
                        </h1>

                        <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
                            Keep your profile and career preferences up to date.
                        </p>
                    </div>
                </div>

                {/* FORM CARD */}

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-visible rounded-2xl border border-white/[0.07] bg-[#0d0d12] shadow-xl shadow-black/10"
                >
                    {/* CARD HEADER */}

                    <div className="border-b border-white/[0.06] px-5 py-5 sm:px-8 sm:py-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.08]">
                                <User
                                    size={18}
                                    className="text-violet-300"
                                />
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-semibold text-white">
                                    Personal Information
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
                                    Customize your account, career profile,
                                    skills, and interview preferences.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
                            {/* PROFILE PICTURE */}

                            <FormSection
                                icon={ImageIcon}
                                title="Profile Picture"
                                description="Choose a clear image for your account."
                            >
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                                        {profilePicturePreview ? (
                                            <img
                                                src={profilePicturePreview}
                                                alt="Profile preview"
                                                className="h-full w-full object-cover"
                                                onError={() => {
                                                    toast.error(
                                                        "Unable to display this profile image."
                                                    );
                                                }}
                                            />
                                        ) : (
                                            <span className="text-2xl font-semibold text-violet-300">
                                                {formData.fullName
                                                    .trim()
                                                    .charAt(0)
                                                    .toUpperCase() || (
                                                        <User size={30} />
                                                    )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white">
                                            Your profile image
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            JPG, PNG, or WEBP. Maximum 5 MB.
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white">
                                                <ImageIcon size={15} />
                                                Choose Image

                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    onChange={
                                                        handleProfilePictureChange
                                                    }
                                                    disabled={saving || removingPicture}
                                                    className="sr-only"
                                                />
                                            </label>

                                            {profilePicturePreview && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRemovePictureModalOpen(
                                                            true
                                                        )
                                                    }
                                                    disabled={saving || removingPicture}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/10 bg-red-500/[0.05] px-3.5 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Trash2 size={15} />
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </FormSection>

                            {/* BASIC INFORMATION */}

                            <FormSection
                                icon={User}
                                title="Basic Information"
                                description="Manage your personal account details."
                            >
                                <div className="grid grid-cols-1 gap-5">
                                    <FormField
                                        label="Full Name"
                                        required
                                    >
                                        <div className="relative">
                                            <User
                                                size={17}
                                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                            />

                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                                minLength={3}
                                                maxLength={50}
                                                autoComplete="name"
                                                placeholder="Enter your full name"
                                                className={inputClass("pl-11")}
                                            />
                                        </div>
                                    </FormField>

                                    <FormField
                                        label="Email Address"
                                        hint="Your email address cannot be changed here."
                                    >
                                        <div className="relative">
                                            <Mail
                                                size={17}
                                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                            />

                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                readOnly
                                                autoComplete="email"
                                                className={`${inputClass("pl-11")} cursor-not-allowed text-zinc-600`}
                                            />
                                        </div>
                                    </FormField>

                                    <FormField
                                        label="Bio"
                                        hint="Write a short, professional introduction."
                                        trailing={
                                            <span
                                                className={
                                                    formData.bio.length >=
                                                        MAX_BIO_LENGTH
                                                        ? "text-amber-400"
                                                        : "text-zinc-600"
                                                }
                                            >
                                                {formData.bio.length}/
                                                {MAX_BIO_LENGTH}
                                            </span>
                                        }
                                    >
                                        <div className="relative">
                                            <FileText
                                                size={17}
                                                className="pointer-events-none absolute left-4 top-4 text-zinc-600"
                                            />

                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                rows={4}
                                                maxLength={MAX_BIO_LENGTH}
                                                placeholder="Tell us about yourself..."
                                                className={`${inputClass("pl-11")} min-h-28 resize-y leading-6`}
                                            />
                                        </div>
                                    </FormField>
                                </div>
                            </FormSection>

                            {/* CAREER PROFILE */}

                            <FormSection
                                icon={Briefcase}
                                title="Career Profile"
                                description="Set your target role and career direction."
                            >
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FormField label="Target Role">
                                        <ThemedSelect
                                            name="selectedRole"
                                            value={formData.selectedRole}
                                            onChange={(value) =>
                                                handleSelectChange(
                                                    "selectedRole",
                                                    value
                                                )
                                            }
                                            options={ROLE_OPTIONS}
                                            placeholder="Select target role"
                                            icon={Briefcase}
                                        />
                                    </FormField>

                                    <FormField label="Experience Level">
                                        <ThemedSelect
                                            name="experienceLevel"
                                            value={formData.experienceLevel}
                                            onChange={(value) =>
                                                handleSelectChange(
                                                    "experienceLevel",
                                                    value
                                                )
                                            }
                                            options={EXPERIENCE_OPTIONS}
                                            placeholder="Select experience"
                                            icon={GraduationCap}
                                        />
                                    </FormField>

                                    <div className="md:col-span-2">
                                        <FormField label="Target Company">
                                            <div className="relative">
                                                <Target
                                                    size={17}
                                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                                />

                                                <input
                                                    type="text"
                                                    name="targetCompany"
                                                    value={formData.targetCompany}
                                                    onChange={handleChange}
                                                    maxLength={MAX_COMPANY_LENGTH}
                                                    placeholder="e.g. Google, Microsoft, TCS"
                                                    className={inputClass("pl-11")}
                                                />
                                            </div>
                                        </FormField>
                                    </div>
                                </div>
                            </FormSection>

                            {/* SKILLS */}

                            <FormSection
                                icon={Wrench}
                                title="Skills"
                                description="Highlight the skills you already have."
                            >
                                <ListEditor
                                    placeholder="Type a skill and press Enter"
                                    items={formData.skills}
                                    onAdd={(event) =>
                                        addListItem(event, "skills", "Skill")
                                    }
                                    renderItem={(skill, index) => (
                                        <span
                                            key={`${skill}-${index}`}
                                            className="inline-flex max-w-full items-center gap-2 rounded-xl border border-violet-400/10 bg-violet-500/[0.07] py-1.5 pl-3 pr-2 text-xs text-violet-300"
                                        >
                                            <span className="break-words">
                                                {skill}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeListItem(
                                                        "skills",
                                                        index
                                                    )
                                                }
                                                aria-label={`Remove skill ${skill}`}
                                                className="shrink-0 rounded-md p-0.5 text-violet-300/60 transition hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    )}
                                    emptyMessage="Your skills will appear here."
                                />
                            </FormSection>

                            {/* LEARNING GOALS */}

                            <FormSection
                                icon={Target}
                                title="Learning Goals"
                                description="Track the areas you want to improve."
                            >
                                <ListEditor
                                    placeholder="Type a learning goal and press Enter"
                                    items={formData.learningGoals}
                                    onAdd={(event) =>
                                        addListItem(
                                            event,
                                            "learningGoals",
                                            "Learning goal"
                                        )
                                    }
                                    renderItem={(goal, index) => (
                                        <div
                                            key={`${goal}-${index}`}
                                            className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
                                        >
                                            <span className="min-w-0 break-words text-sm leading-5 text-zinc-400">
                                                {goal}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeListItem(
                                                        "learningGoals",
                                                        index
                                                    )
                                                }
                                                aria-label={`Remove learning goal ${goal}`}
                                                className="shrink-0 rounded-lg p-1 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    )}
                                    emptyMessage="Your learning goals will appear here."
                                />
                            </FormSection>

                            {/* INTERVIEW PREFERENCES */}

                            <FormSection
                                icon={GraduationCap}
                                title="Interview Preferences"
                                description="Customize your preferred mock interview experience."
                            >
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FormField label="Preferred Difficulty">
                                        <ThemedSelect
                                            name="preferredDifficulty"
                                            value={
                                                formData.preferredDifficulty
                                            }
                                            onChange={(value) =>
                                                handleSelectChange(
                                                    "preferredDifficulty",
                                                    value
                                                )
                                            }
                                            options={DIFFICULTY_OPTIONS}
                                            placeholder="Select difficulty"
                                            icon={Gauge}
                                        />
                                    </FormField>

                                    <FormField label="Preferred Interview Type">
                                        <ThemedSelect
                                            name="preferredInterviewType"
                                            value={
                                                formData.preferredInterviewType
                                            }
                                            onChange={(value) =>
                                                handleSelectChange(
                                                    "preferredInterviewType",
                                                    value
                                                )
                                            }
                                            options={INTERVIEW_TYPE_OPTIONS}
                                            placeholder="Select interview type"
                                            icon={MessageSquare}
                                        />
                                    </FormField>
                                </div>
                            </FormSection>
                        </div>

                        {/* FORM ACTIONS */}

                        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] bg-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                disabled={saving || removingPicture}
                                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving || removingPicture || !hasChanges}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                            >
                                {saving ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Saving Changes...
                                    </>
                                ) : hasChanges ? (
                                    <>
                                        <Save size={17} />
                                        Save Changes
                                    </>
                                ) : (
                                    <>
                                        <Check size={17} />
                                        No Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                <p className="mt-5 text-center text-xs leading-5 text-zinc-700">
                    Your profile information helps personalize your Synthex AI experience.
                </p>
            </div>

            {/* REMOVE PICTURE MODAL */}

            {removePictureModalOpen && (
                <RemovePictureModal
                    loading={removingPicture}
                    onClose={() => setRemovePictureModalOpen(false)}
                    onConfirm={handleRemoveProfilePicture}
                />
            )}
        </PageLayout>
    );
};

/* =========================================================
   PAGE LAYOUT
========================================================= */

const PageLayout = ({
    collapsed,
    setCollapsed,
    logout,
    children,
}) => (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#05050a] text-white">
        <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLogout={logout}
        />

        <motion.main
            className={`min-h-screen min-w-0 overflow-x-hidden pt-16 transition-[margin-left] duration-300 ease-in-out md:pt-0 ${collapsed ? "md:ml-20" : "md:ml-[260px]"
                }`}
        >
            {children}
        </motion.main>
    </div>
);

/* =========================================================
   FORM SECTION
========================================================= */

const FormSection = ({
    icon: Icon,
    title,
    description,
    children,
}) => (
    <section className="min-w-0 border-b border-white/[0.06] pb-8 last:border-b-0 last:pb-0">
        <div className="mb-5 flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/[0.08] bg-violet-500/[0.08]">
                <Icon size={17} className="text-violet-300" />
            </div>

            <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white sm:text-base">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {description}
                </p>
            </div>
        </div>

        {children}
    </section>
);

/* =========================================================
   FORM FIELD
========================================================= */

const FormField = ({
    label,
    required = false,
    hint,
    trailing,
    children,
}) => (
    <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm text-zinc-400">
                {label}

                {required && (
                    <span className="ml-1 text-violet-400">*</span>
                )}
            </label>

            {trailing}
        </div>

        {children}

        {hint && (
            <p className="mt-2 text-xs leading-5 text-zinc-600">
                {hint}
            </p>
        )}
    </div>
);

/* =========================================================
   INPUT STYLE
========================================================= */

const inputClass = (extra = "") =>
    `w-full min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500/50 focus:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60 ${extra}`;

/* =========================================================
   LIST EDITOR
========================================================= */

const ListEditor = ({
    placeholder,
    items,
    onAdd,
    renderItem,
    emptyMessage,
}) => (
    <div className="min-w-0">
        <input
            type="text"
            onKeyDown={onAdd}
            maxLength={MAX_LIST_ITEM_LENGTH}
            placeholder={placeholder}
            className={inputClass()}
            aria-label={placeholder}
        />

        <p className="mt-2 text-xs text-zinc-600">
            Press Enter to add an item. Maximum {MAX_LIST_ITEM_LENGTH} characters per item.
        </p>

        {items.length > 0 ? (
            <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                {items.map((item, index) => renderItem(item, index))}
            </div>
        ) : (
            <p className="mt-3 rounded-xl border border-dashed border-white/[0.07] px-4 py-3 text-xs text-zinc-600">
                {emptyMessage}
            </p>
        )}
    </div>
);

/* =========================================================
   REMOVE PICTURE MODAL
========================================================= */

const RemovePictureModal = ({
    loading,
    onClose,
    onConfirm,
}) => {
    const handleClose = useCallback(() => {
        if (!loading) onClose();
    }, [loading, onClose]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="remove-picture-title"
                aria-describedby="remove-picture-description"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111113] shadow-2xl shadow-black/50"
            >
                <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-red-500/10 blur-[80px]" />

                <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    aria-label="Close dialog"
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                >
                    <X size={17} />
                </button>

                <div className="relative p-6 sm:p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/10 bg-red-500/[0.08] text-red-400">
                        <AlertTriangle size={21} />
                    </div>

                    <h3
                        id="remove-picture-title"
                        className="mt-5 text-lg font-semibold text-white"
                    >
                        Remove Profile Picture?
                    </h3>

                    <p
                        id="remove-picture-description"
                        className="mt-2 text-sm leading-6 text-zinc-500"
                    >
                        Are you sure you want to remove your current profile
                        picture? Your initials will be shown instead.
                    </p>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Removing...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Remove Picture
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EditProfile;