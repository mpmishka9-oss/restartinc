import { useEffect, useState } from "react";
import CompletionScreen from "./CompletionScreen";

const PreviewCompletion = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem("restart_mood_d1", "2");
      localStorage.setItem("restart_mood_d2", "3");
      localStorage.setItem("restart_mood_d3", "5");
    } catch {}
    setReady(true);
  }, []);
  if (!ready) return null;
  return <CompletionScreen />;
};

export default PreviewCompletion;