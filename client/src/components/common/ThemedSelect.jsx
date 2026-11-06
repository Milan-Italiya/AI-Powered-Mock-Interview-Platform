import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";

const ThemedSelect = ({
    name,
    value,
    onChange,
    options,
    placeholder,
    icon: Icon,
}) => {
    const { theme } = useTheme();
    const isLight = theme === "light";

    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});

    const selectRef = useRef(null);
    const dropdownRef = useRef(null);

    const updateDropdownPosition = () => {
        if (!selectRef.current) return;

        const rect = selectRef.current.getBoundingClientRect();

        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const gap = 8;

        const itemHeight = 45;
        const dropdownPadding = 45;

        const contentHeight =
            options.length * itemHeight + dropdownPadding;

        const maxDropdownHeight = 240;
        const desiredHeight = Math.min(
            contentHeight,
            maxDropdownHeight
        );

        const spaceBelow =
            viewportHeight - rect.bottom - gap;

        const spaceAbove = rect.top - gap;

        const shouldOpenUpward =
            spaceBelow < desiredHeight &&
            spaceAbove > spaceBelow;

        setOpenUpward(shouldOpenUpward);

        const availableSpace = shouldOpenUpward
            ? spaceAbove
            : spaceBelow;

        const needsScroll = contentHeight > availableSpace;

        const finalMaxHeight = Math.min(
            maxDropdownHeight,
            Math.max(availableSpace, 120)
        );

        let left = rect.left;

        if (left + rect.width > viewportWidth - 12) {
            left = viewportWidth - rect.width - 12;
        }

        if (left < 12) {
            left = 12;
        }

        let top;

        if (shouldOpenUpward) {
            top =
                rect.top -
                Math.min(contentHeight, finalMaxHeight) -
                gap;
        } else {
            top = rect.bottom + gap;
        }

        setDropdownStyle({
            position: "fixed",
            top: `${Math.max(12, top)}px`,
            left: `${left}px`,
            width: `${rect.width}px`,
            ...(needsScroll
                ? {
                      maxHeight: `${finalMaxHeight}px`,
                      overflowY: "auto",
                  }
                : {
                      height: "auto",
                      maxHeight: `${contentHeight}px`,
                      overflowY: "hidden",
                  }),
            zIndex: 99999,
        });
    };

    // Close dropdown when clicking outside.
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedSelect =
                selectRef.current?.contains(event.target);

            const clickedDropdown =
                dropdownRef.current?.contains(event.target);

            if (!clickedSelect && !clickedDropdown) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // Update dropdown position while open.
    useEffect(() => {
        if (!open) return;

        updateDropdownPosition();

        const handlePositionUpdate = () => {
            updateDropdownPosition();
        };

        window.addEventListener(
            "resize",
            handlePositionUpdate
        );

        window.addEventListener(
            "scroll",
            handlePositionUpdate,
            true
        );

        return () => {
            window.removeEventListener(
                "resize",
                handlePositionUpdate
            );

            window.removeEventListener(
                "scroll",
                handlePositionUpdate,
                true
            );
        };
    }, [open, options.length]);

    const handleToggle = () => {
        if (!open) {
            updateDropdownPosition();
        }

        setOpen((prev) => !prev);
    };

    const selectedOption = options.find(
        (option) => option.value === value
    );

    const handleSelect = (option) => {
        onChange({
            target: {
                name,
                value: option.value,
            },
        });

        setOpen(false);
    };

    return (
        <>
            {/* Select button */}
            <div
                ref={selectRef}
                className="relative w-full"
            >
                <button
                    type="button"
                    onClick={handleToggle}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className={`
                        relative flex w-full items-center
                        rounded-xl border py-3 text-left
                        text-sm outline-none
                        transition-all duration-200

                        ${
                            isLight
                                ? `
                                    border-slate-300
                                    bg-white
                                    text-slate-800
                                    hover:border-violet-400
                                    hover:bg-slate-50
                                `
                                : `
                                    border-purple-500/15
                                    bg-[#11101a]
                                    text-white
                                    hover:border-purple-500/25
                                    hover:bg-[#171321]
                                `
                        }

                        ${
                            open
                                ? isLight
                                    ? `
                                        border-violet-500
                                        bg-white
                                        shadow-[0_0_0_3px_rgba(139,92,246,0.12)]
                                    `
                                    : `
                                        border-purple-500/50
                                        bg-[#171321]
                                        shadow-[0_0_0_1px_rgba(139,92,246,0.12)]
                                    `
                                : ""
                        }

                        ${Icon ? "pl-11 pr-10" : "px-4 pr-10"}
                    `}
                >
                    {Icon && (
                        <Icon
                            size={18}
                            className={`
                                absolute left-4
                                ${
                                    isLight
                                        ? "text-slate-500"
                                        : "text-gray-500"
                                }
                            `}
                        />
                    )}

                    <span
                        className={
                            selectedOption
                                ? isLight
                                    ? "text-slate-800"
                                    : "text-white"
                                : isLight
                                  ? "text-slate-500"
                                  : "text-gray-500"
                        }
                    >
                        {selectedOption
                            ? selectedOption.label
                            : placeholder}
                    </span>

                    <ChevronDown
                        size={17}
                        className={`
                            absolute right-4
                            transition-transform duration-200

                            ${
                                open
                                    ? isLight
                                        ? "rotate-180 text-violet-600"
                                        : "rotate-180 text-purple-400"
                                    : isLight
                                      ? "text-slate-500"
                                      : "text-gray-500"
                            }
                        `}
                    />
                </button>
            </div>

            {/* Dropdown portal */}
            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                ref={dropdownRef}
                                initial={{
                                    opacity: 0,
                                    y: openUpward ? 6 : -6,
                                    scale: 0.98,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: openUpward ? 6 : -6,
                                    scale: 0.98,
                                }}
                                transition={{ duration: 0.15 }}
                                style={dropdownStyle}
                                className={`
                                    synthex-scrollbar
                                    relative overflow-x-hidden
                                    rounded-xl border p-1.5
                                    backdrop-blur-xl

                                    ${
                                        isLight
                                            ? `
                                                border-slate-200
                                                bg-white
                                                shadow-xl
                                                shadow-slate-900/10
                                            `
                                            : `
                                                border-purple-500/20
                                                bg-[#100e19]
                                                shadow-2xl
                                                shadow-purple-950/30
                                            `
                                    }
                                `}
                            >
                                {/* Subtle theme-aware glow */}
                                <div
                                    className={`
                                        pointer-events-none
                                        absolute -top-16 left-1/2
                                        h-24 w-24
                                        -translate-x-1/2
                                        -translate-y-1/2
                                        rounded-full blur-3xl

                                        ${
                                            isLight
                                                ? "bg-violet-400/10"
                                                : "bg-purple-600/15"
                                        }
                                    `}
                                />

                                {/* Options */}
                                <div
                                    className="relative"
                                    role="listbox"
                                >
                                    {options.map((option) => {
                                        const isSelected =
                                            option.value === value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                role="option"
                                                aria-selected={isSelected}
                                                onClick={() =>
                                                    handleSelect(option)
                                                }
                                                className={`
                                                    group flex w-full
                                                    items-center
                                                    justify-between
                                                    rounded-lg px-3 py-2
                                                    text-left text-sm
                                                    transition-colors
                                                    duration-150

                                                    ${
                                                        isSelected
                                                            ? isLight
                                                                ? `
                                                                    bg-violet-50
                                                                    text-violet-800
                                                                `
                                                                : `
                                                                    bg-gradient-to-r
                                                                    from-violet-600/25
                                                                    to-fuchsia-600/15
                                                                    text-white
                                                                `
                                                            : isLight
                                                              ? `
                                                                    text-slate-700
                                                                    hover:bg-violet-50
                                                                    hover:text-violet-800
                                                                `
                                                              : `
                                                                    text-gray-400
                                                                    hover:bg-violet-500/[0.10]
                                                                    hover:text-white
                                                                `
                                                    }
                                                `}
                                            >
                                                <span>
                                                    {option.label}
                                                </span>

                                                {isSelected && (
                                                    <Check
                                                        size={16}
                                                        className={
                                                            isLight
                                                                ? "text-violet-700"
                                                                : "text-violet-400"
                                                        }
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
};

export default ThemedSelect;