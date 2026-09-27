import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f7f2] text-[#17332f]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 lg:px-10">
        <Link href="/" className="text-xl font-semibold tracking-[-0.04em]">
          trackback<span className="text-[#d86f45]">.</span>
        </Link>
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/items" className="hidden px-4 py-2 text-[#49605b] sm:inline-block">
            Browse items
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#17332f] px-5 py-2.5 text-[#f5f7f2] transition hover:bg-[#28534c]"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
        <div>
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#d86f45]">
            Your campus, connected
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-7xl">
            Lost something? Let&apos;s bring it back.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#49605b]">
            Trackback makes it easier to report found belongings, search recent posts, and return what matters to the people who are looking for it.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/items"
              className="rounded-full bg-[#d86f45] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#bd5933]"
            >
              Explore found items
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-[#b9c9c0] px-6 py-3.5 text-sm font-semibold text-[#17332f] transition hover:border-[#17332f]"
            >
              Report an item
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[#dce9df] p-7 sm:p-10">
          <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full border-[26px] border-[#b5d0bd]" />
          <div className="relative flex min-h-[320px] flex-col justify-between rounded-2xl bg-[#17332f] p-7 text-[#f5f7f2] shadow-2xl shadow-[#17332f]/15 sm:min-h-[360px] sm:p-9">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-[#f5f7f2]/10 px-3 py-1.5 text-xs font-medium text-[#c9ddd0]">
                Recently found
              </span>
              <span className="text-2xl text-[#efb28d]">✦</span>
            </div>
            <div>
              <p className="text-sm text-[#abc3b5]">Library, North Campus</p>
              <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em]">Black canvas backpack</h2>
              <div className="mt-7 flex items-center justify-between border-t border-[#f5f7f2]/15 pt-5 text-sm">
                <span className="text-[#abc3b5]">Posted today</span>
                <span className="font-medium text-[#efb28d]">View details →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#d8e2d9] bg-[#edf2eb]">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3 lg:px-10">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.05em]">01</p>
            <p className="mt-3 text-sm leading-6 text-[#49605b]">Search items found around campus.</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-[-0.05em]">02</p>
            <p className="mt-3 text-sm leading-6 text-[#49605b]">Share a clear description when you find something.</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-[-0.05em]">03</p>
            <p className="mt-3 text-sm leading-6 text-[#49605b]">Claim it securely and get it home.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
