import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  category: string;
  symptoms: string;
  risk_level: string | null;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/client")({
  head: () => ({ meta: [{ title: "Client — MediBot" }] }),
  component: ClientPage,
});

function ClientPage() {
  const [role, setRole] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.user.id).maybeSingle();
      const r = (prof as { role: string } | null)?.role ?? null;
      setRole(r);
      if (r !== "client") return;
      const { data } = await supabase
        .from("assessments")
        .select("id,category,symptoms,risk_level,created_at")
        .order("created_at", { ascending: false });
      setRows((data as Row[]) ?? []);
    })();
  }, []);

  if (role && role !== "client") {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto size-10 text-destructive" />
          <h1 className="mt-4 font-display text-xl font-bold">Client access required</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your account does not have client privileges.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold">Client dashboard</h1>
        <p className="mt-2 text-muted-foreground">Read-only view of all assessments.</p>

        <div className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Symptoms</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No assessments.</td></tr>
              )}
              {rows.map((a) => (
                <tr key={a.id} className="border-t align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 capitalize">{a.category}</td>
                  <td className="px-4 py-3 max-w-md">{a.symptoms}</td>
                  <td className="px-4 py-3"><RiskBadge level={a.risk_level} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
