# Leandro Francia — Portfolio

A single-page portfolio built with **Next.js 16** and **Tailwind CSS 4**, inspired by [heynesh.com](https://heynesh.com): giant yellow hero name, cutout portrait, scroll-drawn journey trail, and a beige/yellow palette.

## Running it

```bash
npm install
npm run dev      # development server (usually http://localhost:3000)
npm run build    # production build (run this to check everything compiles)
```

---

## How to edit this portfolio

**Almost everything lives in one file: [`data/site.ts`](data/site.ts).** Edit it, save, and the dev server refreshes automatically. The sections below explain each part.

> Rule of thumb: never edit the components for content changes — only for design changes. Content belongs in `data/site.ts`.

### Basics (name, email, socials)

At the top of `data/site.ts`:

```ts
name: "Leandro Francia",        // shown in the header and footer
role: "Developer",              // shown next to your name
email: "you@gmail.com",         // contact form submissions are sent here
location: "Goa, Camarines Sur, Philippines",
socials: [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/..." },
  { label: "GitHub", url: "https://github.com/..." },
],
```

### Hero (the big yellow name section)

```ts
hero: {
  displayName: "LEANDRO",       // the giant yellow text (auto-scales to any length)
  headlineLines: ["Development,", "Applied", "Differently."],  // one array item = one line
  subheadline: "Computer Science graduate...",                 // right-side paragraph
  tagline: ["The Developer.", "That's Leandro."],              // under the headline
},
```

**Changing the portrait photo:** save a photo as `public/portrait.png` (or `.jpg` / `.webp`) — it's picked up automatically. Best results with a background-removed (transparent PNG) image, cropped just below the chest.

### Adding more experiences (About me / journey timeline)

Find `about.timeline` and add an entry anywhere in the array — order on the page follows array order:

```ts
{
  year: "2027",                    // "2027" renders as '27; words like "Today" stay as-is
  title: "New chapter",
  text: "What happened and why it mattered.",
  image: "/journey/photo.png",     // OPTIONAL — put the file in public/journey/
  caption: "@company",             // OPTIONAL — small label under the image
},
```

Cards alternate left/right automatically and the curved trail redraws itself — no layout work needed when you add or remove entries.

### Adding selected work (projects)

Find `projects.items` and add:

```ts
{
  name: "My New App",
  description: "One or two sentences about what it does and what you did.",
  tags: ["React", "API", "Design"],          // shown as small pills, 2–4 is ideal
  url: "https://mynewapp.com",               // OPTIONAL — card becomes clickable
  image: "/projects/my-new-app.png",         // OPTIONAL — placeholder shown if missing
},
```

**Adding the screenshot:** drop the image into `public/projects/` and reference it by path as above. Recommended size ~1600×1000 (16:10); the card crops to fit.

### Adding "What you get" cards

Find `capabilities.items` and add:

```ts
{
  title: "New skill",
  text: "One sentence explaining it from the client's perspective.",
},
```

The grid flows automatically (3 columns on desktop). Six items looks best; any count works.

### Adding FAQ questions

Find `faq.items` and add:

```ts
{
  question: "Do you take on X?",
  answer: "Full answer here. Plain text, a sentence or three.",
},
```

The first question starts expanded; the rest open on click.

### Updating the resume

Replace `public/Leandro-Francia-Resume.pdf` with your new PDF (same filename), or use a new filename and update `resume: "/Your-File.pdf"` in `data/site.ts`. The "Download Resume" buttons in the hero and footer update automatically.

---

## The contact form ("Let's Talk")

Every **Let's Talk** button opens a form (name, email, message). Submissions are delivered to the `email` in `data/site.ts` — no server needed.

**Setup (one time, ~2 minutes):**

1. Go to [web3forms.com](https://web3forms.com)
2. Enter your email address and click **Create Access Key** — the key is emailed to you instantly (no account, free)
3. Paste the key into `data/site.ts`:
   ```ts
   web3formsKey: "your-key-here",
   ```
4. Do a test submission on your site to confirm messages arrive

If `web3formsKey` is left empty, the form falls back to formsubmit.co (works without a key but their service is less reliable and requires a one-time email confirmation on first use).

If sending ever fails, the visitor is shown your email address as a direct fallback, so you can't lose a lead either way.

To skip the form entirely and use a booking link instead, set `ctaLink` to a Calendly URL or `"mailto:you@gmail.com"`.

---

## Design changes

| What | Where |
| --- | --- |
| Colors (background, cards, borders) | `app/globals.css` — the `:root` variables at the top |
| Yellow accent | search for `yellow-400` in `components/` |
| Fonts | `app/layout.tsx` (loaded there) + `app/globals.css` (`--font-display` = headings, `--font-alt` = buttons/accent text) |
| Section order | `app/page.tsx` — reorder the components inside `<main>` |
| Hero layout & animations | `components/Hero.tsx`, timings in `app/globals.css` (`hero-*` keyframes) |
| Journey trail animation | `components/JourneyTrail.tsx` (card pop/ghost + line drawing) |

Every section component lives in `components/` — one file per section (`Nav`, `Hero`, `About`, `Projects`, `Capabilities`, `Faq`, `Footer`, plus `ContactModal`).

## Deploying

The easiest path is [Vercel](https://vercel.com/new): push this folder to a GitHub repository, import it in Vercel, and it deploys on every push. Any Node host also works: `npm run build && npm start`.

After deploying, remember to do one test contact-form submission to activate FormSubmit (see above).
