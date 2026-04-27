import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const WhatsAppOptIn = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState("+91");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user || phone.length < 8) { onClose(); return; }
    setSaving(true);
    await supabase.from("profiles").update({ whatsapp_phone: phone }).eq("id", user.id);
    localStorage.setItem("restart_whatsapp_asked", "1");
    setSaving(false);
    onClose();
  };

  const skip = () => {
    localStorage.setItem("restart_whatsapp_asked", "1");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={skip}>
          <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
            transition={{ type: "spring", damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-rs-navy rounded-t-3xl p-6 border-t border-white/15">
            <button onClick={skip} className="absolute top-4 right-4 text-white/60"><X className="w-5 h-5" /></button>
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-white text-[20px] font-bold">Get your daily tip on WhatsApp</h3>
            <p className="text-rs-muted text-[13px] mt-2">1 message a day. No spam. Link back to your practice.</p>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel"
              className="w-full mt-5 bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white outline-none focus:border-rs-cream" />
            <button onClick={save} disabled={saving} className="w-full mt-3 py-3.5 btn-cream">
              Yes, send me tips
            </button>
            <button onClick={skip} className="w-full mt-2 text-rs-muted text-[13px] py-2">No thanks</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default WhatsAppOptIn;
