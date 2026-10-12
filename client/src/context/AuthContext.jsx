import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { getProfileDatasource } from "../datasource/user.datasource.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() =>
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        if (!localStorage.getItem("token")) {
            setUser(null);
            return null;
        }

        try {
            const response = await getProfileDatasource();

            const currentUser =
                response?.data?.user ??
                response?.user ??
                response?.data?.profile ??
                response?.profile ??
                null;

            if (currentUser) {
                setUser(currentUser);
            }

            return currentUser;
        } catch (error) {
            console.error("Refresh User Error:", error);
            throw error;
        }
    }, []);

    useEffect(() => {
        let active = true;

        const initializeAuth = async () => {
            try {
                if (localStorage.getItem("token")) {
                    const response = await getProfileDatasource();

                    const currentUser =
                        response?.data?.user ??
                        response?.user ??
                        response?.data?.profile ??
                        response?.profile ??
                        null;

                    if (active) {
                        setUser(currentUser);
                    }
                }
            } catch (error) {
                console.error("Initialize Auth Error:", error);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        return () => {
            active = false;
        };
    }, []);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                setUser,
                refreshUser,
                loading,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
};
