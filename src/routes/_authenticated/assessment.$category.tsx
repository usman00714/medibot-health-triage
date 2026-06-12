import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Send, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RiskBadge } from "@/components/RiskBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const labels: Record<string, string> = {
  human: "Human Health",
  pet: "Pet Health",
  cattle: "Cattle Health",
};

export const Route = createFileRoute("/_authenticated/assessment/$category")({
  beforeLoad: ({ params }) => {
    if (!labels[params.category]) throw notFound();
  },
  head: ({ params }) => ({
    meta: [{ title: `${labels[params.category] ?? "Assessment"} — MediBot` }],
  }),
  component: AssessmentPage,
  notFoundComponent: () => <div className="p-8">Unknown category.</div>,
});

type Result = {
  code: string;
  response: string;
  risk: string;
};

function generateCode() {
  const n = Math.floor(Math.random() * 900) + 100;
  return `MB-${new Date().getFullYear()}-${String(n).padStart(3, "0")}`;
}

function AssessmentPage() {
  const { category } = Route.useParams();
  const [symptoms, setSymptoms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe the symptoms.");
      return;
    }
    setSubmitting(true);
    try {
      // STUB: AI integration will be added next. Generate placeholder.
      const risks = ["Low", "Medium", "High", "Critical"];
      const risk = risks[Math.floor(Math.random() * risks.length)];
      const code = generateCode();
      const aiResponse =
        "This is a placeholder assessment. The AI model will be integrated in the next step and will analyze the symptoms in detail, recommending next actions appropriate to the risk level.";

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");

      const { error } = await supabase.from("assessments").insert({
        assessment_code: code,
        user_id: userData.user.id,
        category,
        symptoms,
        ai_response: aiResponse,
        risk_level: risk,
      });
      if (error) throw error;

      setResult({ code, response: aiResponse, risk });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSymptoms("");
  };

  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/dashboard"><ArrowLeft className="size-4" /> Back to dashboard</Link>
        </Button>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">
            {labels[category]}
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">Describe the symptoms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Be as specific as possible — duration, severity, and any context.
          </p>

          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={!!result || submitting}
            placeholder="e.g. Fever of 39°C for two days, dry cough, fatigue…"
            className="mt-5 min-h-40"
          />

          {!result && (
            <Button onClick={handleSubmit} disabled={submitting} className="mt-4">
              <Send className="size-4" /> {submitting ? "Analyzing…" : "Submit assessment"}
            </Button>
          )}
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                <Sparkles className="size-4 text-primary" /> {result.code}
              </div>
              <RiskBadge level={result.risk} />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">AI Assessment</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {result.response}
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={reset}>New assessment</Button>
              <Button asChild variant="ghost"><Link to="/history">View history</Link></Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
