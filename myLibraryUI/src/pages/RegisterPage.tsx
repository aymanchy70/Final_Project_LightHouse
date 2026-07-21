import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/common/Navbar";
import type { RegisterFormErrors } from "../types/auth.types";

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
}

const STRENGTH_COLORS = [
  "",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#16a34a",
] as const;
const STRENGTH_LABELS = [
  "",
  "Weak",
  "Fair",
  "Good",
  "Strong",
  "Very Strong",
] as const;

const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading, error, clearError } = useAuth();

  const [form, setForm] = useState<RegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = (): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};
    if (!form.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Enter a valid email address";
    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    else if (!/[A-Z]/.test(form.password))
      errors.password = "Password must contain at least one uppercase letter";
    else if (!/[a-z]/.test(form.password))
      errors.password = "Password must contain at least one lowercase letter";
    else if (!/[0-9]/.test(form.password))
      errors.password = "Password must contain at least one digit";
    if (!form.confirmPassword)
      errors.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof RegisterFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (result.success) {
      setSuccessMsg(result.message ?? "Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  const getStrength = (): number => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthLevel = getStrength();

  // ── Shared input style ────────────────────────────────────────────────────
  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: `1px solid ${hasError ? "#C0392B" : "#E8DCD0"}`,
    background: "#FAFAFA",
    fontSize: "0.9rem",
    color: "#2C3E50",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F9F6F0" }}>
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
        {/* Card */}
        <div
          style={{
            background: "white",
            border: "1px solid #E8DCD0",
            borderRadius: "16px",
            padding: "40px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 4px 24px rgba(44,62,80,0.08)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "10px" }}>✨</p>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#2C3E50",
                margin: "0 0 6px",
              }}
            >
              Create Account
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#95A5A6", margin: 0 }}>
              Join BookHeaven — it's completely free
            </p>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div
              style={{
                background: "rgba(39,174,96,0.08)",
                border: "1px solid rgba(39,174,96,0.3)",
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
                {successMsg}
              </p>
            </div>
          )}
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
              <p style={{ fontSize: "0.875rem", color: "#C0392B", margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#7F8C8D",
                  marginBottom: "7px",
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                style={inputStyle(!!formErrors.email)}
              />
              {formErrors.email && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#C0392B",
                    margin: "5px 0 0",
                  }}
                >
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#7F8C8D",
                  marginBottom: "7px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min 6 chars, upper + lower + digit"
                  value={form.password}
                  onChange={handleChange}
                  style={{
                    ...inputStyle(!!formErrors.password),
                    paddingRight: "52px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#C0392B",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {formErrors.password && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#C0392B",
                    margin: "5px 0 0",
                  }}
                >
                  {formErrors.password}
                </p>
              )}

              {/* Strength meter */}
              {form.password && (
                <div style={{ marginTop: "10px" }}>
                  <div
                    style={{ display: "flex", gap: "4px", marginBottom: "5px" }}
                  >
                    {([1, 2, 3, 4, 5] as const).map((i) => (
                      <div
                        key={i}
                        style={{
                          height: "4px",
                          flex: 1,
                          borderRadius: "4px",
                          background:
                            i <= strengthLevel
                              ? STRENGTH_COLORS[strengthLevel]
                              : "#E8DCD0",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: STRENGTH_COLORS[strengthLevel],
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    {STRENGTH_LABELS[strengthLevel]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "28px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#7F8C8D",
                  marginBottom: "7px",
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  style={{
                    ...inputStyle(!!formErrors.confirmPassword),
                    paddingRight: "52px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#C0392B",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#C0392B",
                    margin: "5px 0 0",
                  }}
                >
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                background: submitting ? "#e08080" : "#C0392B",
                color: "white",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.2s",
              }}
            >
              {submitting ? (
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
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "24px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#E8DCD0" }} />
            <span style={{ fontSize: "0.78rem", color: "#95A5A6" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#E8DCD0" }} />
          </div>

          {/* Login link */}
          <p
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              color: "#95A5A6",
              margin: 0,
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#C0392B",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RegisterPage;
