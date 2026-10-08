import Link from "next/link";
import { BadgeCheck, KeyRound, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const trustFeatures: [LucideIcon, string, string][] = [
  [
    ShieldCheck,
    "Verified Campus Ownership",
    "Independent multi-factor proof assessment prior to physical depot handover.",
  ],
  [
    KeyRound,
    "Centralized Campus Custody",
    "Real-time ledger tracking across automated secure depot lockers and security nodes.",
  ],
];

function TrustPanel() {
  return (
    <section className="relative hidden min-h-full overflow-hidden bg-neutral/40 p-10 lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
      <div className="relative">
        <Link href="/" className="flex items-center gap-3">
          <span>
            <span className="block text-sm font-bold tracking-[-0.04em]">TRACKBACK</span>
            <span className="block text-[9px] font-medium tracking-[0.08em] text-tertiary">
              CAMPUS CUSTODY &amp; RECOVERY NETWORK
            </span>
          </span>
        </Link>
        <div className="mt-12 max-w-sm">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-neutral px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Institutional protocol verified
          </p>
          <h1 className="text-3xl font-semibold leading-[1.12] tracking-[-0.06em] text-primary">
            Connecting lost personal belongings with their verified owners through secure,
            auditable chain of custody.
          </h1>
          <p className="mt-5 text-sm leading-6 text-tertiary">
            Centralizing property intake, chain-of-possession tracking, and documented handovers across university premises.
          </p>
        </div>
        <div className="mt-10 space-y-6">
          {trustFeatures.map(([Icon, title, description]) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral text-sm text-primary">
                <Icon aria-hidden="true" size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-primary">{title}</p>
                <p className="mt-0.5 max-w-xs text-xs leading-4 text-tertiary">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="relative font-mono text-[10px] uppercase tracking-[0.1em] text-tertiary">
        <BadgeCheck aria-hidden="true" className="mr-1 inline-block" size={12} />
        Official campus registry • 2026
      </p>
    </section>
  );
}

export default TrustPanel;