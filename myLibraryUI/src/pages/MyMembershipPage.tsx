import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  getMemberStatusApi,
  getPaymentsByMemberApi,
  paySelfApi,
  getMembershipTypesApi,
  upgradeMembershipApi,
} from "../api/memberApi";

interface MembershipType {
  membershipTypeId: number;
  name: string;
  yearlyFee: number | null;
}

const MyMembershipPage = () => {
  const { isAuthenticated, isMember } = useAuth();

  const [member, setMember] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [allTypes, setAllTypes] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState<"select" | "payment">(
    "select",
  );
  const [selectedNewType, setSelectedNewType] = useState<MembershipType | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash");
  const [upgrading, setUpgrading] = useState(false);

  const [showRenew, setShowRenew] = useState(false);
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<
    "Cash" | "Online"
  >("Cash");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        const status = await getMemberStatusApi();
        setMember(status);
        if (status.memberId) {
          const [pays, types] = await Promise.all([
            getPaymentsByMemberApi(status.memberId),
            getMembershipTypesApi(),
          ]);
          setPayments(pays);
          setAllTypes(types);
        }
      } catch (err) {
        console.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleRenew = async () => {
    setPaying(true);
    try {
      await paySelfApi({
        amount: member.yearlyFee,
        paymentType: "MembershipFee",
        paymentMethod: renewPaymentMethod,
      });
      toast.success("Membership renewed!");
      const status = await getMemberStatusApi();
      setMember(status);
      setShowRenew(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.title || err?.message || "Renewal failed.",
      );
    } finally {
      setPaying(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedNewType) return;
    setUpgrading(true);
    try {
      await upgradeMembershipApi(selectedNewType.membershipTypeId);
      toast.success("Membership upgraded successfully!");
      const status = await getMemberStatusApi();
      setMember(status);
      setShowUpgrade(false);
      setUpgradeStep("select");
      setSelectedNewType(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.title || err?.message || "Upgrade failed.",
      );
    } finally {
      setUpgrading(false);
    }
  };

  const resetUpgrade = () => {
    setShowUpgrade(false);
    setUpgradeStep("select");
    setSelectedNewType(null);
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

  // ── Not a member ────────────────────────────────────────────────────────────
  if (!isMember)
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
        <div
          style={{
            background: "white",
            border: "1px solid #E8DCD0",
            borderRadius: "14px",
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: "400px",
            boxShadow: "0 2px 8px rgba(44,62,80,0.05)",
          }}
        >
          <p
            style={{ fontSize: "1rem", color: "#95A5A6", marginBottom: "24px" }}
          >
            You are not a member yet.
          </p>
          <Link
            to="/membership"
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
            Become a Member
          </Link>
        </div>
      </div>
    );

  // ── Status badge colors ─────────────────────────────────────────────────────
  const statusColor =
    member?.membershipStatus === "Approved"
      ? "#27ae60"
      : member?.membershipStatus === "PendingApproval"
        ? "#d4ac0d"
        : "#C0392B";
  const statusBg =
    member?.membershipStatus === "Approved"
      ? "rgba(39,174,96,0.1)"
      : member?.membershipStatus === "PendingApproval"
        ? "rgba(241,196,15,0.1)"
        : "rgba(192,57,43,0.08)";
  const statusBorder =
    member?.membershipStatus === "Approved"
      ? "rgba(39,174,96,0.3)"
      : member?.membershipStatus === "PendingApproval"
        ? "rgba(241,196,15,0.3)"
        : "rgba(192,57,43,0.25)";

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
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#2C3E50",
              margin: "0 0 6px",
            }}
          >
            🎫 My Membership
          </h1>
          <div
            style={{
              width: "40px",
              height: "3px",
              background: "#C0392B",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* ── Membership details card ─────────────────── */}
        <div
          style={{
            background: "white",
            border: "1px solid #E8DCD0",
            borderRadius: "14px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(44,62,80,0.05)",
          }}
        >
          {/* Grid of details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
              marginBottom: "28px",
            }}
          >
            {/* Full Name */}
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7F8C8D",
                  margin: "0 0 6px",
                }}
              >
                Full Name
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#2C3E50",
                  margin: 0,
                }}
              >
                {member?.fullName || "—"}
              </p>
            </div>

            {/* Membership Type + Upgrade */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#7F8C8D",
                    margin: "0 0 6px",
                  }}
                >
                  Membership Type
                </p>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#C0392B",
                    margin: 0,
                  }}
                >
                  {member?.membershipTypeName || "—"}
                </p>
              </div>
              <button
                onClick={() => setShowUpgrade(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "#C0392B",
                  border: "1px solid rgba(192,57,43,0.4)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Upgrade
              </button>
            </div>

            {/* Start Date */}
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7F8C8D",
                  margin: "0 0 6px",
                }}
              >
                Start Date
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#2C3E50",
                  margin: 0,
                }}
              >
                {member?.membershipStartDate
                  ? new Date(member.membershipStartDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "—"}
              </p>
            </div>

            {/* Expiry Date */}
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7F8C8D",
                  margin: "0 0 6px",
                }}
              >
                Expiry Date
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#2C3E50",
                  margin: 0,
                }}
              >
                {member?.membershipExpiryDate
                  ? new Date(member.membershipExpiryDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "—"}
              </p>
            </div>

            {/* Yearly Fee */}
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7F8C8D",
                  margin: "0 0 6px",
                }}
              >
                Yearly Fee
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#2C3E50",
                  margin: 0,
                }}
              >
                {member?.yearlyFee ? `৳${member.yearlyFee}` : "Free"}
              </p>
            </div>

            {/* Status */}
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7F8C8D",
                  margin: "0 0 8px",
                }}
              >
                Status
              </p>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "4px 14px",
                  borderRadius: "20px",
                  color: statusColor,
                  background: statusBg,
                  border: `1px solid ${statusBorder}`,
                }}
              >
                {member?.membershipStatus || "—"}
              </span>
            </div>
          </div>

          {/* Renew button */}
          {member?.yearlyFee && member.yearlyFee > 0 && (
            <button
              onClick={() => setShowRenew(true)}
              style={{
                padding: "12px 28px",
                borderRadius: "10px",
                background: "#C0392B",
                color: "white",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Renew Now (৳{member.yearlyFee})
            </button>
          )}
        </div>

        {/* ── Payment history card ────────────────────── */}
        <div
          style={{
            background: "white",
            border: "1px solid #E8DCD0",
            borderRadius: "14px",
            padding: "32px",
            boxShadow: "0 2px 8px rgba(44,62,80,0.05)",
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
              🧾 Payment History
            </h3>
            <div
              style={{
                width: "30px",
                height: "3px",
                background: "#C0392B",
                borderRadius: "2px",
              }}
            />
          </div>

          {payments.length === 0 ? (
            <p style={{ color: "#95A5A6", fontSize: "0.9rem" }}>
              No payments recorded.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E8DCD0" }}>
                    {["Date", "Amount", "Type", "Method", "Notes"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#7F8C8D",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr
                      key={p.paymentId}
                      style={{
                        borderBottom: "1px solid #E8DCD0",
                        background:
                          i % 2 === 0 ? "transparent" : "rgba(240,237,232,0.4)",
                      }}
                    >
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "0.875rem",
                          color: "#7F8C8D",
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
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: "#27ae60",
                          }}
                        >
                          ৳{p.amount.toFixed(2)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "0.875rem",
                          color: "#2C3E50",
                        }}
                      >
                        {p.paymentType}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "0.875rem",
                          color: "#2C3E50",
                        }}
                      >
                        {p.paymentMethod}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "0.875rem",
                          color: "#95A5A6",
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

        {/* ── Upgrade Modal ───────────────────────────── */}
        {showUpgrade && (
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
              style={{
                background: "white",
                border: "1px solid #E8DCD0",
                borderRadius: "14px",
                padding: "36px",
                width: "100%",
                maxWidth: "440px",
                boxShadow: "0 20px 60px rgba(44,62,80,0.15)",
              }}
            >
              {upgradeStep === "select" ? (
                <>
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "#2C3E50",
                      margin: "0 0 20px",
                    }}
                  >
                    Choose a New Plan
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginBottom: "24px",
                    }}
                  >
                    {allTypes
                      .filter(
                        (t) => t.membershipTypeId !== member?.membershipTypeId,
                      )
                      .map((type) => (
                        <label
                          key={type.membershipTypeId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            padding: "14px 16px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            border: `1px solid ${selectedNewType?.membershipTypeId === type.membershipTypeId ? "#C0392B" : "#E8DCD0"}`,
                            background:
                              selectedNewType?.membershipTypeId ===
                              type.membershipTypeId
                                ? "rgba(192,57,43,0.04)"
                                : "white",
                            transition: "all 0.18s",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <input
                              type="radio"
                              name="upgradeType"
                              checked={
                                selectedNewType?.membershipTypeId ===
                                type.membershipTypeId
                              }
                              onChange={() => setSelectedNewType(type)}
                              style={{ accentColor: "#C0392B" }}
                            />
                            <span
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#2C3E50",
                              }}
                            >
                              {type.name}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 800,
                              color: "#C0392B",
                            }}
                          >
                            {type.yearlyFee ? `৳${type.yearlyFee}` : "Free"}
                          </span>
                        </label>
                      ))}
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() =>
                        selectedNewType && setUpgradeStep("payment")
                      }
                      disabled={!selectedNewType}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#C0392B",
                        color: "white",
                        border: "none",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        cursor: selectedNewType ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                        opacity: selectedNewType ? 1 : 0.5,
                      }}
                    >
                      Continue to Payment
                    </button>
                    <button
                      onClick={resetUpgrade}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "10px",
                        background: "transparent",
                        color: "#2C3E50",
                        border: "1px solid #E8DCD0",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "#2C3E50",
                      margin: "0 0 20px",
                    }}
                  >
                    Confirm Payment
                  </h3>
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "24px",
                      padding: "20px",
                      background: "#F0EDE8",
                      borderRadius: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#7F8C8D",
                        margin: "0 0 8px",
                      }}
                    >
                      Upgrading to{" "}
                      <strong style={{ color: "#2C3E50" }}>
                        {selectedNewType?.name}
                      </strong>
                    </p>
                    <p
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 800,
                        color: "#C0392B",
                        margin: "0 0 4px",
                      }}
                    >
                      ৳{selectedNewType?.yearlyFee ?? 0}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#95A5A6",
                        margin: 0,
                      }}
                    >
                      one‑time yearly fee
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginBottom: "24px",
                    }}
                  >
                    {(["Cash", "Online"] as const).map((m) => (
                      <label
                        key={m}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "13px 16px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          border: `1px solid ${paymentMethod === m ? "#C0392B" : "#E8DCD0"}`,
                          background:
                            paymentMethod === m
                              ? "rgba(192,57,43,0.04)"
                              : "white",
                          transition: "all 0.18s",
                        }}
                      >
                        <input
                          type="radio"
                          name="upgradePayMethod"
                          value={m}
                          checked={paymentMethod === m}
                          onChange={() => setPaymentMethod(m)}
                          style={{ accentColor: "#C0392B" }}
                        />
                        <span
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "#2C3E50",
                          }}
                        >
                          {m === "Cash" ? "💵 Cash" : "🌐 Online"}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={handleConfirmUpgrade}
                      disabled={upgrading}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "10px",
                        background: upgrading ? "#e08080" : "#C0392B",
                        color: "white",
                        border: "none",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        cursor: upgrading ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {upgrading ? "Processing…" : "Confirm Payment & Upgrade"}
                    </button>
                    <button
                      onClick={() => setUpgradeStep("select")}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "10px",
                        background: "transparent",
                        color: "#2C3E50",
                        border: "1px solid #E8DCD0",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Renew Modal ─────────────────────────────── */}
        {showRenew && (
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
              style={{
                background: "white",
                border: "1px solid #E8DCD0",
                borderRadius: "14px",
                padding: "36px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 20px 60px rgba(44,62,80,0.15)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#2C3E50",
                  margin: "0 0 16px",
                }}
              >
                Renew Membership
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#7F8C8D",
                  marginBottom: "20px",
                }}
              >
                You will be charged{" "}
                <strong style={{ color: "#C0392B" }}>
                  ৳{member?.yearlyFee}
                </strong>{" "}
                for one more year.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "24px",
                }}
              >
                {(["Cash", "Online"] as const).map((m) => (
                  <label
                    key={m}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "13px 16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: `1px solid ${renewPaymentMethod === m ? "#C0392B" : "#E8DCD0"}`,
                      background:
                        renewPaymentMethod === m
                          ? "rgba(192,57,43,0.04)"
                          : "white",
                      transition: "all 0.18s",
                    }}
                  >
                    <input
                      type="radio"
                      name="renewPayMethod"
                      value={m}
                      checked={renewPaymentMethod === m}
                      onChange={() => setRenewPaymentMethod(m)}
                      style={{ accentColor: "#C0392B" }}
                    />
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#2C3E50",
                      }}
                    >
                      {m === "Cash" ? "💵 Cash" : "🌐 Online"}
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleRenew}
                  disabled={paying}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    background: paying ? "#e08080" : "#C0392B",
                    color: "white",
                    border: "none",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    cursor: paying ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {paying ? "Processing…" : "Confirm Payment"}
                </button>
                <button
                  onClick={() => setShowRenew(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    background: "transparent",
                    color: "#2C3E50",
                    border: "1px solid #E8DCD0",
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
    </div>
  );
};

export default MyMembershipPage;
