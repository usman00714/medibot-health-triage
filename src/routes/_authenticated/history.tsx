import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { supabase } from "@/integrations/supabase/client";

type Assessment = {
  id: string;
  assessment_code: string;
  category: string;
  symptoms: string;
  ai_response: string | null;
  risk_level: string | null;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — MediBot" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Assessment | null>(null);

  useEffect(() => {
    supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as Assessment[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (report) return <Report assessment={report} onClose={() => setReport(null)} />;

  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold">Assessment history</h1>
        <p className="mt-2 text-muted-foreground">All your past assessments.</p>

        <div className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No assessments yet.</td></tr>
              )}
              {items.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{a.assessment_code}</td>
                  <td className="px-4 py-3">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 capitalize">{a.category}</td>
                  <td className="px-4 py-3"><RiskBadge level={a.risk_level} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setReport(a)}>
                      Download Report
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Report({ assessment, onClose }: { assessment: Assessment; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="flex-1 bg-white px-6 py-10 text-black">
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-6 flex justify-between">
          <Button variant="outline" onClick={onClose}>Back to history</Button>
          <Button onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
        </div>

        <div className="border-b pb-4">
          <div className="text-sm uppercase tracking-widest text-teal-700">MediBot Assessment Report</div>
          <h1 className="mt-2 text-3xl font-bold">{assessment.assessment_code}</h1>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="font-semibold">Date</dt><dd>{new Date(assessment.created_at).toLocaleString()}</dd></div>
          <div><dt className="font-semibold">Category</dt><dd className="capitalize">{assessment.category}</dd></div>
          <div><dt className="font-semibold">Risk Level</dt><dd>{assessment.risk_level}</dd></div>
        </dl>

        <section className="mt-8">
          <h2 className="text-lg font-bold">Reported symptoms</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{assessment.symptoms}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-bold">AI assessment</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{assessment.ai_response}</p>
        </section>

        <p className="mt-12 border-t pt-4 text-xs text-gray-600">
          MediBot provides informational assessments and is not a substitute for professional medical or veterinary advice.
        </p>
      </div>
    </main>
  );
}
