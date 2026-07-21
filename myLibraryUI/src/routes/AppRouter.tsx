import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useIdleTimeout from "../hooks/useIdleTimeout";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardRouterPage from "../pages/DashboardRouterPage";
import BookDetailPage from "../pages/BookDetailPage";
import MembershipPage from "../pages/MembershipPage";
import BrowseBooksPage from "../pages/BrowseBooksPage";
import MyMembershipPage from "../pages/MyMembershipPage";
import BorrowingHistoryPage from "../pages/BorrowingHistoryPage";
import ReservationsPage from "../pages/ReservationsPage";
import FinesPaymentsPage from "../pages/FinesPaymentsPage";
import ProfilePage from "../pages/ProfilePage";
import NotificationsPage from "../pages/NotificationsPage";
import MemberReportPage from "../pages/MemberReportPage";

import ProtectedRoute from "./ProtectedRoute";
import MemberLayout from "../components/layout/MemberLayout";
import UserLayout from "../components/layout/UserLayout";

const PlaceholderPage = ({ icon, title }: { icon: string; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F9F6F0" }}>
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: "3rem", marginBottom: "12px" }}>{icon}</p>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#2C3E50", marginBottom: "8px" }}>{title}</h1>
      <p style={{ color: "#95A5A6" }}>Coming soon…</p>
    </div>
  </div>
);

const IdleWatcher = (): null => {
  useIdleTimeout();
  return null;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <IdleWatcher />

      <Routes>
        <Route element={<UserLayout />}>
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/books" element={<BrowseBooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/membership" element={<MembershipPage />} />

          {/* Member section */}
          <Route element={<ProtectedRoute><MemberLayout /></ProtectedRoute>}>
            <Route path="/dashboard"     element={<DashboardRouterPage />} />
            <Route path="/my-membership" element={<MyMembershipPage />} />
            <Route path="/profile"       element={<ProfilePage />} />
            <Route path="/my-books"      element={<BorrowingHistoryPage />} />
            <Route path="/fines"         element={<FinesPaymentsPage />} />
            <Route path="/reservations"  element={<ReservationsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/my-report"     element={<MemberReportPage />} />
            <Route path="/settings"      element={<PlaceholderPage icon="⚙️" title="Settings" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
