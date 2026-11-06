import { motion } from "motion/react";

const AnimatedCard = ({
    children,
    className = "",
    hover = true,
}) => {
    return (
        <motion.div
            whileHover={
                hover
                    ? {
                          y: -4,
                      }
                    : undefined
            }
            transition={{
                duration: 0.2,
                ease: "easeOut",
            }}
            className={`
                rounded-2xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                backdrop-blur-xl
                transition-colors
                duration-200
                hover:border-violet-400/10
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;