import { ReactNode } from "react";
import { motion } from "framer-motion";

const PhoneFrame = ({ children, className = "", noFrame = false }: { children: ReactNode; className?: string; noFrame?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={`phone-frame ${noFrame ? "" : "bg-app"} ${className}`}
  >
    {children}
  </motion.div>
);
export default PhoneFrame;
