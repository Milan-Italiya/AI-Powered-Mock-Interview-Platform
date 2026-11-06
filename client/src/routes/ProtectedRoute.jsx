import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <main
                className="flex min-h-screen items-center justify-center"
                style={{
                    backgroundColor: "var(--app-bg)",
                    color: "var(--text-primary)",
                }}
                aria-label="Loading your account"
                role="status"
            >
                <div
                    className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/25 border-t-violet-500"
                    aria-hidden="true"
                />
                <span className="sr-only">Loading...</span>
            </main>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Outlet />;
};

export default ProtectedRoute;
