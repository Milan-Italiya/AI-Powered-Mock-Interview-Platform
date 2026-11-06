import { memo } from "react";
import { motion } from "motion/react";

const panelClass = "rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--card-shadow)] transition-colors duration-200";

const StatCard = memo(({
    label,
    value,
    description,
    icon: Icon,
    iconStyle,
    iconClass, // Added to support AllInterviews.jsx variations
    iconBg,    // Added to support AllInterviews.jsx variations
    delay = 0,
}) => {
    // Determine the style string based on which props are passed 
    // (Dashboard uses iconStyle, AllInterviews uses iconClass + iconBg)
    const finalIconStyle = iconStyle || `${iconClass} ${iconBg}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay }}
            className={`${panelClass} group p-4 hover:border-violet-400/30 sm:p-5`}
        >
            <div className="mb-5 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
                    {label}
                </p>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${finalIconStyle}`}
                >
                    <Icon className="h-[18px] w-[18px]" />
                </div>
            </div>

            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {value}
            </p>

            <p className="mt-1.5 text-[11px] leading-5 text-[var(--text-muted)] sm:text-xs">
                {description}
            </p>
        </motion.div>
    );
});

export default StatCard;