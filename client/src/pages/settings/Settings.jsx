import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Settings as SettingsIcon,
  User,
  SlidersHorizontal,
  LogOut,
  ShieldCheck,
  Mail,
  Gauge,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";

import Sidebar from "../../components/dashboard/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

import {
  getProfile,
  updateProfile,
} from "../../usecase/user.usecase.js";

import { toast } from "sonner";
import ThemedSelect from "../../components/common/ThemedSelect.jsx";

const Settings = () => {
  const { logout } = useAuth();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    email: "",
    role: "user",
    isVerified: false,
    isActive: true,
    preferredDifficulty: "Medium",
    preferredInterviewType: "Mixed",
  });

  const [initialPreferences, setInitialPreferences] = useState({
    preferredDifficulty: "Medium",
    preferredInterviewType: "Mixed",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        const response = await getProfile();

        const user =
          response?.data?.user ||
          response?.user ||
          null;

        if (user) {
          const difficulty =
            user.preferredDifficulty || "Medium";

          const interviewType =
            user.preferredInterviewType || "Mixed";

          setSettings({
            email: user.email || "",
            role: user.role || "user",
            isVerified: user.isVerified || false,
            isActive:
              user.isActive !== undefined
                ? user.isActive
                : true,
            preferredDifficulty: difficulty,
            preferredInterviewType: interviewType,
          });

          setInitialPreferences({
            preferredDifficulty: difficulty,
            preferredInterviewType: interviewType,
          });
        }
      } catch (error) {
        console.error("Settings Error:", error);

        toast.error(
          error?.response?.data?.message ||
          "Failed to load settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasChanges =
    settings.preferredDifficulty !==
      initialPreferences.preferredDifficulty ||
    settings.preferredInterviewType !==
      initialPreferences.preferredInterviewType;

  const handleSave = async () => {
    if (!hasChanges) {
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        preferredDifficulty:
          settings.preferredDifficulty,

        preferredInterviewType:
          settings.preferredInterviewType,
      });

      setInitialPreferences({
        preferredDifficulty:
          settings.preferredDifficulty,

        preferredInterviewType:
          settings.preferredInterviewType,
      });

      toast.success("Settings updated successfully.");
    } catch (error) {
      console.error("Update Settings Error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to update settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const difficultyOptions = [
    {
      value: "Easy",
      label: "Easy",
    },
    {
      value: "Medium",
      label: "Medium",
    },
    {
      value: "Hard",
      label: "Hard",
    },
  ];

  const interviewTypeOptions = [
    {
      value: "Technical",
      label: "Technical",
    },
    {
      value: "HR",
      label: "HR",
    },
    {
      value: "Behavioral",
      label: "Behavioral",
    },
    {
      value: "Mixed",
      label: "Mixed",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#09090b] text-white">

        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onLogout={handleLogout}
        />

        <motion.main
          className={`flex min-h-screen min-w-0 items-center justify-center overflow-x-hidden pt-16 md:pt-0 ${
            collapsed
              ? "md:ml-20"
              : "md:ml-[260px]"
          } transition-[margin-left] duration-300 ease-in-out`}
        >
          <div className="flex items-center gap-3 text-sm text-zinc-500">

            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />

            Loading settings...

          </div>
        </motion.main>

      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#09090b] text-white">

      {/* ================= SIDEBAR ================= */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
      />

      {/* ================= MAIN ================= */}

      <motion.main
        className={`min-h-screen min-w-0 overflow-x-hidden pt-16 md:pt-0 ${
          collapsed
            ? "md:ml-20"
            : "md:ml-[260px]"
        } transition-[margin-left] duration-300 ease-in-out`}
      >

        <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">

          {/* ================= HEADER ================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-7 min-w-0 sm:mb-8"
          >

            <p className="text-sm text-gray-500">
              Account
            </p>

            <div className="mt-1 flex min-w-0 items-center gap-3">

              <div className="shrink-0 rounded-xl border border-violet-400/20 bg-violet-500/10 p-2.5">

                <SettingsIcon
                  size={20}
                  className="text-violet-400"
                />

              </div>

              <h1 className="truncate text-2xl font-semibold">
                Settings
              </h1>

            </div>

            <p className="mt-2 max-w-2xl text-sm leading-5 text-gray-500">
              Manage your account and interview preferences.
            </p>

          </motion.div>

          <div className="w-full min-w-0 space-y-5 sm:space-y-6">

            {/* ================= ACCOUNT ================= */}

            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] p-5 sm:p-6"
            >

              <div className="mb-5 flex min-w-0 items-center gap-3 sm:mb-6">

                <div className="shrink-0 rounded-xl bg-violet-500/10 p-3">

                  <User
                    size={20}
                    className="text-violet-400"
                  />

                </div>

                <div className="min-w-0">

                  <h2 className="font-semibold">
                    Account
                  </h2>

                  <p className="text-xs text-gray-500">
                    Your account information
                  </p>

                </div>

              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">

                {/* ================= EMAIL ================= */}

                <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">

                  <div className="flex items-center gap-2">

                    <Mail
                      size={16}
                      className="shrink-0 text-violet-400"
                    />

                    <p className="text-xs text-gray-500">
                      Email Address
                    </p>

                  </div>

                  <p className="mt-2 break-all text-sm text-gray-200">
                    {settings.email || "Not available"}
                  </p>

                </div>

                {/* ================= ROLE ================= */}

                <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={16}
                      className="shrink-0 text-violet-400"
                    />

                    <p className="text-xs text-gray-500">
                      Account Role
                    </p>

                  </div>

                  <p className="mt-2 text-sm capitalize text-gray-200">
                    {settings.role || "user"}
                  </p>

                </div>

                {/* ================= VERIFICATION ================= */}

                <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">

                  <div className="flex items-center gap-2">

                    {settings.isVerified ? (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-emerald-400"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="shrink-0 text-amber-400"
                      />
                    )}

                    <p className="text-xs text-gray-500">
                      Verification
                    </p>

                  </div>

                  <p
                    className={`mt-2 text-sm ${
                      settings.isVerified
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {settings.isVerified
                      ? "Verified"
                      : "Not verified"}
                  </p>

                </div>

                {/* ================= STATUS ================= */}

                <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">

                  <div className="flex items-center gap-2">

                    {settings.isActive ? (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-emerald-400"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="shrink-0 text-red-400"
                      />
                    )}

                    <p className="text-xs text-gray-500">
                      Account Status
                    </p>

                  </div>

                  <p
                    className={`mt-2 text-sm ${
                      settings.isActive
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {settings.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>

                </div>

              </div>

            </motion.section>

            {/* ================= INTERVIEW PREFERENCES ================= */}

            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.05,
              }}
              className="w-full min-w-0 overflow-visible rounded-2xl border border-white/10 bg-[#0d0d12] p-5 sm:p-6"
            >

              <div className="mb-5 flex min-w-0 items-center gap-3 sm:mb-6">

                <div className="shrink-0 rounded-xl bg-violet-500/10 p-3">

                  <SlidersHorizontal
                    size={20}
                    className="text-violet-400"
                  />

                </div>

                <div className="min-w-0">

                  <h2 className="font-semibold">
                    Interview Preferences
                  </h2>

                  <p className="text-xs text-gray-500">
                    Set your default interview preferences
                  </p>

                </div>

              </div>

              <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">

                {/* ================= DIFFICULTY ================= */}

                <div className="min-w-0">

                  <label className="mb-2 block text-sm text-gray-400">
                    Preferred Difficulty
                  </label>

                  <ThemedSelect
                    name="preferredDifficulty"
                    value={settings.preferredDifficulty}
                    onChange={(e) =>
                      handleChange(
                        "preferredDifficulty",
                        e.target.value
                      )
                    }
                    options={difficultyOptions}
                    placeholder="Select difficulty"
                    icon={Gauge}
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Used as your default interview difficulty.
                  </p>

                </div>

                {/* ================= INTERVIEW TYPE ================= */}

                <div className="min-w-0">

                  <label className="mb-2 block text-sm text-gray-400">
                    Preferred Interview Type
                  </label>

                  <ThemedSelect
                    name="preferredInterviewType"
                    value={settings.preferredInterviewType}
                    onChange={(e) =>
                      handleChange(
                        "preferredInterviewType",
                        e.target.value
                      )
                    }
                    options={interviewTypeOptions}
                    placeholder="Select interview type"
                    icon={MessageSquare}
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Used as your default interview format.
                  </p>

                </div>

              </div>

              {/* ================= SAVE ================= */}

              <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-end">

                {hasChanges && (
                  <p className="text-center text-xs text-gray-500 sm:mr-auto sm:text-left">
                    You have unsaved changes.
                  </p>
                )}

                {!hasChanges && (
                  <p className="text-center text-xs text-gray-600 sm:mr-auto sm:text-left">
                    Preferences are up to date.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >

                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </motion.section>

            {/* ================= APPLICATION ================= */}

            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] p-5 sm:p-6"
            >

              <div className="mb-5 flex min-w-0 items-center gap-3 sm:mb-6">

                <div className="shrink-0 rounded-xl bg-violet-500/10 p-3">

                  <SettingsIcon
                    size={20}
                    className="text-violet-400"
                  />

                </div>

                <div className="min-w-0">

                  <h2 className="font-semibold">
                    Application
                  </h2>

                  <p className="text-xs text-gray-500">
                    Synthex AI application information
                  </p>

                </div>

              </div>

              <div className="min-w-0 space-y-3">

                {/* Theme */}

                <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <span className="text-sm text-gray-400">
                    Theme
                  </span>

                  <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-gray-300">
                    Dark
                  </span>

                </div>

                {/* Application */}

                <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                  <span className="text-sm text-gray-400">
                    Application
                  </span>

                  <span className="shrink-0 text-sm text-gray-200">
                    Synthex AI
                  </span>

                </div>

              </div>

            </motion.section>

            {/* ================= ACCOUNT ACTIONS ================= */}

            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
              }}
              className="w-full min-w-0 overflow-visible rounded-2xl border border-white/10 bg-[#0d0d12] p-5 sm:p-6"
            >

              <div className="mb-5">

                <h2 className="font-semibold">
                  Account Actions
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Manage your current session.
                </p>

              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300 transition hover:bg-red-500/10 sm:w-auto"
              >

                <LogOut size={17} />

                Logout

              </button>

            </motion.section>

          </div>

        </div>

      </motion.main>

    </div>
  );
};

export default Settings;