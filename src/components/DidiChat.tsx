import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import logoImg from "@/assets/logo.png";
import { Send } from "lucide-react";

type Msg = {
  role: "didi" | "user";
  text: string;
  card?: { name: string; reason: string; module?: string };
  quickReplies?: string[];
};

const CHRONOTYPE_WINDOW: Record<string, string> = {
  lion: "5–9am",
  bear: "9am–12pm",
  wolf: "5–9pm",
  dolphin: "10am–2pm",
};

const xpLevel = (xp: number) =>
  xp >= 600 ? "Awakened" : xp >= 300 ? "Practitioner" : xp >= 100 ? "Explorer" : "Seeker";

const todayStr = () => new Date().toISOString().slice(0, 10);

const DidiChat = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const nav = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [xp, setXp] = useState<number>(() => Number(localStorage.getItem("restart_didi_xp") || 0));
  const [streak, setStreak] = useState<number>(() => Number(localStorage.getItem("restart_didi_streak") || 0));
  const [exchangeCount, setExchangeCount] = useState(0);
  const sentFirstRef = useRef(false);

  // Streak handling
  useEffect(() => {
    const last = localStorage.getItem("restart_didi_last_date");
    const today = todayStr();
    if (last !== today) {
      let next = 1;
      if (last) {
        const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000;
        if (diff === 1) next = streak + 1;
        else next = 1;
      }
      localStorage.setItem("restart_didi_streak", String(next));
      localStorage.setItem("restart_didi_last_date", today);
      setStreak(next);
      if (next >= 3) awardXP(50, "3-day streak with me ✦ +50 XP. This is becoming a habit.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opening message
  useEffect(() => {
    if (sentFirstRef.current) return;
    sentFirstRef.current = true;
    const t = setTimeout(() => {
      const firstName = (profile?.name || "").split(" ")[0] || "friend";
      const chronotype = profile?.chronotype || "natural";
      const window = CHRONOTYPE_WINDOW[chronotype] || "your peak hours";
      setMessages([
        {
          role: "didi",
          text: `Hey ${firstName} 🌿 I've been looking at your patterns. As a ${chronotype}, your best window is ${window}. How are you feeling stepping in today?`,
          quickReplies: ["Pretty good actually", "A bit off today", "I need something specific"],
        },
      ]);
    }, 600);
    return () => clearTimeout(t);
  }, [profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const persistXP = async (newXP: number) => {
    setXp(newXP);
    localStorage.setItem("restart_didi_xp", String(newXP));
    if (user) {
      await supabase.from("profiles").update({ didi_xp: newXP } as any).eq("id", user.id);
    }
  };

  const awardXP = (amount: number, note?: string) => {
    const next = xp + amount;
    persistXP(next);
    if (note) {
      setMessages((m) => [...m, { role: "didi", text: note }]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", text };
    // strip quick replies on existing messages
    const cleared = messages.map((m) => ({ ...m, quickReplies: undefined }));
    const next = [...cleared, userMsg];
    setMessages(next);
    setInput("");

    // First message of the day XP
    const lastMsgDate = localStorage.getItem("restart_didi_first_msg_date");
    if (lastMsgDate !== todayStr()) {
      localStorage.setItem("restart_didi_first_msg_date", todayStr());
      awardXP(10, "That just earned you 10 XP ✦ Showing up counts.");
    }

    const newCount = exchangeCount + 1;
    setExchangeCount(newCount);

    setTyping(true);
    try {
      const firstName = (profile?.name || "").split(" ")[0] || "friend";
      const apiMessages = next.map((m) => ({
        role: m.role === "didi" ? "assistant" : "user",
        content: m.text,
      }));
      const { data, error } = await supabase.functions.invoke("didi-chat", {
        body: {
          messages: apiMessages,
          context: {
            first_name: firstName,
            chronotype: profile?.chronotype || "natural",
            last_3_mood_entries: "recent check-ins",
            completed_practices: profile?.completed_practices ?? 0,
          },
        },
      });
      if (error) throw error;
      const reply = (data as any)?.reply || "I'm here. Tell me a little more?";
      setMessages((m) => [...m, { role: "didi", text: reply }]);

      if (newCount === 3) {
        setTimeout(() => awardXP(15, "You're on a roll — +15 XP ✦"), 400);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "didi", text: "I lost the thread for a moment. Try again?" }]);
    } finally {
      setTyping(false);
    }
  };

  const goToJourney = () => {
    awardXP(20, "Taking action. That's +20 XP ✦ I see you.");
    nav("/journey");
  };

  const level = xpLevel(xp);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #B8D4E0 0%, #D4C5E8 100%)",
        borderRadius: 16,
        padding: "14px 16px",
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", width: 40, height: 40 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%", background: "#1A2A4A",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}
          >
            <img src={logoImg} alt="Didi" style={{ width: 26, height: 26, objectFit: "contain" }} />
          </div>
          <span
            style={{
              position: "absolute", bottom: 0, right: 0, width: 8, height: 8,
              borderRadius: "50%", background: "#4CAF82", border: "1.5px solid #B8D4E0",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A2A4A" }}>Didi</div>
          <div style={{ fontSize: 10, color: "rgba(26,42,74,0.5)" }}>Your wellness guide · online</div>
        </div>
        {streak >= 2 && (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1A2A4A", marginRight: 4 }}>
            🔥 {streak}
          </span>
        )}
        <span
          style={{
            background: "#F2EE9A", color: "#5A4A1A", borderRadius: 20,
            padding: "4px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
          }}
        >
          ✦ {xp} XP · {level}
        </span>
      </div>

      {/* Chat window */}
      <div
        ref={scrollRef}
        style={{
          height: 260, overflowY: "auto", padding: "12px 0",
          display: "flex", flexDirection: "column", gap: 10,
        }}
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} onQuickReply={sendMessage} onJourney={goToJourney} />
        ))}
        {typing && <TypingDots />}
      </div>

      {/* Input bar */}
      <div
        style={{
          background: "rgba(255,255,255,0.7)", borderRadius: 24,
          border: "1px solid rgba(26,42,74,0.15)", padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Talk to Didi..."
          style={{
            flex: 1, fontSize: 13, border: "none", background: "transparent",
            outline: "none", color: "#1A2A4A",
          }}
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={!input.trim()}
          style={{
            width: 32, height: 32, borderRadius: "50%", background: "#1A2A4A",
            color: "white", display: "flex", alignItems: "center", justifyContent: "center",
            opacity: input.trim() ? 1 : 0.4, border: "none", cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          <Send size={14} />
        </button>
      </div>

      <style>{`
        @keyframes didiPulse { 0%,80%,100% { opacity: 0.3; } 40% { opacity: 1; } }
        .didi-dot { width: 6px; height: 6px; border-radius: 50%; background: #1A2A4A; display: inline-block; margin: 0 2px; animation: didiPulse 1.2s infinite; }
        .didi-dot:nth-child(2) { animation-delay: 0.2s; }
        .didi-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

const MessageBubble = ({
  msg, onQuickReply, onJourney,
}: { msg: Msg; onQuickReply: (t: string) => void; onJourney: () => void }) => {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            background: "#1A2A4A", color: "white", borderRadius: "14px 0 14px 14px",
            padding: "10px 14px", maxWidth: "80%", fontSize: 13, lineHeight: 1.5,
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
      <div
        style={{
          width: 20, height: 20, borderRadius: "50%", background: "#1A2A4A",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          overflow: "hidden", marginTop: 2,
        }}
      >
        <img src={logoImg} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "80%" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.75)", borderRadius: "0 14px 14px 14px",
            padding: "10px 14px", fontSize: 13, color: "#1A2A4A", lineHeight: 1.5,
          }}
        >
          {msg.text}
        </div>
        {msg.card && (
          <div
            style={{
              background: "linear-gradient(135deg, #E8D5F0, #B8D4E0)",
              borderRadius: 12, padding: "12px 14px", width: "100%",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2A4A" }}>{msg.card.name}</div>
            <div style={{ fontSize: 11, color: "rgba(26,42,74,0.6)", marginTop: 2 }}>{msg.card.reason}</div>
            <button
              onClick={onJourney}
              style={{
                marginTop: 8, background: "#1A2A4A", color: "white",
                borderRadius: 8, padding: "6px 12px", fontSize: 11, border: "none", cursor: "pointer",
              }}
            >
              Go to Journey →
            </button>
          </div>
        )}
        {msg.quickReplies && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
            {msg.quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => onQuickReply(q)}
                style={{
                  background: "rgba(255,255,255,0.7)", border: "1px solid rgba(26,42,74,0.15)",
                  borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#1A2A4A",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
    <div
      style={{
        width: 20, height: 20, borderRadius: "50%", background: "#1A2A4A",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        overflow: "hidden", marginTop: 2,
      }}
    >
      <img src={logoImg} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
    </div>
    <div
      style={{
        background: "rgba(255,255,255,0.75)", borderRadius: "0 14px 14px 14px",
        padding: "10px 14px",
      }}
    >
      <span className="didi-dot" />
      <span className="didi-dot" />
      <span className="didi-dot" />
    </div>
  </div>
);

export default DidiChat;