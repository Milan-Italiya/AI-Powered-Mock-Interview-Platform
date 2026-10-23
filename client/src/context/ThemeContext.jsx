import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

const ThemeContext = createContext(null);

const THEME_ANIMATION_DURATION = 2000;

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem("synthex-theme");

            if (savedTheme === "light" || savedTheme === "dark") {
                return savedTheme;
            }
        } catch (error) {
            console.error("Could not read saved theme:", error);
        }

        return "dark";
    });

    const animationTimeoutRef = useRef(null);
    const isInitialRender = useRef(true);

    useEffect(() => {
        const root = document.documentElement;

        // Apply the selected theme.
        root.dataset.theme = theme;

        try {
            localStorage.setItem("synthex-theme", theme);
        } catch (error) {
            console.error("Could not save theme:", error);
        }

        // Do not animate the initial page load.
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        // Restart the animation if the theme changes again quickly.
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        root.classList.remove("theme-changing");

        // Force the browser to restart the CSS animation.
        void root.offsetWidth;

        root.classList.add("theme-changing");

        animationTimeoutRef.current = setTimeout(() => {
            root.classList.remove("theme-changing");
            animationTimeoutRef.current = null;
        }, THEME_ANIMATION_DURATION);

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
                animationTimeoutRef.current = null;
            }

            root.classList.remove("theme-changing");
        };
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark"
        );
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme,
                isDark: theme === "dark",
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider."
        );
    }

    return context;
};