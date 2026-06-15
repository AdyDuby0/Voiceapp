import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

export const metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={15} />
        Back
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
        <p>
          {SITE_NAME} is built to be private and lightweight. This policy
          explains, in plain language, what we do and don&apos;t collect.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-white">
            What we collect
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-slate-200">Display name:</strong> the name
              you type to join a room. It is shared with others in that room and
              is not stored after you leave.
            </li>
            <li>
              <strong className="text-slate-200">Account details</strong> (if you
              create one): your username and a securely hashed password. We never
              store your password in plain text.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">
            Voice and messages
          </h2>
          <p className="mt-2">
            Voice audio and chat messages are transmitted in real time so people
            in your room can hear and read them. We do not record your calls or
            store your chat history.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">
            Third-party services
          </h2>
          <p className="mt-2">
            We use a real-time media provider (LiveKit) to carry voice between
            participants. Voice data passes through their servers to reach the
            people in your room.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">
            We don&apos;t sell your data
          </h2>
          <p className="mt-2">
            We do not sell or rent your personal information to anyone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p className="mt-2">
            Questions about your privacy? Email us at{" "}
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
