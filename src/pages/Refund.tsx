 import { ArrowLeft } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import TopBar from "@/components/layout/TopBar";
 
 const Refund = () => {
   const nav = useNavigate();
   return (
     <div className="phone-frame min-h-screen bg-rs-navy text-white px-5 pt-12 pb-10 overflow-y-auto">
       <TopBar />
       <button onClick={() => nav(-1)} className="text-white/70 mb-6 inline-flex items-center gap-1 text-[13px]">
         <ArrowLeft className="w-4 h-4" /> Back
       </button>
       <h1 className="text-[24px] font-bold mb-6">Refund Policy</h1>
       <div className="space-y-4 text-[14px] text-white/80 leading-relaxed">
         <p>We offer a 14-day money-back guarantee for our Pro subscriptions.</p>
         <h2 className="text-white font-semibold mt-4">1. Eligibility</h2>
         <p>You can request a refund within 14 days of your initial purchase if you are not satisfied.</p>
         <h2 className="text-white font-semibold mt-4">2. Process</h2>
         <p>To request a refund, contact us via WhatsApp or email with your purchase details.</p>
         <h2 className="text-white font-semibold mt-4">3. Renewals</h2>
         <p>Refunds are not available for renewal payments once they have processed.</p>
         <p className="pt-6 text-[12px] opacity-60 italic">Last updated: April 30, 2026.</p>
       </div>
     </div>
   );
 };
 
 export default Refund;