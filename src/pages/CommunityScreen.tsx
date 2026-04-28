import { useState } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import { CHRONOTYPE_LABEL, CHRONOTYPE_EMOJI, type Chronotype } from "@/lib/restartData";

const CHANNELS: Chronotype[] = ["lion", "bear", "wolf", "dolphin"];

const CommunityScreen = () => {
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen px-5 pt-10 pb-28" style={{ paddingTop: 54 }}>
      <TopBar />
      <h1 className="text-[24px] font-bold text-white">ReStart Community</h1>
      <p className="text-rs-muted text-[13px] mt-1">Find your people. Show up together.</p>

      <div className="mt-6 space-y-3">
        {CHANNELS.map((c) => (
          <div key={c} className="rounded-2xl p-5 bg-white/13 border border-white/25">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CHRONOTYPE_EMOJI[c]}</span>
              <p className="text-white text-[16px] font-semibold">{CHRONOTYPE_LABEL[c]}s</p>
            </div>
            {done[c] ? (
              <p className="text-rs-cream text-[13px] mt-3">You're on the waitlist.</p>
            ) : (
              <>
                <p className="text-rs-muted text-[12px] mt-2">Coming soon — join the waitlist.</p>
                <div className="mt-3 flex gap-2">
                  <input type="email" placeholder="you@email.com" value={emails[c] ?? ""}
                    onChange={(e) => setEmails({ ...emails, [c]: e.target.value })}
                    className="flex-1 bg-white/10 border border-white/25 rounded-xl px-3 py-2 text-white placeholder:text-white/40 text-[13px] outline-none" />
                  <button onClick={() => emails[c] && setDone({ ...done, [c]: true })}
                    className="px-4 py-2 btn-cream text-[13px]">Join</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </motion.div>
  );
};
export default CommunityScreen;
