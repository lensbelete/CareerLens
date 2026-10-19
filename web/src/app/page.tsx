import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

export default function Home() {
  return (
    <div className="min-h-screen text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Wordmark />
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/login" className="px-3 py-2 text-muted hover:text-ink">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-sm bg-pine px-4 py-2 text-[13px] font-medium tracking-wide text-cream hover:bg-ink"
          >
            Create account
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid items-end gap-12 border-b border-line py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-pine">
              A quieter kind of job intelligence
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.08] text-ink sm:text-6xl">
              See the overlap. Keep the doubt honest.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
              CareerLens compares a CV with a job description and shows what is
              evidenced, inferred, or missing. The score is overlap — not a
              prediction that you will be hired.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-sm bg-pine px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink"
              >
                Start with a profile
              </Link>
              <Link
                href="/login"
                className="rounded-sm border border-line bg-white px-5 py-2.5 text-sm hover:border-ink/30"
              >
                Use the demo account
              </Link>
            </div>
          </div>
          <aside className="rounded-sm border border-line bg-white p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-pine">
              Specimen · Senior Frontend
            </p>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-sm text-muted">Match method · lexical</p>
              <p className="font-serif text-5xl tabular-nums">68</p>
            </div>
            <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Explicit</dt>
                <dd>TypeScript, React</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Inferred</dt>
                <dd>Next.js</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Missing</dt>
                <dd className="text-right">None required</dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-5 text-muted">
              Illustration of a scored listing. Live scores come from your profile
              and the catalogue — never hardcoded in the product.
            </p>
          </aside>
        </section>
        <section className="grid gap-px bg-line md:grid-cols-3">
          {[
            {
              index: "01",
              title: "A CV, then a ledger",
              body: "Upload a PDF. We extract skills, education, experience, and projects. Edit anything the parser missed — we do not invent employers or degrees.",
            },
            {
              index: "02",
              title: "Weights you can read",
              body: "Required skills, preferred skills, text similarity, experience, education. Embeddings if you configure them; otherwise a deterministic fallback.",
            },
            {
              index: "03",
              title: "A pipeline that persists",
              body: "Saved, Applied, Interview, Offer, Rejected. Dashboard counts are taken from those records, including empty states for a new account.",
            },
          ].map((item) => (
            <article key={item.index} className="bg-background px-0 py-10 md:px-8 md:py-12">
              <p className="font-serif text-2xl text-pine">{item.index}</p>
              <h2 className="mt-4 font-serif text-2xl">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
            </article>
          ))}
        </section>
        <p className="mt-10 text-xs uppercase tracking-[0.16em] text-muted">
          Sample jobs in the seed set are labelled Sample. They are not live vacancies.
        </p>
      </main>
    </div>
  );
}
