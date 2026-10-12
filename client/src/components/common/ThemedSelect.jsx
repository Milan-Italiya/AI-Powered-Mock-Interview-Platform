import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ThemedSelect = ({
    name,
    value,
    onChange,
    options,
    placeholder,
    icon: Icon,
}) => {
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

        /*
         * Estimate the dropdown content height only for
         * deciding whether it should open upward.
         *
         * Each option:
         * py-2.5 = 10px + 10px
         * line-height ≈ 20px
         * total ≈ 40px
         *
         * Dropdown padding:
         * p-1.5 = 6px + 6px
         */
        const itemHeight = 40;
        const dropdownPadding = 12;

        const contentHeight =
            options.length * itemHeight +
            dropdownPadding;

        const maxDropdownHeight = 240;

        const desiredHeight = Math.min(
            contentHeight,
            maxDropdownHeight
        );

        const spaceBelow =
            viewportHeight -
            rect.bottom -
            gap;

        const spaceAbove =
            rect.top -
            gap;

        /*
         * Open upward only when the dropdown does not
         * comfortably fit below and there is more space above.
         */
        const shouldOpenUpward =
            spaceBelow < desiredHeight &&
            spaceAbove > spaceBelow;

        setOpenUpward(shouldOpenUpward);

        const availableSpace = shouldOpenUpward
            ? spaceAbove
            : spaceBelow;

        /*
         * Only constrain the dropdown when the available
         * viewport space is smaller than its natural height.
         */
        const needsScroll =
            contentHeight > availableSpace;

        const finalMaxHeight = Math.min(
            maxDropdownHeight,
            Math.max(availableSpace, 120)
        );

        let left = rect.left;

        /*
         * Keep dropdown inside viewport horizontally.
         */
        if (left + rect.width > viewportWidth - 12) {
            left = viewportWidth - rect.width - 12;
        }

        if (left < 12) {
            left = 12;
        }

        /*
         * For normal dropdowns, don't force a height.
         * Let CSS determine the natural height.
         */
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

            /*
             * Natural height when everything fits.
             * maxHeight + overflow only when needed.
             */
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

    /*
     * Close dropdown when clicking outside.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedSelect =
                selectRef.current?.contains(
                    event.target
                );

            const clickedDropdown =
                dropdownRef.current?.contains(
                    event.target
                );

            if (
                !clickedSelect &&
                !clickedDropdown
            ) {
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

    /*
     * Update dropdown position while open.
     */
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

    /*
     * Toggle dropdown.
     */
    const handleToggle = () => {
        if (!open) {
            updateDropdownPosition();
        }

        setOpen((prev) => !prev);
    };

    /*
     * Find selected option.
     */
    const selectedOption = options.find(
        (option) =>
            option.value === value
    );

    /*
     * Select option.
     */
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
            {/* =====================================================
                SELECT BUTTON
            ===================================================== */}

            <div
                ref={selectRef}
                className="relative w-full"
            >
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`
                        flex
                        w-full
                        items-center
                        rounded-xl
                        border
                        border-white/10
                        bg-[#151519]
                        py-3
                        text-left
                        text-sm
                        text-white
                        outline-none
                        transition-all
                        duration-200

                        ${Icon
                            ? "pl-11 pr-10"
                            : "px-4 pr-10"
                        }

                        ${open
                            ? "border-purple-500/60 bg-[#17151d] shadow-[0_0_0_1px_rgba(168,85,247,0.15)]"
                            : "hover:border-white/15 hover:bg-[#17151d]"
                        }
                    `}
                >
                    {Icon && (
                        <Icon
                            size={18}
                            className="absolute left-4 text-gray-500"
                        />
                    )}

                    <span
                        className={
                            selectedOption
                                ? "text-white"
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
                            absolute
                            right-4
                            text-gray-500
                            transition-transform
                            duration-200

                            ${open
                                ? "rotate-180 text-purple-400"
                                : ""
                            }
                        `}
                    />
                </button>
            </div>

            {/* =====================================================
                DROPDOWN PORTAL
            ===================================================== */}

            {typeof document !==
                "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                ref={dropdownRef}
                                initial={{
                                    opacity: 0,
                                    y: openUpward
                                        ? 6
                                        : -6,
                                    scale: 0.98,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: openUpward
                                        ? 6
                                        : -6,
                                    scale: 0.98,
                                }}
                                transition={{
                                    duration: 0.15,
                                }}
                                style={
                                    dropdownStyle
                                }
                                className="
                                    synthex-scrollbar
                                    relative
                                    rounded-xl
                                    border
                                    border-white/[0.08]
                                    bg-[#0d0d12]/95
                                    p-1.5
                                    shadow-2xl
                                    shadow-black/50
                                    backdrop-blur-xl
                                "
                            >
                                {/* Purple Glow */}

                                <div
                                    className="
                                        pointer-events-none
                                        absolute
                                        -top-16
                                        left-1/2
                                        h-24
                                        w-24
                                        -translate-x-1/2
                                        -translate-y-1/2
                                        rounded-full
                                        bg-purple-600/10
                                        blur-3xl
                                    "
                                />

                                {/* Options */}

                                <div className="relative">
                                    {options.map(
                                        (
                                            option
                                        ) => {
                                            const isSelected =
                                                option.value ===
                                                value;

                                            return (
                                                <button
                                                    key={
                                                        option.value
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelect(
                                                            option
                                                        )
                                                    }
                                                    className={`
                                                        group
                                                        flex
                                                        w-full
                                                        items-center
                                                        justify-between
                                                        rounded-lg
                                                        px-3
                                                        py-1.5
                                                        text-left
                                                        text-sm
                                                        transition-all
                                                        duration-150

                                                        ${isSelected
                                                            ? "bg-gradient-to-r from-purple-600/20 to-fuchsia-600/15 text-white"
                                                            : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
                                                        }
                                                    `}
                                                >
                                                    <span>
                                                        {
                                                            option.label
                                                        }
                                                    </span>

                                                    {isSelected && (
                                                        <Check
                                                            size={
                                                                16
                                                            }
                                                            className="text-purple-400"
                                                        />
                                                    )}
                                                </button>
                                            );
                                        }
                                    )}
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