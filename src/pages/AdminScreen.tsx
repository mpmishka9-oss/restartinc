import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const ADMIN_EMAIL = "mpmishka9@gmail.com";

const AdminScreen = () => {
  const { user, loading } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) return;
    (async () => {
      setDataLoading(true);
      const [p, c] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("check_ins").select("*").order("time_of_checkin", { ascending: false }),
      ]);
      if (p.error) setError(p.error.message);
      if (c.error) setError(c.error.message);
      setProfiles(p.data ?? []);
      setCheckIns(c.data ?? []);
      setDataLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return <div className="p-8 text-center">Not authorised.</div>;
  }

  const emailById = new Map(profiles.map((p) => [p.id, p.email]));
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="min-h-screen bg-background p-6 space-y-10">
      <header>
        <h1 className="text-2xl font-bold">Admin · Founder console</h1>
        <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
      </header>

      {error && <div className="text-destructive text-sm">{error}</div>}
      {dataLoading && <div className="text-sm text-muted-foreground">Loading data…</div>}

      <section>
        <h2 className="text-lg font-semibold mb-3">Users ({profiles.length})</h2>
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Chronotype</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Onboarded</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name ?? "—"}</TableCell>
                  <TableCell>{p.email ?? "—"}</TableCell>
                  <TableCell>{p.chronotype ?? "—"}</TableCell>
                  <TableCell>{p.path ?? "—"}</TableCell>
                  <TableCell>{p.onboarding_completed ? "✓" : "—"}</TableCell>
                  <TableCell>{p.current_day}</TableCell>
                  <TableCell>{p.streak_days}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmt(p.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Check-ins ({checkIns.length})</h2>
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User email</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Intensity</TableHead>
                <TableHead>Blocker</TableHead>
                <TableHead>Didi response</TableHead>
                <TableHead>Practices shown</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkIns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{emailById.get(c.user_id) ?? c.user_id.slice(0, 8)}</TableCell>
                  <TableCell>{c.detected_state ?? "—"}</TableCell>
                  <TableCell>{c.intensity_score ?? "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={c.blocker ?? ""}>{c.blocker ?? "—"}</TableCell>
                  <TableCell className="max-w-[280px] truncate" title={c.didi_response ?? ""}>{c.didi_response ?? "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={JSON.stringify(c.practices_shown)}>
                    {Array.isArray(c.practices_shown) ? `${c.practices_shown.length} items` : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{fmt(c.time_of_checkin)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default AdminScreen;