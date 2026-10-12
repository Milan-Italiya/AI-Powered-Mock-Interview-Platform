
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { getProfileDatasource } from "../datasource/user.datasource.js";

const AuthContext = createContext(null);

const extractUser = (response) => {
    const candidates = [
        response?.data?.user,
        response?.user,
        response?.data?.profile,
        response?.profile,
        response?.data?.data?.user,
        response?.data,
    ];

    return (
        candidates.find(
            (candidate) =>
                candidate &&
                typeof candidate === "object" &&
                !Array.isArray(candidate) &&
                (candidate._id || candidate.id || candidate.email)
        ) || null
    );
};

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

        const response = await getProfileDatasource();
        const currentUser = extractUser(response);

        if (!currentUser) {
            console.error(
                "Profile API returned an unexpected response:",
                response
            );
            throw new Error(
                "Unable to find user data in the profile response."
            );
        }

        setUser(currentUser);
        return currentUser;
    }, []);

    useEffect(() => {
        let active = true;

        const initializeAuth = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const response = await getProfileDatasource();
                const currentUser = response?.data?.user ?? null;

                if (active) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error("Initialize Auth Error:", error);

                if (active) {
                    setUser(null);
                }
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
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                setUser,
                refreshUser,
                loading,
                isAuthenticated: Boolean(token),
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
