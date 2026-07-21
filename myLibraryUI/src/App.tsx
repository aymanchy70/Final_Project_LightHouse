import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";

const App = (): JSX.Element => (
  <AuthProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#FFFFFF",
          color: "#2C3E50",
          border: "1px solid #E8DCD0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          fontSize: "0.85rem",
          fontWeight: 500,
        },
      }}
    />{" "}
    <AppRouter />
  </AuthProvider>
);
export default App;
