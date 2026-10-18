import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
    BarChart3,
    Brain,
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sparkles,
    Sun,
    Target,
    User,
    X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";

const Sidebar = ({ collapsed, setCollapsed, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const [mobileOpen, setMobileOpen] = useState(false);

    const isDark = theme === "dark";

    const themeLabel = isDark ? "Light theme" : "Dark theme";
    const ThemeIcon = isDark ? Sun : Moon;

    useEffect(() => {
        if (!mobileOpen) return;

        const previousOverflow = document.body.style.overflow;
        const previousOverscrollBehavior =
            document.body.style.overscrollBehavior;

        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.overscrollBehavior =
                previousOverscrollBehavior;
        };
    }, [mobileOpen]);

    const handleCollapse = () => {
        const newState = !collapsed;

        setCollapsed(newState);

        try {
            localStorage.setItem(
                "sidebar-collapsed",
                String(newState)
            );
        } catch (error) {
            console.error("Could not save sidebar state:", error);
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        setMobileOpen(false);
        onLogout();
    };

    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/dashboard",
        },
        {
            label: "Interviews",
            icon: FileText,
            path: "/interviews",
        },
        {
            label: "Analytics",
            icon: BarChart3,
            path: "/analytics",
        },
        {
            label: "Target Practice",
            icon: Target,
            path: "/target-practice",
        },
        {
            label: "Learning",
            icon: Brain,
            path: "/learning",
        },
    ];

    const bottomItems = [
        {
            label: "Profile",
            icon: User,
            path: "/profile",
        },
        {
            label: "Settings",
            icon: Settings,
            path: "/settings",
        },
    ];

    const getItemClasses = (active) =>
        `group relative flex w-full items-center rounded-xl px-3 py-3 transition-colors ${active
            ? "bg-violet-500/10 text-violet-500"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        }`;

    const renderNavigationItems = (items, layoutId) =>
        items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
                <motion.button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavigation(item.path)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={getItemClasses(active)}
                >
                    {active && (
                        <motion.div
                            layoutId={layoutId}
                            className="absolute left-0 h-6 w-0.5 rounded-full bg-violet-500"
                        />
                    )}

                    <Icon
                        size={19}
                        strokeWidth={1.7}
                        className="shrink-0"
                    />

                    <span
                        className={`ml-3 text-sm ${collapsed ? "md:hidden" : ""
                            }`}
                    >
                        {item.label}
                    </span>

                    {collapsed && (
                        <span className="pointer-events-none absolute left-16 z-[80] hidden whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block">
                            {item.label}
                        </span>
                    )}
                </motion.button>
            );
        });

    const renderThemeToggle = (isMobile = false) => (
        <motion.button
            type="button"
            onClick={toggleTheme}
            whileTap={{ scale: 0.96 }}
            aria-label={`Switch to ${themeLabel.toLowerCase()}`}
            aria-pressed={!isDark}
            title={themeLabel}
            className={`group relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${isMobile
                ? "h-9 w-9 shrink-0 justify-center"
                : collapsed
                    ? "mx-auto h-10 w-10 justify-center"
                    : "w-full gap-3 px-3 py-3"
                }`}
        >
            <ThemeIcon
                size={19}
                strokeWidth={1.8}
                className="shrink-0 text-violet-500"
            />

            {!isMobile && !collapsed && (
                <>
                    <span className="flex-1 text-left text-sm">
                        {themeLabel}
                    </span>

                    <span className="text-xs text-[var(--text-muted)]">
                        {isDark ? "Dark" : "Light"}
                    </span>
                </>
            )}

            {!isMobile && collapsed && (
                <span className="pointer-events-none absolute left-14 z-[80] hidden whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block">
                    {themeLabel}
                </span>
            )}
        </motion.button>
    );

    return (
        <>
            {/* MOBILE MENU BUTTON */}

            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-lg backdrop-blur-xl transition-colors hover:bg-[var(--surface-hover)] md:hidden"
            >
                <Menu size={20} />
            </button>

            {/* MOBILE OVERLAY */}

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* MOBILE SIDEBAR */}

            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                        }}
                        className="fixed inset-y-0 left-0 z-[70] flex h-screen h-dvh min-h-0 w-[260px] flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl md:hidden"
                    >


                        {/* MOBILE HEADER */}

                        <div className="flex h-20 shrink-0 items-center border-b border-[var(--border)] px-3">
                            {/* LOGO AND BRAND */}
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <motion.div
                                    whileHover={{ rotate: 5, scale: 1.05 }}
                                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10"
                                >
                                    <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-lg" />

                                    <Sparkles
                                        size={20}
                                        strokeWidth={1.6}
                                        className="relative text-violet-500"
                                    />
                                </motion.div>

                                <div className="min-w-0 flex-1">
                                    <div className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                                        Synthex{" "}
                                        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                                            AI
                                        </span>
                                    </div>

                                    <div className="mt-0.5 whitespace-nowrap text-[9px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                                        Interview Intelligence
                                    </div>
                                </div>
                            </div>

                            {/* THEME TOGGLE */}
                            <motion.button
                                type="button"
                                onClick={toggleTheme}
                                whileTap={{ scale: 0.92 }}
                                aria-label={`Switch to ${themeLabel.toLowerCase()}`}
                                aria-pressed={!isDark}
                                title={themeLabel}
                                className="relative ml-1 mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-violet-500 transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                            >
                                <ThemeIcon size={18} strokeWidth={1.8} />
                            </motion.button>

                            {/* CLOSE BUTTON */}
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close navigation menu"
                                className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95"
                            >
                                <X size={20} strokeWidth={1.7} />
                            </button>
                        </div>


                        {/* MOBILE NAVIGATION */}

                        <div className="synthex-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-6">
                            <div className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                Workspace
                            </div>

                            <nav className="space-y-1">
                                {renderNavigationItems(
                                    menuItems,
                                    "activeSidebarMobile"
                                )}
                            </nav>

                            <div className="mb-3 mt-8 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                Account
                            </div>

                            <nav className="space-y-1">
                                {renderNavigationItems(
                                    bottomItems,
                                    "activeSidebarMobileAccount"
                                )}
                            </nav>
                        </div>

                        {/* MOBILE LOGOUT */}

                        <div className="shrink-0 border-t border-[var(--border)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                            <motion.button
                                type="button"
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className="flex w-full items-center rounded-xl px-3 py-3 text-[var(--text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                            >
                                <LogOut size={19} strokeWidth={1.7} />

                                <span className="ml-3 text-sm">
                                    Logout
                                </span>
                            </motion.button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* DESKTOP SIDEBAR */}

            <motion.aside
                animate={{ width: collapsed ? 80 : 260 }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                className="fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-2xl md:flex"
            >
                {/* DESKTOP HEADER */}

                <div
                    className={`flex h-20 shrink-0 items-center border-b border-[var(--border)] ${collapsed ? "justify-center px-2" : "px-5"
                        }`}
                >
                    <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10"
                    >
                        <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-lg" />

                        <Sparkles
                            size={20}
                            strokeWidth={1.6}
                            className="relative text-violet-500"
                        />
                    </motion.div>

                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-3 min-w-0"
                        >
                            <div className="whitespace-nowrap text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                                Synthex{" "}
                                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                                    AI
                                </span>
                            </div>

                            <div className="whitespace-nowrap text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                                Interview Intelligence
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* COLLAPSE BUTTON */}

                <button
                    type="button"
                    onClick={handleCollapse}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className="absolute -right-3 top-[76px] flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] shadow-lg transition-colors hover:text-[var(--text-primary)]"
                >
                    {collapsed ? (
                        <ChevronRight size={14} />
                    ) : (
                        <ChevronLeft size={14} />
                    )}
                </button>

                {/* DESKTOP NAVIGATION */}

                <div className="synthex-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-6">
                    {!collapsed && (
                        <div className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            Workspace
                        </div>
                    )}

                    <nav className="space-y-1">
                        {renderNavigationItems(
                            menuItems,
                            "activeSidebarDesktop"
                        )}
                    </nav>

                    {!collapsed && (
                        <div className="mb-3 mt-8 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            Account
                        </div>
                    )}

                    <nav className="space-y-1">
                        {renderNavigationItems(
                            bottomItems,
                            "activeSidebarDesktopAccount"
                        )}
                    </nav>
                </div>

                {/* DESKTOP THEME TOGGLE */}

                <div className="shrink-0 border-t border-[var(--border)] p-3">
                    {renderThemeToggle(false)}
                </div>

                {/* DESKTOP LOGOUT */}

                <div className="shrink-0 border-t border-[var(--border)] p-3">
                    <motion.button
                        type="button"
                        whileHover={{ x: collapsed ? 0 : 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="group relative flex w-full items-center rounded-xl px-3 py-3 text-[var(--text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                    >
                        <LogOut size={19} strokeWidth={1.7} />

                        {!collapsed && (
                            <span className="ml-3 text-sm">
                                Logout
                            </span>
                        )}

                        {collapsed && (
                            <span className="pointer-events-none absolute left-14 z-[80] hidden whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block">
                                Logout
                            </span>
                        )}
                    </motion.button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
