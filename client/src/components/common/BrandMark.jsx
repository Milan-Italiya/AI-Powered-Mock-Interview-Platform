import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { memo } from "react";
import { useTheme } from "../../context/ThemeContext";

const BrandMark = memo(function BrandMark() {

    const { theme } = useTheme();

    const isDark = theme === "dark"
    return (
        <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10"
        >
            <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-lg" />
            <Sparkles
                size={20}
                strokeWidth={1.6}
                className={`relative ${!isDark ? "text-violet-600" : "text-violet-200   "}`}
            />
        </motion.div>
    );
});

export default BrandMark