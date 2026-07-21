import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        background: "white",
        borderBottom: "1px solid #E8DCD0",
        boxShadow: "0 2px 8px rgba(44,62,80,0.05)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "72px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo + Brand – Peacock Blue */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "1.6rem",
              background: "#006D6F",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            📖
          </span>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#2C3E50",
              fontFamily: "Playfair Display, serif",
              letterSpacing: "0.02em",
            }}
          >
            Lighthouse
          </span>
        </Link>

        {/* Navigation links */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <NavLink to="/" label="Home" />
          <NavLink to="/books" label="Browse Books" />

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/profile" label="Profile" />

              <Link
                to="/notifications"
                style={{
                  position: "relative",
                  padding: "8px",
                  color: "#5D6D7E",
                  fontSize: "1.2rem",
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: "#006D6F",
                      color: "white",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      fontSize: "0.65rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  marginLeft: "8px",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  background: "#006D6F",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" label="Login" />
              <Link
                to="/register"
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  background: "#006D6F",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                  marginLeft: "4px",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    style={{
      padding: "8px 14px",
      borderRadius: "6px",
      textDecoration: "none",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#5D6D7E",
      transition: "color 0.2s, background 0.2s",
    }}
  >
    {label}
  </Link>
);

export default Navbar;
