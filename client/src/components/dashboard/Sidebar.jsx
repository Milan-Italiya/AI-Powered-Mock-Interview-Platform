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
    Settings,
    Sparkles,
    Target,
    User,
    X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({
    collapsed,
    setCollapsed,
    onLogout,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);

    // Lock background scrolling while the mobile sidebar is open.
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
        localStorage.setItem(
            "sidebar-collapsed",
            String(newState)
        );
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

    return (
        <>
            {/* MOBILE MENU BUTTON */}

            <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#11111a]/95 text-zinc-400 shadow-lg backdrop-blur-xl transition-colors hover:text-white md:hidden"
            >
                <Menu size={20} />
            </button>

            {/* MOBILE OVERLAY
                Fixed to the viewport, independent of sidebar scrolling. */}

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
                        className="fixed inset-y-0 left-0 z-[70] flex h-screen h-dvh min-h-0 w-[260px] flex-col overflow-hidden border-r border-white/[0.07] bg-[#08080f] shadow-2xl md:hidden"
                    >
                        {/* MOBILE LOGO */}

                        <div className="relative flex h-20 shrink-0 items-center border-b border-white/[0.07] px-5">
                            <motion.div
                                whileHover={{
                                    rotate: 5,
                                    scale: 1.05,
                                }}
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10"
                            >
                                <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-lg" />

                                <Sparkles
                                    size={20}
                                    strokeWidth={1.6}
                                    className="relative text-violet-300"
                                />
                            </motion.div>

                            <div className="ml-3 min-w-0">
                                <div className="whitespace-nowrap text-lg font-semibold tracking-tight">
                                    Synthex{" "}
                                    <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                                        AI
                                    </span>
                                </div>

                                <div className="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                                    Interview Intelligence
                                </div>
                            </div>

                            <button
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close navigation menu"
                                className="ml-auto -mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* MOBILE NAVIGATION
                            Only this area scrolls. */}

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-6">
                            <div className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                                Workspace
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active =
                                        location.pathname === item.path;

                                    return (
                                        <motion.button
                                            key={item.label}
                                            onClick={() =>
                                                handleNavigation(item.path)
                                            }
                                            whileHover={{ x: 3 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group relative flex w-full items-center rounded-xl px-3 py-3 transition-all ${
                                                active
                                                    ? "bg-violet-500/10 text-violet-300"
                                                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                                            }`}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="activeSidebarMobile"
                                                    className="absolute left-0 h-6 w-0.5 rounded-full bg-violet-400"
                                                />
                                            )}

                                            <Icon
                                                size={19}
                                                strokeWidth={1.7}
                                                className="shrink-0"
                                            />

                                            <span className="ml-3 text-sm">
                                                {item.label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </nav>

                            {/* ACCOUNT */}

                            <div className="mb-3 mt-8 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                                Account
                            </div>

                            <nav className="space-y-1">
                                {bottomItems.map((item) => {
                                    const Icon = item.icon;
                                    const active =
                                        location.pathname === item.path;

                                    return (
                                        <motion.button
                                            key={item.label}
                                            onClick={() =>
                                                handleNavigation(item.path)
                                            }
                                            whileHover={{ x: 3 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group relative flex w-full items-center rounded-xl px-3 py-3 transition-all ${
                                                active
                                                    ? "bg-violet-500/10 text-violet-300"
                                                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                                            }`}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="activeSidebarMobileAccount"
                                                    className="absolute left-0 h-6 w-0.5 rounded-full bg-violet-400"
                                                />
                                            )}

                                            <Icon
                                                size={19}
                                                strokeWidth={1.7}
                                                className="shrink-0"
                                            />

                                            <span className="ml-3 text-sm">
                                                {item.label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* MOBILE LOGOUT */}

                        <div className="shrink-0 border-t border-white/[0.07] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                            <motion.button
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className="group relative flex w-full items-center rounded-xl px-3 py-3 text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-300"
                            >
                                <LogOut
                                    size={19}
                                    strokeWidth={1.7}
                                />

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
                animate={{
                    width: collapsed ? 80 : 260,
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                className="fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-white/[0.07] bg-[#08080f]/90 backdrop-blur-2xl md:flex"
            >
                {/* DESKTOP LOGO */}

                <div className="flex h-20 shrink-0 items-center border-b border-white/[0.07] px-5">
                    <motion.div
                        whileHover={{
                            rotate: 5,
                            scale: 1.05,
                        }}
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10"
                    >
                        <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-lg" />

                        <Sparkles
                            size={20}
                            strokeWidth={1.6}
                            className="relative text-violet-300"
                        />
                    </motion.div>

                    {!collapsed && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -10,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            className="ml-3"
                        >
                            <div className="text-lg font-semibold tracking-tight">
                                Synthex{" "}
                                <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                                    AI
                                </span>
                            </div>

                            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                                Interview Intelligence
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* COLLAPSE BUTTON */}

                <button
                    onClick={handleCollapse}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className="absolute -right-3 top-[76px] flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#11111a] text-zinc-500 shadow-lg transition-colors hover:text-white"
                >
                    {collapsed ? (
                        <ChevronRight size={14} />
                    ) : (
                        <ChevronLeft size={14} />
                    )}
                </button>

                {/* DESKTOP MAIN MENU */}

                <div className="min-h-0 flex-1 px-3 py-6">
                    {!collapsed && (
                        <div className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                            Workspace
                        </div>
                    )}

                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active =
                                location.pathname === item.path;

                            return (
                                <motion.button
                                    key={item.label}
                                    onClick={() =>
                                        handleNavigation(item.path)
                                    }
                                    whileHover={{
                                        x: collapsed ? 0 : 3,
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`group relative flex w-full items-center rounded-xl px-3 py-3 transition-all ${
                                        active
                                            ? "bg-violet-500/10 text-violet-300"
                                            : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                                    }`}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="activeSidebar"
                                            className="absolute left-0 h-6 w-0.5 rounded-full bg-violet-400"
                                        />
                                    )}

                                    <Icon
                                        size={19}
                                        strokeWidth={1.7}
                                        className="shrink-0"
                                    />

                                    {!collapsed && (
                                        <span className="ml-3 text-sm">
                                            {item.label}
                                        </span>
                                    )}

                                    {collapsed && (
                                        <span className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#15151f] px-3 py-2 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                                            {item.label}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </nav>

                    {!collapsed && (
                        <div className="mb-3 mt-8 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                            Account
                        </div>
                    )}

                    <nav className="space-y-1">
                        {bottomItems.map((item) => {
                            const Icon = item.icon;
                            const active =
                                location.pathname === item.path;

                            return (
                                <motion.button
                                    key={item.label}
                                    onClick={() =>
                                        handleNavigation(item.path)
                                    }
                                    whileHover={{
                                        x: collapsed ? 0 : 3,
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`group relative flex w-full items-center rounded-xl px-3 py-3 transition-all ${
                                        active
                                            ? "bg-violet-500/10 text-violet-300"
                                            : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                                    }`}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="activeSidebar"
                                            className="absolute left-0 h-6 w-0.5 rounded-full bg-violet-400"
                                        />
                                    )}

                                    <Icon
                                        size={19}
                                        strokeWidth={1.7}
                                        className="shrink-0"
                                    />

                                    {!collapsed && (
                                        <span className="ml-3 text-sm">
                                            {item.label}
                                        </span>
                                    )}

                                    {collapsed && (
                                        <span className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#15151f] px-3 py-2 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                                            {item.label}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </nav>
                </div>

                {/* DESKTOP LOGOUT */}

                <div className="shrink-0 border-t border-white/[0.07] p-3">
                    <motion.button
                        whileHover={{
                            x: collapsed ? 0 : 3,
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="group relative flex w-full items-center rounded-xl px-3 py-3 text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut
                            size={19}
                            strokeWidth={1.7}
                        />

                        {!collapsed && (
                            <span className="ml-3 text-sm">
                                Logout
                            </span>
                        )}

                        {collapsed && (
                            <span className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#15151f] px-3 py-2 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
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