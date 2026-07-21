import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import MemberDashboardPage from "./MemberDashboardPage";
import { getMemberStatusApi } from "../api/memberApi";

const DashboardRouterPage = () => {
  const { isAuthenticated } = useAuth();

  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const statusRes = await getMemberStatusApi();
        setMembershipStatus(statusRes.membershipStatus);
      } catch {
        setMembershipStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [isAuthenticated]);

  // ── Not authenticated ───────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F9F6F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #E8DCD0",
            borderRadius: "16px",
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 4px 24px rgba(44,62,80,0.08)",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</p>
          <p
            style={{ fontSize: "1rem", color: "#95A5A6", marginBottom: "24px" }}
          >
            You need to be logged in to view your dashboard.
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: "10px",
              background: "#C0392B",
              color: "white",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 700,
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F9F6F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #C0392B",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#95A5A6", fontSize: "0.9rem" }}>
            Loading dashboard…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Non-member view ─────────────────────────────────────────────────────────
  if (membershipStatus !== "Approved") {
    const statusMessage =
      membershipStatus === "PendingApproval"
        ? {
            icon: "⏳",
            text: "Your membership application is pending admin approval.",
          }
        : membershipStatus === "Rejected"
          ? {
              icon: "❌",
              text: "Your membership application was rejected. You can apply again.",
            }
          : {
              icon: "📋",
              text: "You are not a member yet. Join now to unlock borrowing, reservations, and digital access.",
            };

    // Color for status badge
    const badgeColor =
      membershipStatus === "PendingApproval"
        ? "#d4ac0d"
        : membershipStatus === "Rejected"
          ? "#C0392B"
          : "#95A5A6";
    const badgeBg =
      membershipStatus === "PendingApproval"
        ? "rgba(241,196,15,0.1)"
        : membershipStatus === "Rejected"
          ? "rgba(192,57,43,0.08)"
          : "rgba(149,165,166,0.1)";
    const badgeBorder =
      membershipStatus === "PendingApproval"
        ? "rgba(241,196,15,0.35)"
        : membershipStatus === "Rejected"
          ? "rgba(192,57,43,0.25)"
          : "rgba(149,165,166,0.3)";
    const badgeLabel =
      membershipStatus === "PendingApproval"
        ? "Pending Approval"
        : membershipStatus === "Rejected"
          ? "Application Rejected"
          : "Not a Member";

    // Benefits list
    const benefits = [
      "📦 Borrow physical books",
      "📖 Read full books online",
      "🔖 Reserve upcoming titles",
      "⭐ Write reviews & ratings",
    ];

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F9F6F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
            maxWidth: "840px",
            width: "100%",
            alignItems: "center",
          }}
        >
          {/* Left — status card */}
          <div
            style={{
              background: "white",
              border: "1px solid #E8DCD0",
              borderRadius: "16px",
              padding: "40px 36px",
              boxShadow: "0 4px 24px rgba(44,62,80,0.08)",
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div style={{ fontSize: "3.5rem", marginBottom: "20px" }}>
              {statusMessage.icon}
            </div>

            {/* Status badge */}
            <span
              style={{
                display: "inline-block",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "4px 14px",
                borderRadius: "20px",
                color: badgeColor,
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                marginBottom: "20px",
              }}
            >
              {badgeLabel}
            </span>

            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#2C3E50",
                margin: "0 0 12px",
              }}
            >
              Welcome
            </h2>

            <p
              style={{
                fontSize: "0.9rem",
                color: "#7F8C8D",
                lineHeight: 1.7,
                margin: "0 0 28px",
              }}
            >
              {statusMessage.text}
            </p>

            <Link
              to="/membership"
              style={{
                display: "inline-block",
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                background: "#C0392B",
                color: "white",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                boxSizing: "border-box",
              }}
            >
              Join Now →
            </Link>

            {membershipStatus === "PendingApproval" && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#95A5A6",
                  marginTop: "12px",
                }}
              >
                Usually takes 1–2 business days.
              </p>
            )}
          </div>

          {/* Right — benefits card */}
          <div
            style={{
              background: "white",
              border: "1px solid #E8DCD0",
              borderRadius: "16px",
              padding: "40px 36px",
              boxShadow: "0 4px 24px rgba(44,62,80,0.08)",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#2C3E50",
                  margin: "0 0 8px",
                }}
              >
                Why become a member?
              </h3>
              <div
                style={{
                  width: "32px",
                  height: "3px",
                  background: "#C0392B",
                  borderRadius: "2px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              {benefits.map((b) => (
                <div
                  key={b}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(192,57,43,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      flexShrink: 0,
                    }}
                  >
                    {b.split(" ")[0]}
                  </div>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "#2C3E50",
                      fontWeight: 500,
                    }}
                  >
                    {b.slice(b.indexOf(" ") + 1)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#F0EDE8",
                borderRadius: "10px",
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#7F8C8D",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Membership is reviewed and approved by our librarians. Apply
                today and get started!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Approved member view ────────────────────────────────────────────────────
  return <MemberDashboardPage />;
};

export default DashboardRouterPage;
