import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  getMemberStatusApi,
  getMyBorrowingsApi,
  getMyReservationsApi,
  reportLostDamagedApi,
} from "../api/memberApi";

interface Borrowing {
  borrowingId: number;
  bookTitle: string;
  barcode: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fineAmount: number;
  requestedDate: string;
  isDigital: boolean;
}

interface Reservation {
  reservationId: number;
  bookTitle: string;
  edition: string;
  reservationDate: string;
  status: string;
}

const C = {
  primary: "#006D6F",
  primaryLight: "#E6F2F2",
  dark: "#2C3E50",
  text: "#4B5563",
  muted: "#7F8C8D",
  cardBg: "white",
  border: "#E8DCD0",
  pendingBg: "#FFFBEB",
  pendingBorder: "#FCD34D",
  pendingText: "#92400E",
  activeBg: "#F8FAFC",
  activeBorder: "#E2E8F0",
  lostBg: "#FEF2F2",
  lostBorder: "#FECACA",
  lostText: "#B91C1C",
  returnedBg: "#F0FDF4",
  returnedText: "#15803D",
};

const cardStyle: React.CSSProperties = {
  background: C.cardBg,
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  border: `1px solid ${C.border}`,
};

const statCardStyle: React.CSSProperties = {
  ...cardStyle,
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "8px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 700,
  color: C.dark,
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const MemberDashboardPage = () => {
  const { user } = useAuth();
  const emailName = user?.email?.split("@")[0] ?? "Member";

  const [memberStatus, setMemberStatus] = useState<any>(null);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportModal, setReportModal] = useState<{
    borrowingId: number;
    bookTitle: string;
  } | null>(null);
  const [reportType, setReportType] = useState<"Lost" | "Damaged">("Lost");
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [statusRes, borrowingsRes, reservationsRes] = await Promise.all([
          getMemberStatusApi(),
          getMyBorrowingsApi(),
          getMyReservationsApi(),
        ]);
        setMemberStatus(statusRes);
        setBorrowings(borrowingsRes);
        setReservations(reservationsRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleReportSubmit = async () => {
    if (!reportModal) return;
    setReporting(true);
    try {
      await reportLostDamagedApi(
        reportModal.borrowingId,
        reportType,
        reportReason,
      );
      const fresh = await getMyBorrowingsApi();
      setBorrowings(fresh);
      setReportModal(null);
    } catch (err: any) {
      alert(
        err?.response?.data?.title ||
          err?.message ||
          "Failed to submit report.",
      );
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9F6F0",
        }}
      >
        <p style={{ color: C.muted }}>Loading dashboard…</p>
      </div>
    );
  }

  const pendingList = borrowings.filter((b) => b.status === "Pending");
  const activeList = borrowings.filter(
    (b) => b.status === "Borrowed" || b.status === "Overdue",
  );
  const returnedList = borrowings.filter(
    (b) => b.status === "Returned" || b.status === "Rejected",
  );
  const lostDamagedList = borrowings.filter(
    (b) => b.status === "Lost" || b.status === "Damaged",
  );

  // Small badge to show Physical/PDF type
  const typeBadge = (isDigital: boolean) => (
    <span
      style={{
        fontSize: "0.65rem",
        fontWeight: 700,
        padding: "1px 6px",
        borderRadius: "6px",
        background: isDigital ? "#E6F2F2" : "#F0FDF4",
        color: isDigital ? "#006D6F" : "#15803D",
        border: isDigital ? "1px solid #B8D8D8" : "1px solid #BBF7D0",
      }}
    >
      {isDigital ? "PDF" : "Physical"}
    </span>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F9F6F0" }}>
      <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Welcome row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: C.dark,
                fontFamily: "Playfair Display, serif",
              }}
            >
              Welcome, {memberStatus?.fullName || emailName} 👋
            </h1>
            <p
              style={{ margin: "4px 0 0", color: C.muted, fontSize: "0.85rem" }}
            >
              {user?.email} · {memberStatus?.membershipTypeName || "Member"}
              {memberStatus?.membershipExpiryDate &&
                ` · Expires ${new Date(memberStatus.membershipExpiryDate).toLocaleDateString()}`}
            </p>
          </div>
          <Link
            to="/"
            style={{
              color: C.primary,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            🏠 Home
          </Link>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            { icon: "📚", label: "Active", value: activeList.length },
            { icon: "⏳", label: "Requested", value: pendingList.length },
            { icon: "🔖", label: "Reservations", value: reservations.length },
            {
              icon: "💰",
              label: "Fine",
              value: `৳${memberStatus?.outstandingFine?.toFixed(2) || "0"}`,
            },
            {
              icon: "📝",
              label: "Status",
              value: memberStatus?.membershipStatus || "N/A",
            },
          ].map((s) => (
            <div key={s.label} style={statCardStyle}>
              <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: C.dark,
                    lineHeight: 1.2,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: C.muted,
                    marginTop: "2px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Requested Books (Pending) */}
        {pendingList.length > 0 && (
          <div
            style={{
              ...cardStyle,
              marginBottom: "16px",
              borderLeft: `4px solid ${C.pendingBorder}`,
            }}
          >
            <h2 style={sectionTitleStyle}>
              <span>⏳</span> Requested Books
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {pendingList.map((b) => (
                <div
                  key={b.borrowingId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: C.pendingBg,
                    border: `1px solid ${C.pendingBorder}`,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: C.pendingText,
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {b.bookTitle}
                      {typeBadge(b.isDigital)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#B45309",
                        marginTop: "2px",
                      }}
                    >
                      Requested {new Date(b.requestedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: "#FEF3C7",
                      color: C.pendingText,
                    }}
                  >
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Borrowings (Active) */}
        <div style={{ ...cardStyle, marginBottom: "16px" }}>
          <h2 style={sectionTitleStyle}>
            <span>📖</span> Current Borrowings
          </h2>
          {activeList.length === 0 ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: C.muted,
                background: C.primaryLight,
                borderRadius: "10px",
              }}
            >
              <p style={{ fontSize: "0.9rem", margin: 0 }}>
                No active borrowings.
              </p>
              <Link
                to="/books"
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  fontSize: "0.85rem",
                  color: C.primary,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Browse books to borrow →
              </Link>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {activeList.map((b) => (
                <div
                  key={b.borrowingId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: C.activeBg,
                    border: `1px solid ${C.activeBorder}`,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: C.dark,
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {b.bookTitle}
                      {typeBadge(b.isDigital)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: C.muted,
                        marginTop: "2px",
                      }}
                    >
                      Due: {new Date(b.dueDate).toLocaleDateString()} · Barcode:{" "}
                      {b.barcode}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background:
                          b.status === "Overdue" ? "#FEF2F2" : "#EFF6FF",
                        color: b.status === "Overdue" ? "#B91C1C" : "#1D4ED8",
                      }}
                    >
                      {b.status}
                    </span>
                    {b.fineAmount > 0 && (
                      <span
                        style={{
                          color: C.primary,
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        ৳{b.fineAmount.toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setReportModal({
                          borrowingId: b.borrowingId,
                          bookTitle: b.bookTitle,
                        })
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Returned / Rejected */}
        {returnedList.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: "16px" }}>
            <h2 style={sectionTitleStyle}>
              <span>✅</span> Returned / Rejected
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {returnedList.map((b) => (
                <div
                  key={b.borrowingId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: C.returnedBg,
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: C.returnedText,
                        fontSize: "0.9rem",
                      }}
                    >
                      {b.bookTitle}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#166534",
                        marginTop: "2px",
                      }}
                    >
                      {b.status === "Returned"
                        ? `Returned ${new Date(b.returnDate!).toLocaleDateString()}`
                        : "Rejected"}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: "#D1FAE5",
                      color: "#065F46",
                    }}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lost / Damaged */}
        {lostDamagedList.length > 0 && (
          <div
            style={{
              ...cardStyle,
              marginBottom: "16px",
              borderLeft: `4px solid ${C.lostBorder}`,
            }}
          >
            <h2 style={{ ...sectionTitleStyle, color: C.lostText }}>
              <span>⚠️</span> Reported (Lost / Damaged)
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {lostDamagedList.map((b) => (
                <div
                  key={b.borrowingId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: C.lostBg,
                    border: `1px solid ${C.lostBorder}`,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: C.lostText,
                        fontSize: "0.9rem",
                      }}
                    >
                      {b.bookTitle}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#991B1B",
                        marginTop: "2px",
                      }}
                    >
                      {b.returnDate
                        ? `Reported ${new Date(b.returnDate).toLocaleDateString()}`
                        : "Reported just now"}
                    </div>
                    {b.fineAmount > 0 && (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: C.lostText,
                          marginTop: "2px",
                        }}
                      >
                        Fine: ৳{b.fineAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: "#FEE2E2",
                      color: C.lostText,
                    }}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservations */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <span>🔖</span> My Reservations
          </h2>
          {reservations.length === 0 ? (
            <p
              style={{
                color: C.muted,
                fontSize: "0.9rem",
                textAlign: "center",
                padding: "12px",
              }}
            >
              No active reservations.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {reservations.map((r) => (
                <div
                  key={r.reservationId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: C.dark,
                        fontSize: "0.9rem",
                      }}
                    >
                      {r.bookTitle}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: C.muted,
                        marginTop: "2px",
                      }}
                    >
                      Reserved{" "}
                      {new Date(r.reservationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                    }}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Modal */}
        {reportModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 300,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "1.2rem",
                  color: C.dark,
                  marginBottom: "16px",
                }}
              >
                Report Lost/Damaged
              </h3>
              <p style={{ color: C.text, marginBottom: "12px" }}>
                Book: <strong>{reportModal.bookTitle}</strong>
              </p>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: C.dark,
                    marginBottom: "4px",
                  }}
                >
                  Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) =>
                    setReportType(e.target.value as "Lost" | "Damaged")
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #E8DCD0",
                    fontSize: "0.85rem",
                    color: C.dark,
                  }}
                >
                  <option value="Lost">Lost</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: C.dark,
                    marginBottom: "4px",
                  }}
                >
                  Reason (optional)
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #E8DCD0",
                    fontSize: "0.85rem",
                    color: C.dark,
                    resize: "vertical",
                  }}
                  rows={3}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleReportSubmit}
                  disabled={reporting}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: C.primary,
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: reporting ? 0.7 : 1,
                  }}
                >
                  {reporting ? "Submitting…" : "Submit"}
                </button>
                <button
                  onClick={() => setReportModal(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "white",
                    color: C.dark,
                    border: "1px solid #E8DCD0",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MemberDashboardPage;
