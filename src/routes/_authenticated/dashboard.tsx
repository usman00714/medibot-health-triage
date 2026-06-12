import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Dog, Beef, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MediBot" }] }),
  component: Dashboard,
});

const categories = [
  { slug: "human", title: "Human Health", desc: "Symptoms for adults and children.", icon: Activity },
  { slug: "pet", title: "Pet Health", desc: "Dogs, cats, and small companions.", icon: Dog },
  { slug: "cattle", title: "Cattle Health", desc: "Livestock & farm animals.", icon: Beef },
] as const;

function Dashboard() {
  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold">Start a new assessment</h1>
        <p className="mt-2 text-muted-foreground">Pick a category to describe symptoms.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ slug, title, desc, icon: Icon }) => (
            <Link
              key={slug}
              to="/assessment/$category"
              params={{ category: slug }}
              className="group rounded-2xl border bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Start assessment <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
