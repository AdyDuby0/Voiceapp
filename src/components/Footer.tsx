import Link from "next/link";
import { Heart, Mail } from "lucide-react";
import { SITE_NAME, SUPPORT_EMAIL, DONATION_URL } from "@/lib/site";

// Site footer. It deliberately sits just below the fold — only a thin sliver
// peeks above the bottom of the screen on load (see the landing page height),
// inviting the user to scroll down to reveal it.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink-800/60">
      {/* Thin accent strip — this is the part that peeks above the fold. */}
      <div className="h-1 w-full bg-gradient-to-r from-accent/60 via-accent-soft/60 to-accent/60" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="text-base font-semibold text-white">{SITE_NAME}</p>
            <p className="mt-1 text-sm text-slate-400">
              Talk together, instantly. A friendlier way to hang out by voice.
            </p>
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-soft"
            >
              <Heart size={16} />
              Support the project
            </a>
          </div>

          <div className="flex gap-12">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Legal
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-1.5 text-slate-300 transition-colors hover:text-white"
                  >
                    <Mail size={14} />
                    {SUPPORT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-xs text-slate-500">
          © {year} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
