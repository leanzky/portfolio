"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

type Status = "idle" | "sending" | "success" | "error";

/**
 * Contact form modal. Opens whenever any <a href="#contact"> on the page
 * is clicked (the "Let's Talk" buttons). Submissions are delivered to
 * site.email via formsubmit.co (no server or API key needed).
 *
 * NOTE: the first ever submission triggers a confirmation email from
 * formsubmit.co to site.email — click the link in it once to activate.
 */
export function ContactModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest?.('a[href="#contact"]');
      if (anchor) {
        e.preventDefault();
        setStatus("idle");
        setOpen(true);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // lock page scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const subject = `Portfolio contact from ${data.name || data.email}`;
    setStatus("sending");
    try {
      let res: Response;
      if (site.web3formsKey) {
        // preferred: Web3Forms (set web3formsKey in data/site.ts)
        res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: site.web3formsKey,
            subject,
            ...data,
          }),
        });
      } else {
        // fallback: formsubmit.co (no key needed, but less reliable)
        res = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...data,
            _subject: subject,
            _template: "table",
          }),
        });
      }
      if (!res.ok) throw new Error("send failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Contact form"
    >
      {/* backdrop */}
      <button
        className="absolute inset-0 bg-black/45 backdrop-blur-sm cursor-default"
        onClick={() => setOpen(false)}
        aria-label="Close contact form"
      />

      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-5 right-6 text-2xl leading-none text-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="font-display uppercase text-2xl md:text-3xl font-bold tracking-tight">
          Let&apos;s talk
        </h2>
        <p className="mt-2 font-alt text-muted">
          Tell me about your project or team. This goes straight to my inbox.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-2xl bg-yellow-400/20 border border-yellow-400 p-6 text-center">
            <p className="font-display font-bold text-lg">Message sent!</p>
            <p className="mt-1 font-alt text-muted">
              Thanks for reaching out. I usually reply within one business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 font-alt">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-bold mb-1.5">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 transition"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-bold mb-1.5">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 transition"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-bold mb-1.5">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                placeholder="Message me."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 transition resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-700">
                Something went wrong sending your message. Please email me
                directly at{" "}
                <a href={`mailto:${site.email}`} className="underline font-bold">
                  {site.email}
                </a>
                .
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full font-alt uppercase tracking-wide bg-yellow-400 text-black px-7 py-3.5 rounded-xl text-sm font-extrabold transition duration-300 hover:brightness-95 disabled:opacity-60 disabled:cursor-wait"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
