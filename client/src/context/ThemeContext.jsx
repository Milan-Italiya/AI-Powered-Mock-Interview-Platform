import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem("synthex-theme");

            if (savedTheme === "Light" || savedTheme === "dark") {
                return savedTheme;
            }
        } catch (error) {
            console.error("Could not read saved theme: ", error)
        }
        return "dark";
    });


    useEffect(() => {
        document.documentElement.dataset.theme = theme;

        try {
            localStorage.setItem("synthex-theme", theme);
        } catch (error) {
            console.error("Could not save theme: ", error)
        }
    }, [theme])

    const toggleTheme = () => {
        setTheme((curTheme) => {
            curTheme === "dark" ? "light" : "dark";
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error ("useTheme must be used inside ThemeProvider.");
    }
}