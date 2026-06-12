import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Users, FileText, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — MediBot" }] }),
  component: AdminPage,
});

type Row = { category: string; created_at: string };

function AdminPage() {
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState({ users: 0, assessments: 0 });
  const [byCategory, setByCategory] = useState<{ category: string; count: number }[]>([]);
  const [overTime, setOverTime] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.user.id).maybeSingle();
      setRole((prof as { role: string } | null)?.role ?? null);
      if ((prof as { role: string } | null)?.role !== "admin") return;

      const [{ count: userCount }, { count: assessCount }, { data: rows }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("assessments").select("*", { count: "exact", head: true }),
        supabase.from("assessments").select("category,created_at"),
      ]);

      setStats({ users: userCount ?? 0, assessments: assessCount ?? 0 });

      const r = (rows as Row[]) ?? [];
      const catMap = new Map<string, number>();
      const dayMap = new Map<string, number>();
      r.forEach((a) => {
        catMap.set(a.category, (catMap.get(a.category) ?? 0) + 1);
        const d = new Date(a.created_at).toISOString().slice(0, 10);
        dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
      });
      setByCategory(Array.from(catMap, ([category, count]) => ({ category, count })));
      setOverTime(
        Array.from(dayMap, ([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
      );
    })();
  }, []);

  if (role && role !== "admin") {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto size-10 text-destructive" />
          <h1 className="mt-4 font-display text-xl font-bold">Admin access required</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your account does not have admin privileges.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatCard icon={Users} label="Total users" value={stats.users} />
          <StatCard icon={FileText} label="Total assessments" value={stats.assessments} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Assessments by category">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="category" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Assessments over time">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="font-display text-3xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}
