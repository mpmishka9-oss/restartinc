 import { ArrowLeft } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import TopBar from "@/components/layout/TopBar";
 
 const Terms = () => {
   const nav = useNavigate();
   return (
     <div className="phone-frame min-h-screen bg-rs-navy text-white px-5 pt-12 pb-10 overflow-y-auto">
       <TopBar />
       <button onClick={() => nav(-1)} className="text-white/70 mb-6 inline-flex items-center gap-1 text-[13px]">
         <ArrowLeft className="w-4 h-4" /> Back
       </button>
       <h1 className="text-[24px] font-bold mb-6">Terms and Conditions</h1>
       <div className="space-y-4 text-[14px] text-white/80 leading-relaxed">
         <p>Welcome to reStart. By using our application, you agree to these terms.</p>
         <h2 className="text-white font-semibold mt-4">1. Use of Service</h2>
         <p>reStart provides a digital wellness platform. You must use it responsibly and follow the protocols as intended.</p>
         <h2 className="text-white font-semibold mt-4">2. Subscriptions</h2>
         <p>Payments are handled by Paddle. Subscriptions renew automatically unless canceled.</p>
         <h2 className="text-white font-semibold mt-4">3. Limitation of Liability</h2>
         <p>reStart is not a medical device. Consult a professional for health concerns.</p>
         <p className="pt-6 text-[12px] opacity-60 italic">Last updated: April 30, 2026. Legal Entity: [Your Business Name]</p>
       </div>
     </div>
   );
 };
 
 export default Terms;