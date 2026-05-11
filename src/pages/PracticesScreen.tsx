import { motion } from "framer-motion";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import DidiChat from "@/components/DidiChat";

const PracticesScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen px-5 pb-28"
      style={{ paddingTop: 54 }}
    >
      <TopBar />
      <div className="mt-4">
        <DidiChat />
      </div>
      <BottomNav />
    </motion.div>
  );
};

export default PracticesScreen;
