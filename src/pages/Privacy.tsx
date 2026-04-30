 import { ArrowLeft } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import TopBar from "@/components/layout/TopBar";
 
 const Privacy = () => {
   const nav = useNavigate();
   return (
     <div className="phone-frame min-h-screen bg-rs-navy text-white px-5 pt-12 pb-10 overflow-y-auto">
       <TopBar />
       <button onClick={() => nav(-1)} className="text-white/70 mb-6 inline-flex items-center gap-1 text-[13px]">
         <ArrowLeft className="w-4 h-4" /> Back
       </button>
       <h1 className="text-[24px] font-bold mb-6">Privacy Policy</h1>
       <div className="space-y-4 text-[14px] text-white/80 leading-relaxed">
         <p>Your privacy is important to us. This policy explains how we handle your data.</p>
         <h2 className="text-white font-semibold mt-4">1. Data Collection</h2>
         <p>We collect your onboarding answers, chronotype, and check-in logs to personalize your experience.</p>
         <h2 className="text-white font-semibold mt-4">2. Data Security</h2>
         <p>We use industry-standard encryption and Supabase for secure data storage.</p>
         <h2 className="text-white font-semibold mt-4">3. Third Parties</h2>
         <p>We share data with Paddle for payment processing and Supabase for authentication.</p>
         <p className="pt-6 text-[12px] opacity-60 italic">Last updated: April 30, 2026. Contact: [Your Email]</p>
       </div>
     </div>
   );
 };
 
 export default Privacy;