import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";

const UserLayout = () => (
  <div style={{ minHeight: "100vh", background: "#F9F6F0" }}>
    <Navbar />
    <main style={{ paddingTop: "80px" }}>
      {" "}
      {/* pushes content below sticky navbar */}
      <Outlet />
    </main>
  </div>
);

export default UserLayout;
