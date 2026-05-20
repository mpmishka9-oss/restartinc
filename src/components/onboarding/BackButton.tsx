import { ArrowLeft } from "lucide-react";

interface Props {
  onClick: () => void;
  className?: string;
  tone?: "light" | "dark";
}

const BackButton = ({ onClick, className = "", tone = "light" }: Props) => {
  const color = tone === "dark" ? "text-[#1A2A4A]/60 hover:text-[#1A2A4A]" : "text-rs-muted hover:text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium btn-press ${color} ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
};

export default BackButton;