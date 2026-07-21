import { useEffect, useState, useRef } from "react";
import useAuth from "../hooks/useAuth";
import { getMemberStatusApi, updateProfileApi } from "../api/memberApi";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";

// ─── Color theme (matches HomePage exactly) ───────────────────────────────────
const C = {
  bg: "#F9F6F0",
  primary: "#C0392B",
  dark: "#2C3E50",
  muted: "#95A5A6",
  muted2: "#7F8C8D",
  border: "#E8DCD0",
  cream: "#F0EDE8",
  card: "white",
};

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "8px",
  border: `1px solid ${C.border}`,
  background: "#FAFAFA",
  fontSize: "0.9rem",
  color: C.dark,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: C.muted2,
  marginBottom: "6px",
};

// ─── Component ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State (unchanged from original) ────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── Fetch profile (unchanged) ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }
    getMemberStatusApi()
      .then((data) => {
        setFullName(data.fullName || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setEmail(data.email || "");
        setProfilePicUrl(data.profilePictureUrl || "");
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // ── Preview URL (unchanged) ─────────────────────────────────────────────────
  useEffect(() => {
    if (profilePicFile) {
      const url = URL.createObjectURL(profilePicFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [profilePicFile]);

  // ── Save handler (unchanged) ────────────────────────────────────────────────
  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      if (phone) formData.append("phone", phone.trim());
      if (address) formData.append("address", address.trim());
      if (profilePicFile) formData.append("ProfilePictureFile", profilePicFile);

      await updateProfileApi(formData);

      const updated = await getMemberStatusApi();
      setFullName(updated.fullName || "");
      setPhone(updated.phone || "");
      setAddress(updated.address || "");
      setProfilePicUrl(updated.profilePictureUrl || "");
      setProfilePicFile(null);
      setSuccess("Profile updated successfully.");
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { title?: string } };
        message?: string;
      };
      setError(e?.response?.data?.title || e?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar URL (unchanged logic) ────────────────────────────────────────────
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5200";
  const displayedAvatar =
    previewUrl || (profilePicUrl ? `${API_BASE}${profilePicUrl}` : null);
  const initials = fullName ? fullName.charAt(0).toUpperCase() : "?";

  // ── Loading state ───────────────────────────────────────────────────────────
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
            <p style={{ color: C.muted }}>Loading profile…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      </div>
    );

  // ── Error state (no data) ───────────────────────────────────────────────────
  if (error && !fullName)
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
            <p style={{ fontSize: "2rem", marginBottom: "12px" }}>⚠️</p>
            <p style={{ color: C.primary, fontWeight: 600 }}>{error}</p>
          </div>
        </div>
      </div>
    );

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
      <DashboardSidebar />

      {/* Content */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {/* Page title */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: C.dark,
              margin: "0 0 4px",
            }}
          >
            My Profile
          </h1>
          <p style={{ fontSize: "0.875rem", color: C.muted, margin: 0 }}>
            Manage your personal information and profile photo.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              background: "rgba(192,57,43,0.08)",
              border: "1px solid rgba(192,57,43,0.25)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <p style={{ fontSize: "0.875rem", color: C.primary, margin: 0 }}>
              {error}
            </p>
          </div>
        )}
        {success && (
          <div
            style={{
              background: "rgba(39,174,96,0.08)",
              border: "1px solid rgba(39,174,96,0.25)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>✅</span>
            <p style={{ fontSize: "0.875rem", color: "#27ae60", margin: 0 }}>
              {success}
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "24px",
            alignItems: "start",
            maxWidth: "860px",
            margin: "0",
          }}
        >
          {/* ── LEFT: Avatar card ─────────────────────────────── */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "14px",
              padding: "32px 24px",
              boxShadow: "0 2px 8px rgba(44,62,80,0.05)",
              textAlign: "center",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                margin: "0 auto 16px",
                border: `3px solid ${C.primary}`,
                overflow: "hidden",
                background: displayedAvatar ? undefined : C.cream,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: C.primary,
                boxShadow: "0 4px 16px rgba(192,57,43,0.15)",
              }}
            >
              {displayedAvatar ? (
                <img
                  src={displayedAvatar}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>

            {/* Name + email */}
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: C.dark,
                margin: "0 0 4px",
              }}
            >
              {fullName || "Your Name"}
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                color: C.muted,
                margin: "0 0 20px",
                wordBreak: "break-all",
              }}
            >
              {email}
            </p>

            {/* Change photo button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: "transparent",
                border: `1px solid ${C.primary}`,
                color: C.primary,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s",
              }}
            >
              📷 Change Photo
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)}
              ref={fileInputRef}
              style={{ display: "none" }}
            />

            {/* Preview indicator */}
            {profilePicFile && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#27ae60",
                  marginTop: "8px",
                }}
              >
                ✓ New photo selected
              </p>
            )}

            {/* Divider */}
            <div
              style={{ borderTop: `1px solid ${C.border}`, margin: "20px 0" }}
            />

            {/* Info pills */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                textAlign: "left",
              }}
            >
              {[
                { icon: "📞", label: "Phone", value: phone || "Not provided" },
                {
                  icon: "📍",
                  label: "Address",
                  value: address || "Not provided",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: C.cream,
                    borderRadius: "8px",
                    padding: "10px 12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: C.muted,
                      margin: "0 0 3px",
                    }}
                  >
                    {item.icon} {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: item.value === "Not provided" ? C.muted : C.dark,
                      fontStyle:
                        item.value === "Not provided" ? "italic" : "normal",
                      margin: 0,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Edit form ──────────────────────────────── */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "14px",
              padding: "36px",
              boxShadow: "0 2px 8px rgba(44,62,80,0.05)",
            }}
          >
            {/* Form header */}
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: C.dark,
                  margin: "0 0 8px",
                }}
              >
                Edit Information
              </h2>
              <div
                style={{
                  width: "36px",
                  height: "3px",
                  background: C.primary,
                  borderRadius: "2px",
                }}
              />
            </div>

            {/* Fields */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  style={inputStyle}
                />
              </div>

              {/* Email — read only */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{
                      ...inputStyle,
                      background: C.cream,
                      color: C.muted,
                      cursor: "not-allowed",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: C.muted,
                      letterSpacing: "0.04em",
                    }}
                  >
                    READ ONLY
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: C.muted,
                    margin: "5px 0 0",
                  }}
                >
                  Email cannot be changed. Contact admin for email updates.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  style={inputStyle}
                />
              </div>

              {/* Address */}
              <div>
                <label style={labelStyle}>Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${C.border}` }} />

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  background: saving ? "#e08080" : C.primary,
                  color: "white",
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {saving ? (
                  <>
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default ProfilePage;
