import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Dog, Beef, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediBot — AI Health Triage for People, Pets & Cattle" },
      { name: "description", content: "Free AI-powered symptom assessment. Supports SDG 3: Good Health & Well-Being." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="hero-gradient flex-1">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <ShieldCheck className="size-3.5" />
            SDG 3 · Good Health & Well-Being
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            AI health triage for <span className="text-primary">people, pets & cattle</span>.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            MediBot listens to symptoms and instantly returns a risk assessment and next steps —
            for your family, your companion animals, and your livestock.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "register" }}>Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ mode: "login" }}>Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Activity, title: "Human Health", desc: "Triage symptoms for adults and children." },
            { icon: Dog, title: "Pet Health", desc: "Quick checks for dogs, cats, and small animals." },
            { icon: Beef, title: "Cattle Health", desc: "Field-ready guidance for livestock owners." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur">
              <Icon className="size-6 text-primary" />
              <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          Built for the UN Sustainable Development Goal 3
        </div>
      </div>
    </main>
  );
}
