import { createContext, useContext, useState, ReactNode } from "react";
import type { Path, Chronotype } from "@/lib/restartData";

interface AppState {
  path: Path | null;
  name: string;
  age: string;
  email: string;
  goal: string;
  chronotype: Chronotype | null;
  setPath: (p: Path) => void;
  setOnboardingData: (d: { name?: string; age?: string; email?: string; goal?: string; chronotype?: Chronotype }) => void;
}

const Ctx = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [path, setPathState] = useState<Path | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [chronotype, setChronotype] = useState<Chronotype | null>(null);

  return (
    <Ctx.Provider value={{
      path, name, age, email, goal, chronotype,
      setPath: setPathState,
      setOnboardingData: (d) => {
        if (d.name !== undefined) setName(d.name);
        if (d.age !== undefined) setAge(d.age);
        if (d.email !== undefined) setEmail(d.email);
        if (d.goal !== undefined) setGoal(d.goal);
        if (d.chronotype !== undefined) setChronotype(d.chronotype);
      },
    }}>{children}</Ctx.Provider>
  );
};

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
};
