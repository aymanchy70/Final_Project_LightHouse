import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { getMyReservationsApi, cancelReservationApi } from "../api/memberApi";

interface Reservation {
  reservationId: number;
  bookTitle?: string;
  edition?: string;
  reservationDate: string;
  status: string;
}

const ReservationsPage = () => {
  const { isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Please log in to see your reservations.");
      setLoading(false);
      return;
    }
    getMyReservationsApi()
      .then((data) => setReservations(data))
      .catch(() => setError("Failed to load reservations."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCancel = async (reservationId: number) => {
    if (!window.confirm("Cancel this reservation?")) return;
    setCancellingId(reservationId);
    try {
      await cancelReservationApi(reservationId);
      setReservations((prev) =>
        prev.filter((r) => r.reservationId !== reservationId),
      );
      toast.success("Reservation cancelled.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.title ||
          err?.message ||
          "Failed to cancel reservation.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading)
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
          <p style={{ color: "#95A5A6" }}>Loading…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error)
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
        <p style={{ color: "#C0392B", fontWeight: 600 }}>{error}</p>
      </div>
    );

  // ── Main ────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9F6F0",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Page title */}
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#2C3E50",
              margin: "0 0 6px",
            }}
          >
            🔖 My Reservations
          </h2>
          <div
            style={{
              width: "40px",
              height: "3px",
              background: "#C0392B",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* ── Empty state ─────────────────────────────── */}
        {reservations.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1px solid #E8DCD0",
              borderRadius: "14px",
              padding: "64px 40px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(44,62,80,0.05)",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</p>
            <p
              style={{
                fontSize: "1rem",
                color: "#95A5A6",
                marginBottom: "24px",
              }}
            >
              No active reservations.
            </p>
            <Link
              to="/books"
              style={{
                display: "inline-block",
                padding: "11px 28px",
                borderRadius: "10px",
                background: "#C0392B",
                color: "white",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              Browse Books
            </Link>
          </div>
        ) : (
          /* ── Reservation list ───────────────────────── */
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {reservations.map((r) => {
              // Status color logic
              const statusColor =
                r.status === "Pending"
                  ? "#d4ac0d"
                  : r.status === "Fulfilled"
                    ? "#27ae60"
                    : "#95A5A6";

              const statusBg =
                r.status === "Pending"
                  ? "rgba(241,196,15,0.1)"
                  : r.status === "Fulfilled"
                    ? "rgba(39,174,96,0.1)"
                    : "rgba(149,165,166,0.1)";

              const statusBorder =
                r.status === "Pending"
                  ? "rgba(241,196,15,0.35)"
                  : r.status === "Fulfilled"
                    ? "rgba(39,174,96,0.3)"
                    : "rgba(149,165,166,0.3)";

              return (
                <div
                  key={r.reservationId}
                  style={{
                    background: "white",
                    border: "1px solid #E8DCD0",
                    borderLeft: `4px solid ${statusColor}`,
                    borderRadius: "12px",
                    padding: "22px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                    boxShadow: "0 2px 6px rgba(44,62,80,0.04)",
                  }}
                >
                  {/* Book info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#2C3E50",
                        margin: "0 0 6px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.bookTitle || "Book"}
                    </h3>

                    {r.edition && (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#7F8C8D",
                          margin: "0 0 4px",
                        }}
                      >
                        Edition: {r.edition}
                      </p>
                    )}

                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#7F8C8D",
                        margin: 0,
                      }}
                    >
                      Reserved on:{" "}
                      {new Date(r.reservationDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Status + Cancel */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {/* Status badge */}
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        color: statusColor,
                        background: statusBg,
                        border: `1px solid ${statusBorder}`,
                      }}
                    >
                      {r.status}
                    </span>

                    {/* Cancel button — only for Pending */}
                    {r.status === "Pending" && (
                      <button
                        onClick={() => handleCancel(r.reservationId)}
                        disabled={cancellingId === r.reservationId}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          background: "transparent",
                          border: "1px solid rgba(192,57,43,0.4)",
                          color: "#C0392B",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor:
                            cancellingId === r.reservationId
                              ? "not-allowed"
                              : "pointer",
                          fontFamily: "inherit",
                          opacity: cancellingId === r.reservationId ? 0.6 : 1,
                          transition: "background 0.18s",
                        }}
                      >
                        {cancellingId === r.reservationId
                          ? "Cancelling…"
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
