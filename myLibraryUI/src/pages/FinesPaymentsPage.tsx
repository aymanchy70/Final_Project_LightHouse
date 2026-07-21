import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import {
  getMemberStatusApi,
  paySelfApi,
  getPaymentsByMemberApi,
} from "../api/memberApi";

// ─── Types (unchanged) ────────────────────────────────────────────────────────
interface Payment {
  paymentId: number;
  amount: number;
  paymentDate: string;
  paymentType: string;
  paymentMethod: string;
  notes: string;
}

// ─── Color theme ──────────────────────────────────────────────────────────────
const C = {
  bg: "#F9F6F0",
  primary: "#C0392B",
  dark: "#2C3E50",
  muted: "#95A5A6",
  muted2: "#7F8C8D",
  border: "#E8DCD0",
  cream: "#F0EDE8",
  card: "white",
  green: "#27ae60",
};

// ─── Helper components ────────────────────────────────────────────────────────
const MethodBadge = ({ method }: { method: string }) => (
  <span
    style={{
      fontSize: "0.72rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase" as const,
      padding: "3px 10px",
      borderRadius: "20px",
      background:
        method === "Cash" ? "rgba(39,174,96,0.1)" : "rgba(41,128,185,0.1)",
      color: method === "Cash" ? C.green : "#2980b9",
      border: `1px solid ${method === "Cash" ? "rgba(39,174,96,0.25)" : "rgba(41,128,185,0.25)"}`,
      display: "inline-block",
    }}
  >
    {method === "Cash" ? "💵" : "🌐"} {method}
  </span>
);

const TypeBadge = ({ type }: { type: string }) => (
  <span
    style={{
      fontSize: "0.72rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase" as const,
      padding: "3px 10px",
      borderRadius: "20px",
      background: "rgba(192,57,43,0.08)",
      color: C.primary,
      border: "1px solid rgba(192,57,43,0.2)",
      display: "inline-block",
    }}
  >
    {type}
  </span>
);

