import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  getMembershipTypesApi,
  getMemberStatusApi,
  joinMembershipApiForm,
} from "../api/memberApi";

interface MembershipType {
  membershipTypeId: number;
  name: string;
  description: string;
  yearlyFee: number | null;
  maxBooksCanBorrow: number;
  loanPeriodDays: number;
  canBorrowRareBooks: boolean;
}

// Color theme constants
const C = {
  bg: "#F9F6F0",
  primary: "#C0392B",
  dark: "#2C3E50",
  muted: "#95A5A6",
  muted2: "#7F8C8D",
  cardBg: "white",
  border: "#E8DCD0",
};

const cardStyle: React.CSSProperties = {
  background: C.cardBg,
  border: `1px solid ${C.border}`,
  borderRadius: "20px",
  padding: "28px 24px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  transition: "transform 0.2s, box-shadow 0.2s",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const MembershipPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedTypeId = (location.state as any)?.typeId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [types, setTypes] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const [step, setStep] = useState<"select" | "form" | "payment">("select");
  const [selectedType, setSelectedType] = useState<MembershipType | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    getMembershipTypesApi()
      .then((data: MembershipType[]) => {
        setTypes(data);
        if (preselectedTypeId) {
          const type = data.find(
            (t: MembershipType) => t.membershipTypeId === preselectedTypeId,
          );
          if (type) {
            setSelectedType(type);
            setStep("form");
            window.history.replaceState({}, document.title);
          }
        }
      })
      .catch(() => setError("Failed to load membership types."))
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      getMemberStatusApi()
        .then((res) => setStatus(res.membershipStatus))
        .catch(() => setStatus(null));
    }
  }, [isAuthenticated, preselectedTypeId]);

  useEffect(() => {
    if (profilePic) {
      const url = URL.createObjectURL(profilePic);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [profilePic]);

  const handleSelectType = (type: MembershipType) => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/membership");
      return;
    }
    if (status === "Approved" || status === "PendingApproval") {
      alert("You already have an active membership or pending application.");
      return;
    }
    setSelectedType(type);
    setStep("form");
  };

  const handleFormSubmit = () => {
    if (!fullName.trim()) {
      alert("Full name is required.");
      return;
    }
    if (selectedType?.yearlyFee && selectedType.yearlyFee > 0) {
      setStep("payment");
    } else {
      confirmJoin(undefined);
    }
  };

  const confirmJoin = async (method?: string) => {
    if (!selectedType) return;
    setJoining(true);
    try {
      const formData = new FormData();
      formData.append(
        "membershipTypeId",
        selectedType.membershipTypeId.toString(),
      );
      formData.append("fullName", fullName.trim());
      if (phone) formData.append("phone", phone.trim());
      if (address) formData.append("address", address.trim());
      if (method) formData.append("paymentMethod", method);
      if (profilePic) formData.append("ProfilePictureFile", profilePic);

      await joinMembershipApiForm(formData);
      alert("Your application has been submitted! Awaiting admin approval.");
      const res = await getMemberStatusApi();
      setStatus(res.membershipStatus);
      setStep("select");
      setSelectedType(null);
      setFullName("");
      setPhone("");
      setAddress("");
      setProfilePic(null);
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.title ||
        (err as any)?.response?.data?.message ||
        "Failed to join.";
      alert(message);
    } finally {
      setJoining(false);
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <p style={{ color: C.muted }}>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <p style={{ color: C.primary }}>{error}</p>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "48px 20px" }}>
      <style>{`
        /* Fix file input text color */
        input[type="file"] {
          color: ${C.dark};
          background-color: white;
          border-radius: 8px;
          border: 1px solid ${C.border};
          padding: 8px 12px;
          font-size: 0.85rem;
        }
        input[type="file"]::file-selector-button {
          background-color: ${C.primary};
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 16px;
          margin-right: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        input[type="file"]::file-selector-button:hover {
          background-color: #A93226;
        }
      `}</style>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "32px",
            color: C.dark,
          }}
        >
          📋 Become a Member
        </h2>

        {status === "PendingApproval" && (
          <div
            style={{
              background: "rgba(241,196,15,0.1)",
              border: "1px solid rgba(241,196,15,0.3)",
              borderRadius: "12px",
              padding: "12px 20px",
              textAlign: "center",
              marginBottom: "24px",
              color: "#d4ac0d",
            }}
          >
            ⏳ Your membership application is pending admin approval.
          </div>
        )}
        {status === "Approved" && (
          <div
            style={{
              background: "rgba(39,174,96,0.1)",
              border: "1px solid rgba(39,174,96,0.3)",
              borderRadius: "12px",
              padding: "12px 20px",
              textAlign: "center",
              marginBottom: "24px",
              color: "#27ae60",
            }}
          >
            ✅ You are already a member!
          </div>
        )}

        {/* Step 1: Select - Redesigned Cards */}
        {step === "select" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "28px",
            }}
          >
            {types.map((type) => (
              <div key={type.membershipTypeId} style={cardStyle}>
                <div style={{ marginBottom: "16px" }}>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: C.dark,
                      marginBottom: "8px",
                    }}
                  >
                    {type.name}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: C.muted }}>
                    {type.description || "Everything you need"}
                  </p>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  {type.yearlyFee ? (
                    <p>
                      <span
                        style={{
                          fontSize: "2rem",
                          fontWeight: 800,
                          color: C.primary,
                        }}
                      >
                        ৳{type.yearlyFee}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: C.muted2,
                          marginLeft: "4px",
                        }}
                      >
                        /year
                      </span>
                    </p>
                  ) : (
                    <p
                      style={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        color: "#27ae60",
                      }}
                    >
                      Free
                    </p>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    marginBottom: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#27ae60", fontSize: "1.1rem" }}>
                      ✓
                    </span>
                    <span style={{ color: C.dark }}>
                      <strong>{type.maxBooksCanBorrow}</strong> books at a time
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#27ae60", fontSize: "1.1rem" }}>
                      ✓
                    </span>
                    <span style={{ color: C.dark }}>
                      <strong>{type.loanPeriodDays}</strong>‑day loan period
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        color: type.canBorrowRareBooks ? "#27ae60" : "#e74c3c",
                        fontSize: "1.1rem",
                      }}
                    >
                      {type.canBorrowRareBooks ? "✓" : "✗"}
                    </span>
                    <span style={{ color: C.dark }}>
                      Rare books{" "}
                      {type.canBorrowRareBooks ? "allowed" : "not allowed"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#27ae60", fontSize: "1.1rem" }}>
                      ✓
                    </span>
                    <span style={{ color: C.dark }}>
                      Unlimited in‑library reading
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectType(type)}
                  disabled={
                    status === "Approved" || status === "PendingApproval"
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "40px",
                    border: "none",
                    background: C.primary,
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                    opacity:
                      status === "Approved" || status === "PendingApproval"
                        ? 0.6
                        : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (
                      !(status === "Approved" || status === "PendingApproval")
                    )
                      e.currentTarget.style.background = "#A93226";
                  }}
                  onMouseLeave={(e) => {
                    if (
                      !(status === "Approved" || status === "PendingApproval")
                    )
                      e.currentTarget.style.background = C.primary;
                  }}
                >
                  Choose {type.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Form (fixed text colors) */}
        {step === "form" && selectedType && (
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: "24px",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "24px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: C.dark,
                    marginBottom: "4px",
                  }}
                >
                  Your Details
                </h3>
                <p style={{ color: C.muted }}>
                  Selected plan:{" "}
                  <strong style={{ color: C.primary }}>
                    {selectedType.name}
                  </strong>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                {selectedType.yearlyFee ? (
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: C.primary,
                    }}
                  >
                    ৳{selectedType.yearlyFee}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#27ae60",
                    }}
                  >
                    Free
                  </span>
                )}
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: C.muted2,
                    display: "block",
                  }}
                >
                  per year
                </span>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: C.dark,
                    marginBottom: "6px",
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${C.border}`,
                    fontSize: "0.9rem",
                    color: C.dark,
                    background: "white",
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: C.dark,
                    marginBottom: "6px",
                  }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${C.border}`,
                    fontSize: "0.9rem",
                    color: C.dark,
                    background: "white",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: C.dark,
                    marginBottom: "6px",
                  }}
                >
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${C.border}`,
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    color: C.dark,
                    background: "white",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: C.dark,
                    marginBottom: "6px",
                  }}
                >
                  Profile Picture
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                    ref={fileInputRef}
                    style={{
                      flex: 1,
                      fontSize: "0.85rem",
                      color: C.dark,
                      background: "white",
                      borderRadius: "8px",
                      border: `1px solid ${C.border}`,
                      padding: "8px 12px",
                    }}
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `2px solid ${C.primary}`,
                      }}
                    />
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={handleFormSubmit}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "40px",
                    border: "none",
                    background: C.primary,
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Continue to Payment
                </button>
                <button
                  onClick={() => {
                    setStep("select");
                    setSelectedType(null);
                  }}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "40px",
                    border: `1px solid ${C.border}`,
                    background: "transparent",
                    color: C.dark,
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment (unchanged) */}
        {step === "payment" && selectedType && (
          <div
            style={{
              maxWidth: "450px",
              margin: "0 auto",
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: "24px",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: C.dark,
                marginBottom: "8px",
              }}
            >
              Payment
            </h3>
            <p style={{ color: C.muted, marginBottom: "24px" }}>
              Fee for{" "}
              <strong style={{ color: C.primary }}>{selectedType.name}</strong>
            </p>
            <div style={{ marginBottom: "28px" }}>
              <span
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: C.primary,
                }}
              >
                ৳{selectedType.yearlyFee}
              </span>
              <span style={{ color: C.muted2 }}>/year</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "28px",
                textAlign: "left",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: `1px solid ${C.border}`,
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Cash"
                  checked={paymentMethod === "Cash"}
                  onChange={() => setPaymentMethod("Cash")}
                  style={{ accentColor: C.primary }}
                />
                <span>💵 Cash (pay at library counter)</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: `1px solid ${C.border}`,
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Online"
                  checked={paymentMethod === "Online"}
                  onChange={() => setPaymentMethod("Online")}
                  style={{ accentColor: C.primary }}
                />
                <span>🌐 Online Payment</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => confirmJoin(paymentMethod)}
                disabled={joining}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "40px",
                  border: "none",
                  background: C.primary,
                  color: "white",
                  fontWeight: 600,
                  cursor: joining ? "not-allowed" : "pointer",
                  opacity: joining ? 0.7 : 1,
                }}
              >
                {joining ? "Processing..." : "Confirm & Join"}
              </button>
              <button
                onClick={() => setStep("form")}
                style={{
                  padding: "12px 24px",
                  borderRadius: "40px",
                  border: `1px solid ${C.border}`,
                  background: "transparent",
                  color: C.dark,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipPage;
