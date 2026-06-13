import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Send, ArrowLeft, Sparkles, AlertTriangle, HeartPulse } from "lucide-react";
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

type Assessment = {
  possible_causes: string[];
  follow_up_questions: string[];
  risk_level: "Low" | "Medium" | "High" | "Critical";
  recommendation: string;
  care_suggestions: string[];
  see_professional: boolean;
};

type Result = { code: string; assessment: Assessment };

function generateCode() {
  const n = Math.floor(Math.random() * 900) + 100;
  return `MB-${new Date().getFullYear()}-${String(n).padStart(3, "0")}`;
}

function stripFences(s: string) {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
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
      const { data, error } = await supabase.functions.invoke("assess", {
        body: { category, symptoms },
      });
      if (error) throw error;

      let assessment: Assessment | null = null;
      if (data?.assessment && typeof data.assessment === "object") {
        assessment = data.assessment as Assessment;
      } else if (typeof data === "string") {
        assessment = JSON.parse(stripFences(data));
      }
      if (!assessment) throw new Error("Empty AI response");

      const code = generateCode();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");

      const { error: insErr } = await supabase.from("assessments").insert({
        assessment_code: code,
        user_id: userData.user.id,
        category,
        symptoms,
        ai_response: JSON.stringify(assessment),
        risk_level: assessment.risk_level,
      });
      if (insErr) throw insErr;

      setResult({ code, assessment });
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

        {result && <ResultView result={result} onReset={reset} />}
      </div>
    </main>
  );
}

function ResultView({ result, onReset }: { result: Result; onReset: () => void }) {
  const a = result.assessment;
  const urgent = a.care_suggestions.length === 0;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
            <Sparkles className="size-4 text-primary" /> {result.code}
          </div>
          <RiskBadge level={a.risk_level} />
        </div>

        <h2 className="mt-4 font-display text-xl font-bold">Recommendation</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{a.recommendation}</p>

        {a.possible_causes?.length > 0 && (
          <>
            <h3 className="mt-6 font-semibold">Possible causes</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {a.possible_causes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </>
        )}

        {a.follow_up_questions?.length > 0 && (
          <>
            <h3 className="mt-6 font-semibold">Follow-up questions</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {a.follow_up_questions.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </>
        )}
      </div>

      {urgent ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-display text-lg font-bold">Seek urgent professional care</h3>
              <p className="mt-1 text-sm">
                Based on the risk level, home care is not appropriate. Please contact a doctor,
                emergency service, or veterinarian immediately.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <HeartPulse className="size-5 text-primary" />
            <h3 className="font-display text-lg font-bold">General Care Suggestions</h3>
          </div>
          <ul className="mt-3 list-disc pl-5 text-sm space-y-1">
            {a.care_suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            These are general suggestions only, not a prescription. Consult a doctor or
            veterinarian before taking or administering any medication.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onReset}>New assessment</Button>
        <Button asChild variant="ghost"><Link to="/history">View history</Link></Button>
      </div>
    </div>
  );
}
