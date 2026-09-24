import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import FeedPage from "../pages/FeedPage";
import FriendsPage from "../pages/FriendsPage";
import NotificationsPage from "../pages/NotificationsPage";
import MessagesPage from "../pages/MessagesPage";

import MainLayout from "../layouts/MainLayout";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<FeedPage />} />

        <Route path="/friends" element={<FriendsPage />} />

        <Route path="/messages" element={<MessagesPage />} />

        <Route path="/notifications" element={<NotificationsPage />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}