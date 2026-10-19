import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f2ec] text-stone-950">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">CareerLens</span>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-md px-3 py-2 hover:bg-white">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-teal-800 px-3 py-2 font-medium text-white hover:bg-teal-900"
          >
            Create account
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="max-w-2xl pt-10">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-800">
            Job matching with receipts
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            See why a role fits — and where your CV is silent.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">
            CareerLens compares your profile and CV to a job description. You get a
            match score, evidenced vs inferred skills, missing requirements, and
            an explanation of the weights. The score is overlap, not a forecast
            of being hired.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-md bg-teal-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-900"
            >
              Start with a profile
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-stone-50"
            >
              Use the demo account
            </Link>
          </div>
        </section>
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "CV in, structured profile out",
              body: "Upload a PDF. We extract skills, education, experience, and projects. You can edit anything the parser got wrong.",
            },
            {
              title: "Hybrid matching",
              body: "Required and preferred skills, lexical similarity, and optional embeddings when an API key is configured. Otherwise the fallback is deterministic and visible.",
            },
            {
              title: "A tracker that persists",
              body: "Save roles, move them through Applied, Interview, Offer, and Rejected, and keep notes. Dashboard numbers come from that data.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.body}</p>
            </article>
          ))}
        </section>
        <p className="mt-12 text-sm text-stone-500">
          Sample jobs in the seed dataset are labelled Sample. They are not live
          vacancies.
        </p>
      </main>
    </div>
  );
}
