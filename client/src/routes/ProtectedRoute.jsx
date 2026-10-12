import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
    const {
        isAuthenticated,
        loading,
    } = useAuth();

    // console.log("Protected Route:", {
    //     isAuthenticated,
    //     loading,
    // });

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#05050a] text-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;