// ─── Component ────────────────────────────────────────────────────────────────
const FinesPaymentsPage = () => {
  const { isAuthenticated } = useAuth();

  // ── State (100% unchanged from original) ───────────────────────────────────
  const [outstandingFine, setOutstandingFine] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash");
  const [paying, setPaying] = useState(false);

  // ── useEffect (100% unchanged from original) ────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setError("Please log in to view your fines.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const status = await getMemberStatusApi();
        setOutstandingFine(status.outstandingFine || 0);
        if (status.memberId) {
          const pays = await getPaymentsByMemberApi(status.memberId);
          setPayments(pays);
        }
      } catch {
        setError("Failed to load fine data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  // ── handlePay (100% unchanged from original) ────────────────────────────────
  const handlePay = async () => {
    if (payAmount <= 0 || payAmount > outstandingFine) {
      toast.error(`Amount must be between 1 and ৳${outstandingFine}.`);
      return;
    }
    setPaying(true);
    try {
      await paySelfApi({
        amount: payAmount,
        paymentType: "Fine",
        paymentMethod,
      });
      toast.success("Payment recorded! Your fine has been reduced.");
      const status = await getMemberStatusApi();
      setOutstandingFine(status.outstandingFine || 0);
      if (status.memberId) {
        const pays = await getPaymentsByMemberApi(status.memberId);
        setPayments(pays);
      }
      setShowPayModal(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.title || err?.message || "Payment failed.",
      );
    } finally {
      setPaying(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading)
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
            <div
              style={{
                width: "40px",
                height: "40px",
                border: `3px solid ${C.primary}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <p style={{ color: C.muted, fontSize: "0.9rem" }}>Loading…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      </div>
    );

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error)
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
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</p>
            <p style={{ color: C.primary, fontWeight: 600 }}>{error}</p>
          </div>
        </div>
      </div>
    );

  const isPaid = outstandingFine === 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp{ from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .pay-row:hover   { background: rgba(240,237,232,0.7) !important; }
        .modal-overlay   { animation: fadeUp 0.22s ease; }
      `}</style>

      <DashboardSidebar />

      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {/* ── Page header ─────────────────────────────── */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: C.dark,
              margin: "0 0 4px",
            }}
          >
            💰 Fines & Payments
          </h1>
          <p style={{ fontSize: "0.875rem", color: C.muted, margin: 0 }}>
            Track your outstanding fines and payment history.
          </p>
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

        <div style={{ maxWidth: "860px" }}>
          {/* ── Fine summary card ──────────────────────── */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderLeft: `5px solid ${isPaid ? C.green : C.primary}`,
              borderRadius: "14px",
              padding: "28px 32px",
              marginBottom: "24px",
              boxShadow: "0 2px 12px rgba(44,62,80,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              {/* Label */}
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.muted2,
                  margin: "0 0 10px",
                }}
              >
                Outstanding Fine
              </p>

              {/* Amount */}
              <p
                style={{
                  fontSize: "2.8rem",
                  fontWeight: 800,
                  color: isPaid ? C.green : C.primary,
                  margin: "0 0 8px",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ৳{outstandingFine.toFixed(2)}
              </p>

              {/* Status message */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: isPaid
                    ? "rgba(39,174,96,0.08)"
                    : "rgba(192,57,43,0.08)",
                  border: `1px solid ${isPaid ? "rgba(39,174,96,0.25)" : "rgba(192,57,43,0.2)"}`,
                  borderRadius: "20px",
                  padding: "4px 12px",
                }}
              >
                <span style={{ fontSize: "0.8rem" }}>
                  {isPaid ? "✅" : "⚠️"}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: isPaid ? C.green : C.primary,
                  }}
                >
                  {isPaid
                    ? "Account clear — no outstanding fines"
                    : "Fine outstanding — please pay to continue borrowing"}
                </span>
              </div>
            </div>

            {/* Pay button */}
            {!isPaid && (
              <button
                onClick={() => {
                  setShowPayModal(true);
                  setPayAmount(outstandingFine);
                }}
                style={{
                  padding: "13px 32px",
                  borderRadius: "10px",
                  background: C.primary,
                  color: "white",
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                  letterSpacing: "0.04em",
                  boxShadow: "0 4px 12px rgba(192,57,43,0.25)",
                  transition: "opacity 0.2s, transform 0.15s",
                }}
              >
                Pay Now →
              </button>
            )}
          </div>

          {/* ── Payment history card ────────────────────── */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "14px",
              padding: "28px 32px",
              boxShadow: "0 2px 12px rgba(44,62,80,0.06)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: C.dark,
                    margin: "0 0 8px",
                  }}
                >
                  🧾 Payment History
                </h2>
                <div
                  style={{
                    width: "30px",
                    height: "3px",
                    background: C.primary,
                    borderRadius: "2px",
                  }}
                />
              </div>
              {payments.length > 0 && (
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: C.muted2,
                    background: C.cream,
                    borderRadius: "20px",
                    padding: "4px 14px",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {payments.length} record{payments.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Empty state */}
            {payments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <p style={{ fontSize: "3rem", marginBottom: "12px" }}>📭</p>
                <p style={{ fontSize: "0.9rem", color: C.muted }}>
                  No payment records found.
                </p>
              </div>
            ) : (
              /* Table */
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      {["Date", "Amount", "Type", "Method", "Notes"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: C.muted2,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr
                        key={p.paymentId}
                        className="pay-row"
                        style={{
                          borderBottom: `1px solid ${C.border}`,
                          background:
                            i % 2 === 0
                              ? "transparent"
                              : "rgba(240,237,232,0.35)",
                          transition: "background 0.15s",
                        }}
                      >
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: "0.875rem",
                            color: C.muted2,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(p.paymentDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: 800,
                              color: C.green,
                            }}
                          >
                            ৳{p.amount.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <TypeBadge type={p.paymentType} />
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <MethodBadge method={p.paymentMethod} />
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: "0.875rem",
                            color: C.muted,
                          }}
                        >
                          {p.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Pay modal (unchanged logic, new design) ─────── */}
      {showPayModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(44,62,80,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "24px",
          }}
        >
          <div
            className="modal-overlay"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "16px",
              padding: "36px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 60px rgba(44,62,80,0.15)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: C.dark,
                    margin: "0 0 8px",
                  }}
                >
                  Pay Fine
                </h3>
                <div
                  style={{
                    width: "28px",
                    height: "3px",
                    background: C.primary,
                    borderRadius: "2px",
                  }}
                />
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                style={{
                  background: C.cream,
                  border: "none",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  color: C.muted2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Outstanding amount */}
            <div
              style={{
                background: "rgba(192,57,43,0.06)",
                border: "1px solid rgba(192,57,43,0.2)",
                borderRadius: "10px",
                padding: "14px 18px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: C.muted2,
                }}
              >
                Outstanding Fine
              </span>
              <span
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: C.primary,
                }}
              >
                ৳{outstandingFine.toFixed(2)}
              </span>
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.muted2,
                  marginBottom: "8px",
                }}
              >
                Amount to Pay
              </label>
              <input
                type="number"
                value={payAmount || ""}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                placeholder="Enter amount"
                min={1}
                max={outstandingFine}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${C.border}`,
                  background: "#FAFAFA",
                  fontSize: "0.95rem",
                  color: C.dark,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: C.muted,
                  margin: "5px 0 0",
                }}
              >
                Max payable: ৳{outstandingFine.toFixed(2)}
              </p>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.muted2,
                  marginBottom: "10px",
                }}
              >
                Payment Method
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {(["Cash", "Online"] as const).map((method) => (
                  <label
                    key={method}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "13px 16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: `1px solid ${paymentMethod === method ? C.primary : C.border}`,
                      background:
                        paymentMethod === method
                          ? "rgba(192,57,43,0.04)"
                          : C.card,
                      transition: "all 0.18s",
                    }}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      style={{ accentColor: C.primary }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: C.dark,
                          margin: 0,
                        }}
                      >
                        {method === "Cash" ? "💵 Cash" : "🌐 Online"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: C.muted,
                          margin: 0,
                        }}
                      >
                        {method === "Cash"
                          ? "Pay at the library counter"
                          : "Pay via online gateway"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handlePay}
                disabled={paying}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "10px",
                  background: paying ? "#e08080" : C.primary,
                  color: "white",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  cursor: paying ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {paying ? (
                  <>
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Processing…
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>

              <button
                onClick={() => setShowPayModal(false)}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "10px",
                  background: "transparent",
                  color: C.dark,
                  border: `1px solid ${C.border}`,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinesPaymentsPage;
