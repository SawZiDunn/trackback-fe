import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-neutral/60 bg-white pt-12 pb-8 text-xs text-neutral-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1: Brand & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-primary">TrackBack</span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-tertiary">
              Clinical chain-of-custody and automated verification protocol for institutional
              inventory recovery.
            </p>
          </div>

          {/* Column 2: Compliance & Custody */}
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-tertiary">
              Compliance & Custody
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#" className="text-neutral-600 transition hover:text-primary">
                  Custody Transfer Protocol
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-600 transition hover:text-primary">
                  Identity Verification Standards
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-600 transition hover:text-primary">
                  Disposal Schedule Policies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral/40 pt-6 text-[11px] text-tertiary sm:flex-row">
          <p>© 2026 TrackBack Institutional Recovery Network. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="transition hover:text-primary">
              Terms of Custody
            </Link>
            <Link href="#" className="transition hover:text-primary">
              Audit Log
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
