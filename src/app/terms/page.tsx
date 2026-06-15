import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata = {
  title: `Terms & Conditions — ${SITE_NAME}`,
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={15} />
        Back
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-white">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
        <p>
          By using {SITE_NAME}, you agree to these basic terms. Please read them.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-white">Acceptable use</h2>
          <p className="mt-2">
            Be respectful. You may not use {SITE_NAME} to harass others, share
            illegal content, or do anything unlawful or harmful. We may suspend
            access for anyone who abuses the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">
            Your responsibility
          </h2>
          <p className="mt-2">
            You are responsible for your own conduct and for anything you say or
            share in a room. If you create an account, you are responsible for
            keeping your password safe.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">
            Service provided &ldquo;as is&rdquo;
          </h2>
          <p className="mt-2">
            {SITE_NAME} is provided as is, without warranties of any kind. We do
            our best to keep it running, but we can&apos;t guarantee it will
            always be available or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Changes</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the
            service means you accept any changes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p className="mt-2">
            Questions? Email us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-accent-glow hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
