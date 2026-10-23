import { memo, useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
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

/* -------------------------------------------------------------------------- */
/* Constants (hoisted so they are created once, not on every render)          */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "sidebar-collapsed";
const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const SLIDE_TRANSITION = { duration: 0.3, ease: "easeInOut" };

const WORKSPACE_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Interviews", icon: FileText, path: "/interviews" },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
    { label: "Target Practice", icon: Target, path: "/target-practice" },
    { label: "Learning", icon: Brain, path: "/learning" },
];

const ACCOUNT_ITEMS = [
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Settings", icon: Settings, path: "/settings" },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");

const SECTION_LABEL =
    "px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]";

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";

/* -------------------------------------------------------------------------- */
/* Hooks                                                                      */
/* -------------------------------------------------------------------------- */

/** Locks page scroll while `locked` is true and restores previous styles. */
const useBodyScrollLock = (locked) => {
    useEffect(() => {
        if (!locked) return;

        const { overflow, overscrollBehavior } = document.body.style;
        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";

        return () => {
            document.body.style.overflow = overflow;
            document.body.style.overscrollBehavior = overscrollBehavior;
        };
    }, [locked]);
};

/** Calls `onEscape` when Escape is pressed while `active` is true. */
const useEscapeKey = (active, onEscape) => {
    useEffect(() => {
        if (!active) return;

        const onKeyDown = (event) => {
            if (event.key === "Escape") onEscape();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active, onEscape]);
};

/* -------------------------------------------------------------------------- */
/* Small presentational components                                            */
/* -------------------------------------------------------------------------- */

const Tooltip = ({ children }) => (
    <span className="pointer-events-none absolute left-full z-[80] ml-2 hidden whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block">
        {children}
    </span>
);

const BrandMark = memo(function BrandMark() {
    return (
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
    );
});

const BrandText = memo(function BrandText({ compact = false }) {
    return (
        <div className="min-w-0">
            <div
                className={cx(
                    "whitespace-nowrap font-semibold tracking-tight text-[var(--text-primary)]",
                    compact ? "text-[15px]" : "text-lg"
                )}
            >
                Synthex{" "}
                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                    AI
                </span>
            </div>

            <div
                className={cx(
                    "whitespace-nowrap uppercase text-[var(--text-muted)]",
                    compact
                        ? "mt-0.5 text-[9px] tracking-[0.08em]"
                        : "text-[10px] tracking-[0.15em]"
                )}
            >
                Interview Intelligence
            </div>
        </div>
    );
});

const AnimatedThemeIcon = memo(function AnimatedThemeIcon({ theme }) {
    const Icon = theme === "dark" ? Sun : Moon;

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.65 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.65 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex h-6 w-6 shrink-0 items-center justify-center text-violet-500"
                aria-hidden="true"
            >
                <Icon size={19} strokeWidth={1.8} />
            </motion.span>
        </AnimatePresence>
    );
});

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const NavList = memo(function NavList({
    items,
    layoutId,
    pathname,
    collapsed,
    onNavigate,
}) {
    return (
        <nav className="space-y-1">
            {items.map(({ label, icon: Icon, path }) => {
                // Also highlight for nested routes, e.g. /interviews/123
                const active =
                    pathname === path || pathname.startsWith(`${path}/`);

                return (
                    <motion.button
                        key={path}
                        type="button"
                        onClick={() => onNavigate(path)}
                        whileHover={{ x: collapsed ? 0 : 3 }}
                        whileTap={{ scale: 0.98 }}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? label : undefined}
                        className={cx(
                            "group relative flex w-full items-center rounded-xl px-3 py-3 transition-colors",
                            FOCUS_RING,
                            active
                                ? "bg-violet-500/10 text-violet-500"
                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                        )}
                    >
                        {active && (
                            <motion.div
                                layoutId={layoutId}
                                className="absolute left-0 h-6 w-0.5 rounded-full bg-violet-500"
                            />
                        )}

                        <Icon size={19} strokeWidth={1.7} className="shrink-0" />

                        {!collapsed && (
                            <span className="ml-3 text-sm">{label}</span>
                        )}

                        {collapsed && <Tooltip>{label}</Tooltip>}
                    </motion.button>
                );
            })}
        </nav>
    );
});

