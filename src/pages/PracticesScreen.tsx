import { motion } from "framer-motion";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import DidiChat from "@/components/DidiChat";
import restartLogo from "@/assets/restart-logo.png";

const PracticesScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen px-5 pb-28 relative overflow-hidden"
      style={{
        paddingTop: 54,
        background:
          "radial-gradient(circle at 50% 42%, #feffaf 0%, #c8dde8 22%, #a0c8dc 48%, #7bb0cc 78%, #5a9bb8 100%)",
      }}
    >
      {/* Ghost brain logo — atmospheric background */}
      <img
        src={restartLogo}
        alt=""
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: 280,
          opacity: 0.12,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      {/* Content floats above the ghost image */}
      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar />
        <div className="mt-4">
          <DidiChat />
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default PracticesScreen;
