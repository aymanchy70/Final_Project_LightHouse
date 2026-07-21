import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getMyBorrowingsApi } from "../api/memberApi";

interface Borrowing {
  borrowingId: number;
  bookTitle: string;
  barcode: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fineAmount: number;
}

const BorrowingHistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Please log in to see your borrowings.");
      setLoading(false);
      return;
    }
    getMyBorrowingsApi()
      .then((data) => setBorrowings(data))
      .catch(() => setError("Failed to load borrowings."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

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

  const activeCount = borrowings.filter(
    (b) => b.status === "Borrowed" || b.status === "Overdue",
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9F6F0",
        padding: "48px 24px",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
            📖 Borrowing History
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

        {/* Info banner */}
        {activeCount > 0 && (
          <div
            style={{
              background: "rgba(241,196,15,0.08)",
              border: "1px solid rgba(241,196,15,0.35)",
              borderRadius: "10px",
              padding: "14px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>ℹ️</span>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#b8960c",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Books must be returned at the library counter. Please bring your
              physical copy to the librarian.
            </p>
          </div>
        )}

        {/* Empty state */}
        {borrowings.length === 0 ? (
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
              No borrowings yet.
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {borrowings.map((b) => {
              const statusColor =
                b.status === "Overdue"
                  ? "#C0392B"
                  : b.status === "Returned"
                    ? "#27ae60"
                    : b.status === "Borrowed"
                      ? "#2980b9"
                      : "#95A5A6";

              const statusBg =
                b.status === "Overdue"
                  ? "rgba(192,57,43,0.08)"
                  : b.status === "Returned"
                    ? "rgba(39,174,96,0.08)"
                    : b.status === "Borrowed"
                      ? "rgba(41,128,185,0.08)"
                      : "rgba(149,165,166,0.08)";

              const statusBorder =
                b.status === "Overdue"
                  ? "rgba(192,57,43,0.25)"
                  : b.status === "Returned"
                    ? "rgba(39,174,96,0.25)"
                    : b.status === "Borrowed"
                      ? "rgba(41,128,185,0.25)"
                      : "rgba(149,165,166,0.25)";

              return (
                <div
                  key={b.borrowingId}
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
                        margin: "0 0 8px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.bookTitle}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "#7F8C8D",
                          margin: 0,
                        }}
                      >
                        Barcode:{" "}
                        <strong style={{ color: "#2C3E50" }}>
                          {b.barcode}
                        </strong>
                      </p>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "#7F8C8D",
                          margin: 0,
                        }}
                      >
                        Issued:{" "}
                        <strong style={{ color: "#2C3E50" }}>
                          {new Date(b.issueDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                        {" — "}
                        Due:{" "}
                        <strong
                          style={{
                            color:
                              b.status === "Overdue" ? "#C0392B" : "#2C3E50",
                          }}
                        >
                          {new Date(b.dueDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                      </p>
                      {b.returnDate && (
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: "#7F8C8D",
                            margin: 0,
                          }}
                        >
                          Returned:{" "}
                          <strong style={{ color: "#27ae60" }}>
                            {new Date(b.returnDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </strong>
                        </p>
                      )}
                    </div>

                    {b.fineAmount > 0 && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "#C0392B",
                          margin: "8px 0 0",
                        }}
                      >
                        Fine: ৳{b.fineAmount.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
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
                      {b.status}
                    </span>
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

export default BorrowingHistoryPage;