/** Workspace + Account sections, shared by the desktop and mobile sidebars. */
const SidebarNav = memo(function SidebarNav({
    idPrefix,
    pathname,
    collapsed,
    onNavigate,
}) {
    return (
        <div className="synthex-scrollbar min-h-0 flex-1 overscroll-contain px-3 py-6">
            {!collapsed && <div className={cx(SECTION_LABEL, "mb-3")}>Workspace</div>}

            <NavList
                items={WORKSPACE_ITEMS}
                layoutId={`${idPrefix}-workspace`}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={onNavigate}
            />

            {!collapsed && (
                <div className={cx(SECTION_LABEL, "mb-3 mt-8")}>Account</div>
            )}

            <NavList
                items={ACCOUNT_ITEMS}
                layoutId={`${idPrefix}-account`}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={onNavigate}
            />
        </div>
    );
});

/* -------------------------------------------------------------------------- */
/* Footer actions                                                             */
/* -------------------------------------------------------------------------- */

/** variant: "desktop" adapts to `collapsed`; "drawer" is the full-width mobile style. */
const ThemeToggle = memo(function ThemeToggle({
    variant,
    theme,
    collapsed = false,
    onToggle,
}) {
    const isDark = theme === "dark";
    const label = isDark ? "Light theme" : "Dark theme";
    const isDrawer = variant === "drawer";
    const iconOnly = !isDrawer && collapsed;

    return (
        <motion.button
            type="button"
            onClick={onToggle}
            whileTap={{ scale: isDrawer ? 0.97 : 0.96 }}
            aria-label={`Switch to ${label.toLowerCase()}`}
            title={label}
            className={cx(
                "group relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]",
                FOCUS_RING,
                iconOnly
                    ? "mx-auto h-10 w-10 justify-center"
                    : "w-full gap-3 px-3 py-3",
                isDrawer && "min-h-11"
            )}
        >
            <AnimatedThemeIcon theme={theme} />

            {!iconOnly && (
                <>
                    <span
                        className={cx(
                            "flex-1 text-left text-sm",
                            isDrawer && "font-medium"
                        )}
                    >
                        {label}
                    </span>

                    <span
                        className={cx(
                            "text-xs",
                            isDrawer
                                ? "rounded-lg bg-violet-500/10 px-2 py-1 font-medium text-violet-500"
                                : "text-[var(--text-muted)]"
                        )}
                    >
                        {isDark ? "Dark" : "Light"}
                    </span>
                </>
            )}

            {iconOnly && <Tooltip>{label}</Tooltip>}
        </motion.button>
    );
});

