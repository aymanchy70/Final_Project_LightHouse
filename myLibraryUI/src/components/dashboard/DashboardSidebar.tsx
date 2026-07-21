import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

interface NavItem {
  icon: string;
  label: string;
  to: string;
  action?: () => void;
}

const DashboardSidebar = (): JSX.Element => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const emailName = user?.email?.split("@")[0] ?? "Member";
  const initials = emailName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleCollapse = () => setCollapsed((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  const NAV_ITEMS: NavItem[] = [
    { icon: "🏠", label: "Dashboard", to: "/dashboard" },
    { icon: "🎫", label: "My Membership", to: "/my-membership" },
    { icon: "📖", label: "My Borrowings", to: "/my-books" },
    { icon: "🔖", label: "Reservations", to: "/reservations" },
    { icon: "💰", label: "Fines & Payments", to: "/fines" },
    { icon: "🔔", label: "Notifications", to: "/notifications" },
    { icon: "👤", label: "Profile", to: "/profile" },
{ icon: '📊', label: 'My Report', to: '/my-report' },
    { icon: "🚪", label: "Logout", to: "", action: handleLogout },
  ];

  const SidebarContent = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "white",
        borderRight: "1px solid #E8DCD0",
      }}
    >
      {/* Brand / Collapse */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid #E8DCD0",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>📖</span>
            <span
              style={{
                fontFamily: "Playfair Display, serif",
                fontWeight: 700,
                color: "#006D6F",
                fontSize: "1.1rem",
                letterSpacing: "0.02em",
              }}
            >
              Lighthouse
            </span>
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          style={{
            background: "none",
            border: "none",
            color: "#006D6F",
            fontSize: "1.2rem",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {collapsed ? "☰" : "✕"}
        </button>
      </div>

      {/* User info */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "16px",
          borderBottom: "1px solid #E8DCD0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#006D6F",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.9rem",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#2C3E50",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {emailName}
            </p>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#006D6F",
                background: "#E6F2F2",
                borderRadius: "4px",
                padding: "2px 6px",
              }}
            >
              Member
            </span>
          </div>
        )}
      </div>

      {/* Navigation links */}
      <nav
        style={{
          flex: 1,
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          marginTop: "8px",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          const Component = item.action ? "button" : Link;
          return (
            <Component
              key={item.label}
              {...(item.action ? { onClick: item.action } : { to: item.to })}
              onClickCapture={item.action ? undefined : closeMobile}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "10px 0" : "10px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                background: isActive ? "#E6F2F2" : "transparent",
                borderLeft: isActive
                  ? "3px solid #006D6F"
                  : "3px solid transparent",
                transition: "all 0.18s",
                justifyContent: collapsed ? "center" : "flex-start",
                overflow: "hidden",
                whiteSpace: "nowrap",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                width: "100%",
              }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && (
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#006D6F" : "#4B5563",
                  }}
                >
                  {item.label}
                </span>
              )}
            </Component>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop collapsible sidebar */}
      <aside
        className="dashboard-sidebar"
        style={{
          width: collapsed ? "72px" : "240px",
          transition: "width 0.3s ease",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 40,
          background: "white",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Spacer pushes main content right */}
      <div
        className="dashboard-sidebar-spacer"
        style={{
          width: collapsed ? "72px" : "240px",
          transition: "width 0.3s ease",
          flexShrink: 0,
        }}
      />

      {/* Mobile top bar + drawer */}
      <div
        className="dashboard-mobile-bar"
        style={{
          background: "white",
          borderBottom: "1px solid #E8DCD0",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>📖</span>
          <span
            style={{
              fontWeight: 700,
              color: "#006D6F",
              fontSize: "1rem",
              fontFamily: "Playfair Display, serif",
            }}
          >
            Lighthouse
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen((p) => !p)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.4rem",
            color: "#006D6F",
          }}
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}
        >
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "260px",
              background: "white",
              height: "100vh",
              overflowY: "auto",
              zIndex: 10,
              boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
            }}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .dashboard-sidebar { display: block !important; }
          .dashboard-sidebar-spacer { display: block !important; }
          .dashboard-mobile-bar { display: none !important; }
        }
        @media (max-width: 767px) {
          .dashboard-sidebar { display: none !important; }
          .dashboard-sidebar-spacer { display: none !important; }
          .dashboard-mobile-bar { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default DashboardSidebar;
