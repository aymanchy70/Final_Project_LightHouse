import { Outlet } from "react-router-dom";
import DashboardSidebar from "../dashboard/DashboardSidebar";

const MemberLayout = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--navy-900)",
      }}
    >
      <DashboardSidebar />
      <main style={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MemberLayout;