const LogoutButton = memo(function LogoutButton({ collapsed = false, onLogout }) {
    return (
        <motion.button
            type="button"
            whileHover={{ x: collapsed ? 0 : 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            title={collapsed ? "Logout" : undefined}
            className={cx(
                "group relative flex w-full items-center rounded-xl px-3 py-3 text-[var(--text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-500",
                FOCUS_RING
            )}
        >
            <LogOut size={19} strokeWidth={1.7} className="shrink-0" />

            {!collapsed && <span className="ml-3 text-sm">Logout</span>}
            {collapsed && <Tooltip>Logout</Tooltip>}
        </motion.button>
    );
});

/* -------------------------------------------------------------------------- */
/* Mobile drawer                                                              */
/* -------------------------------------------------------------------------- */

const MobileDrawer = ({
    open,
    onClose,
    pathname,
    theme,
    onNavigate,
    onThemeToggle,
    onLogout,
}) => {
    useBodyScrollLock(open);
    useEscapeKey(open, onClose);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
                    />

                    <motion.aside
                        key="drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={SLIDE_TRANSITION}
                        className="fixed inset-y-0 left-0 z-[70] flex h-dvh min-h-0 w-[260px] flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl md:hidden"
                    >
                        <div className="flex h-20 shrink-0 items-center border-b border-[var(--border)] px-3">
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <BrandMark />
                                <BrandText compact />
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close navigation menu"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95"
                            >
                                <X size={20} strokeWidth={1.7} />
                            </button>
                        </div>

                        <SidebarNav
                            idPrefix="mobile"
                            pathname={pathname}
                            collapsed={false}
                            onNavigate={onNavigate}
                        />

                        <div className="shrink-0 border-t border-[var(--border)] p-3">
                            <ThemeToggle
                                variant="drawer"
                                theme={theme}
                                onToggle={onThemeToggle}
                            />
                        </div>

                        <div className="shrink-0 border-t border-[var(--border)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                            <LogoutButton onLogout={onLogout} />
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

const Sidebar = ({ collapsed, setCollapsed, onLogout }) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    const openMobile = useCallback(() => setMobileOpen(true), []);
    const closeMobile = useCallback(() => setMobileOpen(false), []);

    const handleThemeToggle = useCallback(() => {
        // Respect accessibility preferences and browsers without View Transitions.
        if (
            !document.startViewTransition ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            toggleTheme();
            return;
        }

        // The new theme is revealed using the diamond-morph animation in theme-morph.css.
        document.startViewTransition(() => {
            flushSync(toggleTheme);
        });
    }, [toggleTheme]);

    const handleCollapse = useCallback(() => {
        const next = !collapsed;
        setCollapsed(next);

        try {
            localStorage.setItem(STORAGE_KEY, String(next));
        } catch (error) {
            console.error("Could not save sidebar state:", error);
        }
    }, [collapsed, setCollapsed]);

    const handleNavigation = useCallback(
        (path) => {
            navigate(path);
            setMobileOpen(false);
        },
        [navigate]
    );

    const handleLogout = useCallback(() => {
        setMobileOpen(false);
        onLogout();
    }, [onLogout]);

    return (
        <>
            {/* MOBILE MENU BUTTON */}
            <button
                type="button"
                onClick={openMobile}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-lg backdrop-blur-xl transition-colors hover:bg-[var(--surface-hover)] md:hidden"
            >
                <Menu size={20} />
            </button>

            {/* MOBILE OVERLAY + DRAWER */}
            <MobileDrawer
                open={mobileOpen}
                onClose={closeMobile}
                pathname={pathname}
                theme={theme}
                onNavigate={handleNavigation}
                onThemeToggle={handleThemeToggle}
                onLogout={handleLogout}
            />

            {/* DESKTOP SIDEBAR */}
            <motion.aside
                animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
                transition={SLIDE_TRANSITION}
                className="fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-2xl md:flex"
            >
                <div
                    className={cx(
                        "flex h-20 shrink-0 items-center border-b border-[var(--border)]",
                        collapsed ? "justify-center px-2" : "px-5"
                    )}
                >
                    <BrandMark />

                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-3 min-w-0"
                        >
                            <BrandText />
                        </motion.div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleCollapse}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!collapsed}
                    className={cx(
                        "absolute -right-3 top-[76px] flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] shadow-lg transition-colors hover:text-[var(--text-primary)]",
                        FOCUS_RING
                    )}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <SidebarNav
                    idPrefix="desktop"
                    pathname={pathname}
                    collapsed={collapsed}
                    onNavigate={handleNavigation}
                />

                <div className="shrink-0 border-t border-[var(--border)] p-3">
                    <ThemeToggle
                        variant="desktop"
                        theme={theme}
                        collapsed={collapsed}
                        onToggle={handleThemeToggle}
                    />
                </div>

                <div className="shrink-0 border-t border-[var(--border)] p-3">
                    <LogoutButton collapsed={collapsed} onLogout={handleLogout} />
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
