import Link from "next/link"

type Props = {
  title: string
  intro: string
  sectionTitle: string
  paragraphs: string[]
  bullets?: string[]
  note?: string
  cta?: string
}

export function MarketingLanding({
  title,
  intro,
  sectionTitle,
  paragraphs,
  bullets = [],
  note,
  cta = "Explore StreetSpot",
}: Props) {
  return (
    <main className="min-h-screen bg-[#f6f7f2] px-5 py-12 text-[#17231f] sm:px-8 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-[#e1e5dc] bg-white p-6 shadow-sm sm:p-10">
        <p className="mb-4 inline-flex rounded-full border border-[#d7e7d8] bg-[#eaf5ed] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#258052]">
          Real spots. Real people. Real hustle.
        </p>
        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-[#59645f]">{intro}</p>
        <h2 className="mt-10 text-2xl font-bold text-[#258052]">{sectionTitle}</h2>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-4 leading-7 text-[#46534c]">{paragraph}</p>
        ))}
        {bullets.length > 0 && (
          <ul className="mt-5 space-y-3 pl-6 text-[#46534c] [list-style-type:disc]">
            {bullets.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
        {note && <p className="mt-8 rounded-2xl bg-[#f6f7f2] p-4 leading-7 text-[#59645f]">{note}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-xl bg-[#f06435] px-6 py-3 font-extrabold text-white transition hover:brightness-105">
            {cta}
          </Link>
          <Link href="/host/invitations" className="inline-flex min-h-11 items-center rounded-xl border border-[#258052]/30 bg-white px-6 py-3 font-extrabold text-[#258052] transition hover:bg-[#eaf5ed]">
            Host a Private Event
          </Link>
        </div>
        <nav aria-label="More StreetSpot guides" className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#e1e5dc] pt-6 text-sm font-semibold text-[#258052]">
          <Link className="underline underline-offset-4" href="/for-vendors">For vendors</Link>
          <Link className="underline underline-offset-4" href="/pop-up-shops">Pop-up shops</Link>
          <Link className="underline underline-offset-4" href="/local-events">Local events</Link>
          <Link className="underline underline-offset-4" href="/host/invitations">Private Host Studio</Link>
          <Link className="underline underline-offset-4" href="/discover-local-spots">Discover local spots</Link>
        </nav>
      </article>
    </main>
  )
}
