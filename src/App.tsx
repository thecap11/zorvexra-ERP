import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { LoadingSpinner } from './components/LoadingSpinner';

// Pages
import { LoginPage } from './pages/LoginPage';
import { CRDashboard } from './pages/CRDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { CreateTaskPage } from './pages/CreateTaskPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { StudentAssignmentsPage } from './pages/StudentAssignmentsPage';
import { StudentAttendancePage } from './pages/StudentAttendancePage';
import StudentManagementPage from './pages/StudentManagementPage';
import { AttendanceCalendarPage } from './pages/AttendanceCalendarPage';
import { TimetablePage } from './pages/TimetablePage';
import { StudentTimetablePage } from './pages/StudentTimetablePage';
import { CRTasksPage } from './pages/CRTasksPage';
import { StudentTaskDetailPage } from './pages/StudentTaskDetailPage';
import { StudentMessagesPage } from './pages/StudentMessagesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminClassesPage } from './pages/AdminClassesPage';
import { AssignCRsPage } from './pages/AssignCRsPage';
import { CourseStructurePage } from './pages/CourseStructurePage';
import { ElectivePreferencesPage } from './pages/ElectivePreferencesPage';

import { ViewModeProvider, useViewMode } from './context/ViewModeContext';

const RootRedirect: React.FC = () => {
    const { user, isLoading } = useAuth();
    const { viewMode } = useViewMode();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Admin users go to admin dashboard
    if (user.role === 'ADMIN') {
        return <Navigate to="/admin" />;
    }

    // CRs go to CR dashboard (unless in student view mode)
    if (user.role === 'CR' && viewMode === 'STUDENT') {
        return <Navigate to="/student" />;
    }

    if (user.role === 'CR') {
        return <Navigate to="/cr" />;
    }

    // Students go to student dashboard
    return <Navigate to="/student" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ViewModeProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Root redirect */}
                        <Route path="/" element={<RootRedirect />} />

                        {/* Admin routes */}
                        <Route
                            path="/admin"
                            element={
                                <RequireAuth requiredRole="ADMIN">
                                    <AdminDashboard />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/admin/classes"
                            element={
                                <RequireAuth requiredRole="ADMIN">
                                    <AdminClassesPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/admin/assign-crs"
                            element={
                                <RequireAuth requiredRole="ADMIN">
                                    <AssignCRsPage />
                                </RequireAuth>
                            }
                        />

                        {/* CR routes */}
                        <Route
                            path="/cr"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <CRDashboard />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/cr/students"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <StudentManagementPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/cr/attendance-calendar"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <AttendanceCalendarPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/cr/tasks"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <CRTasksPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/cr/tasks/create"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <CreateTaskPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/cr/tasks/:taskId"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <TaskDetailPage />
                                </RequireAuth>
                            }
                        />

                        <Route
                            path="/cr/timetable"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <TimetablePage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/cr/course-structure"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <CourseStructurePage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/cr/elective-preferences"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <ElectivePreferencesPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/cr/messages"
                            element={
                                <RequireAuth requiredRole="CR">
                                    <StudentMessagesPage />
                                </RequireAuth>
                            }
                        />

                        {/* Student routes */}
                        <Route
                            path="/student"
                            element={
                                <RequireAuth requiredRole="STUDENT">
                                    <StudentDashboard />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/student/assignments"
                            element={
                                <RequireAuth requiredRole="STUDENT">
                                    <StudentAssignmentsPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/student/attendance"
                            element={
                                <RequireAuth requiredRole="STUDENT">
                                    <StudentAttendancePage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/student/tasks/:taskId"
                            element={
                                <RequireAuth requiredRole="STUDENT">
                                    <StudentTaskDetailPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/student/timetable"
                            element={
                                <RequireAuth requiredRole="STUDENT">
                                    <StudentTimetablePage />
                                </RequireAuth>
                            }
                        />

                        {/* 404 */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ViewModeProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
