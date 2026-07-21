import { useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";

// ─── Color theme ──────────────────────────────────────────────────────────────
const C = {
  bg: "#F9F6F0",
  primary: "#C0392B",
  dark: "#2C3E50",
  muted: "#95A5A6",
  border: "#E8DCD0",
  cream: "#F0EDE8",
  card: "white",
};

// ─── Notification type config ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; icon: string }
> = {
  overdue: {
    color: "#C0392B",
    bg: "rgba(192,57,43,0.08)",
    border: "rgba(192,57,43,0.25)",
    icon: "⚠️",
  },
  reservation_fulfilled: {
    color: "#27ae60",
    bg: "rgba(39,174,96,0.08)",
    border: "rgba(39,174,96,0.25)",
    icon: "✅",
  },
  membership_expiring: {
    color: "#d4ac0d",
    bg: "rgba(241,196,15,0.08)",
    border: "rgba(241,196,15,0.3)",
    icon: "⏳",
  },
  default: {
    color: "#2980b9",
    bg: "rgba(41,128,185,0.08)",
    border: "rgba(41,128,185,0.25)",
    icon: "🔔",
  },
};

const getTypeStyle = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.default;

// ─── Component ────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const { isAuthenticated } = useAuth();
  const { notifications, clearNotifications } = useNotifications();

  // Mark all as read when visiting — unchanged
  useEffect(() => {
    clearNotifications();
  }, []);

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
        <DashboardSidebar />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔔</p>
            <p style={{ color: C.muted, fontSize: "0.95rem" }}>
              Please log in to view notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
      <DashboardSidebar />

      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {/* ── Page header ───────────────────────────────── */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: C.dark,
                  margin: "0 0 4px",
                }}
              >
                🔔 Notifications
              </h1>
              <p style={{ fontSize: "0.875rem", color: C.muted, margin: 0 }}>
                {notifications.length > 0
                  ? `You have ${notifications.length} notification${notifications.length > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>

            {/* Count badge */}
            {notifications.length > 0 && (
              <div
                style={{
                  background: C.primary,
                  color: "white",
                  borderRadius: "20px",
                  padding: "4px 14px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                }}
              >
                {notifications.length} new
              </div>
            )}
          </div>

          {/* Underline accent */}
          <div
            style={{
              width: "40px",
              height: "3px",
              background: C.primary,
              borderRadius: "2px",
              marginTop: "12px",
            }}
          />
        </div>

        {/* ── Empty state ────────────────────────────────── */}
        {notifications.length === 0 && (
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "14px",
              padding: "64px 40px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(44,62,80,0.05)",
              maxWidth: "480px",
            }}
          >
            <p style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</p>
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: C.dark,
                margin: "0 0 8px",
              }}
            >
              You're all caught up!
            </h3>
            <p style={{ fontSize: "0.9rem", color: C.muted, margin: 0 }}>
              No new notifications at this time.
            </p>
          </div>
        )}

        {/* ── Notifications list ─────────────────────────── */}
        {notifications.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "780px",
            }}
          >
            {notifications.map((n) => {
              const style = getTypeStyle(n.type);
              return (
                <div
                  key={n.id}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderLeft: `4px solid ${style.color}`,
                    borderRadius: "12px",
                    padding: "20px 24px",
                    boxShadow: "0 2px 8px rgba(44,62,80,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0,
                    }}
                  >
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Type badge + date */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          color: style.color,
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: "20px",
                          padding: "2px 10px",
                        }}
                      >
                        {n.type.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: C.muted }}>
                        {new Date(n.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Message */}
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: C.dark,
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      {n.message}
                    </p>
                  </div>

                  {/* View button */}
                  {n.link && (
                    <Link
                      to={n.link}
                      style={{
                        flexShrink: 0,
                        padding: "9px 20px",
                        borderRadius: "8px",
                        background: C.primary,
                        color: "white",
                        textDecoration: "none",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        transition: "opacity 0.2s",
                      }}
                    >
                      View →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
