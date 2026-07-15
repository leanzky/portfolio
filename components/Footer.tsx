import { site } from "@/data/site";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="border-t border-border">
      {/* Big CTA */}
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
        <Reveal>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-balance max-w-3xl mx-auto">
            {site.footer.heading}
          </h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-md mx-auto leading-relaxed">
            {site.footer.subheading}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href={site.ctaLink}
              className="bg-accent text-accent-foreground px-7 py-3.5 rounded-full text-sm font-medium hover:opacity-85 transition-opacity"
            >
              {site.ctaLabel}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="px-7 py-3.5 rounded-full text-sm font-medium border border-border hover:border-foreground transition-colors"
            >
              {site.email}
            </a>
            <a
              href={site.resume}
              download
              className="px-7 py-3.5 rounded-full text-sm font-medium border border-border hover:border-foreground transition-colors"
            >
              {site.resumeLabel} ↓
            </a>
          </div>
        </Reveal>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>
            © {new Date().getFullYear()} {site.name} · {site.location}
          </p>
          <div className="flex items-center gap-5">
            {site.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
