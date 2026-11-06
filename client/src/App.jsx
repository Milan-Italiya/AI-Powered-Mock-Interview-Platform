import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import Dashboard from "./pages/dashboard/Dashboard.jsx";
import CreateInterview from "./pages/interview/CreateInterview.jsx";
import InterviewSession from "./pages/interview/InterviewSession.jsx";
import InterviewResult from "./pages/interview/InterviewResult.jsx";
import AllInterviews from "./pages/interview/AllInterviews.jsx";
import Profile from "./pages/profile/Profile.jsx";
import EditProfile from "./pages/profile/EditProfile.jsx";
import Analytics from "./pages/analytics/Analytics.jsx";
import Settings from "./pages/settings/Settings.jsx";
import TargetPractice from "./pages/targetPractice/TargetPractice.jsx";
import CustomCursor from "./components/common/CustomCursor.jsx";

function App() {
    return (
        <BrowserRouter>
            <CustomCursor />

            <Routes>

                {/* ================= PUBLIC ROUTES ================= */}

                <Route
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ================= PROTECTED ROUTES ================= */}

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/interviews"
                        element={<AllInterviews />}
                    />

                    <Route
                        path="/analytics"
                        element={<Analytics />}
                    />

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />

                    <Route
                        path="/interview/create"
                        element={<CreateInterview />}
                    />

                    <Route
                        path="/interview/:interviewId"
                        element={<InterviewSession />}
                    />

                    <Route
                        path="/interview/:interviewId/result"
                        element={<InterviewResult />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/profile/edit"
                        element={<EditProfile />}
                    />

                    <Route
                        path="/target-practice"
                        element={<TargetPractice />}
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;