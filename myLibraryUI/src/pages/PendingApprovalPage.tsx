import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import useAuth from "../hooks/useAuth";

const C = {
  bg: "#F9F6F0",
  primary: "#C0392B",
  dark: "#2C3E50",
  muted: "#95A5A6",
  border: "#E8DCD0",
};

const PendingApprovalPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { checkMemberStatus, memberStatusLoading } = useAuth();

  const handleRefresh = async (): Promise<void> => {
    await checkMemberStatus();
    navigate("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Navbar />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 64px)",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            background: "white",
            border: `1px solid ${C.border}`,
            borderRadius: "16px",
            padding: "48px 40px",
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(44,62,80,0.08)",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(241,196,15,0.12)",
              border: "2px solid rgba(241,196,15,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.2rem",
              margin: "0 auto 24px",
            }}
          >
            ⏳
          </div>

          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: C.dark,
              margin: "0 0 12px",
            }}
          >
            Application Under Review
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: C.muted,
              margin: "0 0 8px",
              lineHeight: 1.7,
            }}
          >
            Your membership application has been submitted successfully.
          </p>
          <p
            style={{
              fontSize: "0.9rem",
              color: C.muted,
              margin: "0 0 32px",
              lineHeight: 1.7,
            }}
          >
            Our team is reviewing your application. You will be notified once it
            is approved. This usually takes 1–2 business days.
          </p>

          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(241,196,15,0.1)",
              border: "1px solid rgba(241,196,15,0.35)",
              borderRadius: "20px",
              padding: "8px 20px",
              marginBottom: "32px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#f1c40f",
                display: "inline-block",
                animation: "blink 1.5s ease-in-out infinite",
              }}
            />
            <span
              style={{ fontSize: "0.85rem", fontWeight: 700, color: "#d4ac0d" }}
            >
              Pending Approval
            </span>
          </div>

          {/* Actions */}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              onClick={handleRefresh}
              disabled={memberStatusLoading}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                background: C.primary,
                color: "white",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: memberStatusLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: memberStatusLoading ? 0.7 : 1,
              }}
            >
              {memberStatusLoading ? "Checking…" : "Refresh Status"}
            </button>

            <a
              href="/"
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                background: "transparent",
                color: C.dark,
                border: `1px solid ${C.border}`,
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
};

export default PendingApprovalPage;
