import { useEffect, useRef, useCallback } from "react";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";

// 30 মিনিট — চাইলে বদলাও
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
// User activity detect করার events
const ACTIVITY_EVENTS: string[] = [
  "mousemove",
  "mousedown",
  "keypress",
  "scroll",
  "touchstart",
  "click",
];

const useIdleTimeout = (): void => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(async (): Promise<void> => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const resetTimer = useCallback((): void => {
    // আগের timer বাতিল করো
    if (timerRef.current) clearTimeout(timerRef.current);

    // নতুন timer শুরু করো
    timerRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    // Logged in না থাকলে কিছু করার দরকার নেই
    if (!isAuthenticated) return;

    // সব activity event এ timer reset করো
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer),
    );

    // প্রথমবার timer শুরু করো
    resetTimer();

    // Cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
    };
  }, [isAuthenticated, resetTimer]);
};

export default useIdleTimeout;
