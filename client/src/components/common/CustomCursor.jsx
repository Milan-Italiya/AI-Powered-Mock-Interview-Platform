import { useEffect, useState } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react";

const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Fast, responsive center cursor.
    const cursorX = useSpring(mouseX, {
        stiffness: 1200,
        damping: 55,
        mass: 0.08,
    });

    const cursorY = useSpring(mouseY, {
        stiffness: 1200,
        damping: 55,
        mass: 0.08,
    });

    // Smooth orbit with a subtle trailing effect.
    const ringX = useSpring(mouseX, {
        stiffness: 380,
        damping: 32,
        mass: 0.16,
    });

    const ringY = useSpring(mouseY, {
        stiffness: 380,
        damping: 32,
        mass: 0.16,
    });

    // Slow ambient glow for depth.
    const glowX = useSpring(mouseX, {
        stiffness: 150,
        damping: 28,
        mass: 0.3,
    });

    const glowY = useSpring(mouseY, {
        stiffness: 150,
        damping: 28,
        mass: 0.3,
    });

    const centerX = useTransform(cursorX, (value) => value - 4);
    const centerY = useTransform(cursorY, (value) => value - 4);

    const ringLeft = useTransform(ringX, (value) => value - 15);
    const ringTop = useTransform(ringY, (value) => value - 15);

    const glowLeft = useTransform(glowX, (value) => value - 26);
    const glowTop = useTransform(glowY, (value) => value - 26);

    const accentX = useTransform(ringX, (value) => value + 10);
    const accentY = useTransform(ringY, (value) => value - 10);

    useEffect(() => {
        const media = window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        );

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        const updateCursorMode = () => {
            const enabled =
                media.matches && !reducedMotion.matches;

            setIsEnabled(enabled);

            document.documentElement.classList.toggle(
                "synthex-orbit-cursor",
                enabled
            );

            if (!enabled) {
                setIsVisible(false);
                setIsHovering(false);
                setIsClicking(false);
            }
        };

        updateCursorMode();

        media.addEventListener?.("change", updateCursorMode);
        reducedMotion.addEventListener?.("change", updateCursorMode);

        return () => {
            media.removeEventListener?.("change", updateCursorMode);
            reducedMotion.removeEventListener?.("change", updateCursorMode);

            document.documentElement.classList.remove(
                "synthex-orbit-cursor"
            );
        };
    }, []);

    useEffect(() => {
        if (!isEnabled) return;

        const interactiveSelector = [
            "button",
            "a",
            "input",
            "textarea",
            "select",
            "summary",
            "label",
            "[role='button']",
            "[data-cursor='pointer']",
        ].join(",");

        let currentHoverTarget = null;

        const handleMouseMove = (event) => {
            mouseX.set(event.clientX);
            mouseY.set(event.clientY);

            setIsVisible(true);

            const target = event.target;
            const interactive =
                target instanceof Element
                    ? target.closest(interactiveSelector)
                    : null;

            if (interactive !== currentHoverTarget) {
                currentHoverTarget = interactive;
                setIsHovering(Boolean(interactive));
            }
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        const handleMouseLeave = () => {
            setIsVisible(false);
            setIsClicking(false);
        };

        const handleMouseEnter = () => setIsVisible(true);

        const handleWindowBlur = () => {
            setIsVisible(false);
            setIsClicking(false);
        };

        window.addEventListener("mousemove", handleMouseMove, {
            passive: true,
        });
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("blur", handleWindowBlur);

        document.documentElement.addEventListener(
            "mouseleave",
            handleMouseLeave
        );

        document.documentElement.addEventListener(
            "mouseenter",
            handleMouseEnter
        );

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("blur", handleWindowBlur);

            document.documentElement.removeEventListener(
                "mouseleave",
                handleMouseLeave
            );

            document.documentElement.removeEventListener(
                "mouseenter",
                handleMouseEnter
            );
        };
    }, [isEnabled, mouseX, mouseY]);

    return (
        <>
            <style>
                {`
                    @media (hover: hover) and (pointer: fine) {
                        html.synthex-orbit-cursor,
                        html.synthex-orbit-cursor body,
                        html.synthex-orbit-cursor body button,
                        html.synthex-orbit-cursor body a,
                        html.synthex-orbit-cursor body input,
                        html.synthex-orbit-cursor body textarea,
                        html.synthex-orbit-cursor body select,
                        html.synthex-orbit-cursor body label,
                        html.synthex-orbit-cursor body [role="button"] {
                            cursor: none !important;
                        }
                    }

                    @media (hover: none), (pointer: coarse),
                           (prefers-reduced-motion: reduce) {
                        .synthex-orbit-cursor-element {
                            display: none !important;
                        }

                        html.synthex-orbit-cursor,
                        html.synthex-orbit-cursor body,
                        html.synthex-orbit-cursor body button,
                        html.synthex-orbit-cursor body a,
                        html.synthex-orbit-cursor body input,
                        html.synthex-orbit-cursor body textarea,
                        html.synthex-orbit-cursor body select,
                        html.synthex-orbit-cursor body label,
                        html.synthex-orbit-cursor body [role="button"] {
                            cursor: auto !important;
                        }
                    }
                `}
            </style>

            {/* Ambient purple glow */}
            <motion.div
                className="synthex-orbit-cursor-element pointer-events-none fixed left-0 top-0 z-[9997] hidden h-[52px] w-[52px] rounded-full md:block"
                style={{
                    x: glowLeft,
                    y: glowTop,
                    background:
                        "radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(168,85,247,0.13) 45%, rgba(217,70,239,0.04) 70%, transparent 75%)",
                    filter: "blur(5px)",
                    willChange: "transform",
                }}
                animate={{
                    scale: isClicking ? 0.8 : isHovering ? 1.4 : 1,
                    opacity: isVisible ? (isHovering ? 0.95 : 0.65) : 0,
                }}
                transition={{
                    scale: {
                        type: "spring",
                        stiffness: 220,
                        damping: 24,
                    },
                    opacity: { duration: 0.18 },
                }}
            />

            {/* Orbit ring */}
            <motion.div
                className="synthex-orbit-cursor-element pointer-events-none fixed left-0 top-0 z-[9998] hidden h-[30px] w-[30px] rounded-full border md:block"
                style={{
                    x: ringLeft,
                    y: ringTop,
                    borderColor: isHovering
                        ? "rgba(217,70,239,0.95)"
                        : "rgba(167,139,250,0.7)",
                    background:
                        "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(217,70,239,0.03))",
                    boxShadow: isHovering
                        ? "0 0 18px rgba(139,92,246,0.28), inset 0 0 10px rgba(217,70,239,0.08)"
                        : "0 0 12px rgba(139,92,246,0.16)",
                    willChange: "transform",
                }}
                animate={{
                    scale: isClicking ? 0.82 : isHovering ? 1.35 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{
                    scale: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                    },
                    opacity: { duration: 0.15 },
                }}
            />

            {/* Floating orbit accent */}
            <motion.div
                className="synthex-orbit-cursor-element pointer-events-none fixed left-0 top-0 z-[9999] hidden h-[7px] w-[7px] rounded-full md:block"
                style={{
                    x: accentX,
                    y: accentY,
                    background: "#e879f9",
                    boxShadow:
                        "0 0 8px rgba(232,121,249,0.9), 0 0 15px rgba(168,85,247,0.6)",
                    willChange: "transform",
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{
                    scale: {
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                    },
                    opacity: { duration: 0.12 },
                }}
            />

            {/* Responsive center cursor */}
            <motion.div
                className="synthex-orbit-cursor-element pointer-events-none fixed left-0 top-0 z-[10000] hidden h-2 w-2 rounded-[2px] md:block"
                style={{
                    x: centerX,
                    y: centerY,
                    background:
                        "linear-gradient(135deg, #ede9fe, #a78bfa, #d946ef)",
                    boxShadow:
                        "0 0 8px rgba(167,139,250,0.9), 0 0 16px rgba(217,70,239,0.45)",
                    willChange: "transform",
                }}
                animate={{
                    rotate: 45,
                    scale: isClicking ? 1.6 : isHovering ? 0.8 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{
                    scale: {
                        type: "spring",
                        stiffness: 450,
                        damping: 26,
                    },
                    opacity: { duration: 0.1 },
                }}
            />
        </>
    );
};

export default CustomCursor;