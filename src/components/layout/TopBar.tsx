import logo from "@/assets/logo.png";

const TopBar = () => (
  <div
    className="fixed top-0 left-0 right-0 z-50 flex items-center px-5"
    style={{ height: 44, background: "transparent" }}
  >
    <img src={logo} alt="reStart" style={{ height: 28, objectFit: "contain" }} />
  </div>
);
export default TopBar;