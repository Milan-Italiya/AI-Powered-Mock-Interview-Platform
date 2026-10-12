import { motion } from "motion/react";
import { fadeIn } from "../../lib/motion.js";

const PageTransition = ({
    children,
    className = "",
}) => {
    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;