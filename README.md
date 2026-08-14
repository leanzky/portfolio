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

## Scrabble Slam! (the game at /scrabble-slam)

A word game linked from the Selected Work section. Solo mode needs nothing extra — it's fully client-side. Multiplayer needs a Supabase project.

### How it plays

Pick a word length (4, 5 or 6), a dictionary and a timer, then change one letter of the board word at a time to make new real words, emptying your 12-card hand. Words never change length.

- **You can hold at most 15 cards.** Drawing is capped there, and since you win by reaching zero, every draw moves you further from winning.
- **Shuffle** reorders your hand any time, free. It's a "look at these letters differently" button, nothing more.
- **Endless** (the fourth timer option) removes the clock entirely. Emptying your hand becomes the *only* way to finish, so there's no surviving on the timer. Freeze and Swap are hidden there since both are paid for in seconds.
- **If you have no legal move at all**, the game notices and rescues you automatically: your hand is redrawn and you take **2 extra cards** for it. Redrawn, not just reordered — reordering wouldn't change anything, and dead letters would pile up until every turn needed a rescue.

All of the above applies to multiplayer too, enforced server-side by `0007_endless_and_rescue.sql`. The rescue isn't optional there: with a timer a stuck player just loses when the clock runs out, but in Endless they'd sit stuck forever and the room could never reach a terminal state. Because the board word is shared, a play is checked against *every* player's hand, not just the mover's — otherwise you could strand your opponent into a deadlock.

**Scoring and the leaderboard.** Each finished round scores on words played (multiplied by word length), plus a clearing bonus and leftover time, minus draws and rescues. The top 10 runs are kept in `localStorage` and shown on the start and end screens. Deliberately per-device rather than server-backed: no account, no migration, and an anonymous global board on a portfolio site is mostly a spam target. To move it to Supabase later, replace `load` and `recordRun` in [`lib/scrabble-slam/leaderboard.ts`](lib/scrabble-slam/leaderboard.ts) — components read through the store, not storage.

**Power-ups** live on a rail beside the board (a strip underneath on narrow screens) rather than taking up hand slots. Each runs on a cooldown measured in *words played*, so the way to earn abilities back is to keep making words:

| Ability | Effect | Cooldown |
| --- | --- | --- |
| **Hint** | Highlights a slot and the card that fits it | 2 words |
| **Chaos** | Rerolls 4 cards in your hand (size unchanged) | 3 words |
| **Freeze** | Puts 8 seconds back on the clock (off in Endless) | 4 words |
| **Purge** | Discards 2 cards outright | 5 words |

Definitions live in [`lib/scrabble-slam/powerups.ts`](lib/scrabble-slam/powerups.ts) — cooldowns and copy are all editable there, and the rail renders whatever it finds.

### Tuning the difficulty

Three constants in [`lib/scrabble-slam/engine.ts`](lib/scrabble-slam/engine.ts): `HAND_SIZE` (12, the opening hand), `MAX_HAND` (15, the ceiling) and `RESCUE_CARDS` (2, the no-moves penalty). Scoring weights are in [`lib/scrabble-slam/scoring.ts`](lib/scrabble-slam/scoring.ts).

`RESCUE_CARDS` is the sensitive one. A rescue gives you 2 cards while a play removes 1, so if you get stuck on more than half your turns the hand stops shrinking and the round can't end. Simulated over 25 rounds per length:

| Length | Turns with no legal move | Verdict |
| --- | --- | --- |
| 4 | 16–24% | comfortable |
| 5 | 30–36% | fair |
| 6 | 38–39% | genuinely hard, and long |

Six-letter rounds are winnable but can run to hundreds of plays, so they're realistically an Endless mode rather than something to clear in 90 seconds. Dropping `RESCUE_CARDS` to 1 makes length 6 much faster if you'd rather it were gentler.

Two things worth knowing if you change the word list: roughly **30% of 6-letter words are dead ends** (no single-letter change makes another word) versus 2% at four letters, so `pickStarterWord` re-draws until it finds a live one. Mid-round dead ends can't happen — any word you reached can always be changed back the way you came — but `resolveStuck` still deals a fresh board word if it ever meets one, and doesn't charge the 2 cards for it, since no hand could have played it.

### Multiplayer is turn-based

Players act in seat order (seats follow join order), and **each player owns a clock that only runs on their own turn** — everyone else's is genuinely paused, not just dimmed. The roster above the board shows everyone in a stable per-seat colour, and the active player's card lights up in theirs. The slot of the most recent play is outlined in the mover's colour, so you can see who changed what.

| Situation | Timed | Endless |
| --- | --- | --- |
| Wrong guess | −5s off your clock, turn continues | turn passes immediately |
| Clock hits zero | eliminated → spectator | can't happen, there's no clock |
| Winning | first to empty their hand, or last player standing | first to empty their hand |

**Eliminated players become spectators** and can see every hand face up. That's enforced by RLS, not the UI: `is_spectator()` is a `SECURITY DEFINER` check used by a policy on `players`, so an active player querying the table directly still gets only their own row back. Worth testing under a non-superuser role if you ever change it — superusers bypass RLS entirely, which makes a naive test pass for the wrong reason.

Two safety valves are worth knowing about. `leave_room` removes your seat outright while the room is still waiting, and counts as elimination once play has started (deleting a seat mid-game would renumber the turn order under everyone else). It's also wired to `pagehide`, so closing the tab gives the seat back. And because Endless has no clock to knock out an absent player, any player can retire a turn that has sat untouched for 90 seconds.

### Multiplayer setup

1. Create a Supabase project.
2. In **Authentication → Sign In / Providers**, enable **Anonymous sign-ins** (players get a seat with no login screen).
3. In the **SQL Editor**, run the migrations in `supabase/migrations/` in filename order (`0001…` through `0008…`).
4. Add these env vars (locally in `.env.local`, and in your host's project settings for production — see Deploying below):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   Both are safe to expose to the browser — the anon/publishable key is meant to be public, protected by the Row Level Security policies in the migration, not by secrecy. Never put the `service_role` key here.

If these env vars are absent, the "Play with a Friend" option on the game's mode-select screen disables itself automatically rather than breaking.

### The word list

`lib/scrabble-slam/standard-words.json` holds ~17.4k words (4–6 letters), built from a blend of:

- **ENABLE** — the public-domain Scrabble lexicon (guarantees every entry is a real, legal word, and contains no proper nouns)
- **SCOWL size 60** — a human-curated "common enough for a spell checker" tier, used as the recognisability filter
- **top-80k word frequency** — catches very common words SCOWL ranks lower

Profanity and slurs are stripped. The file also carries a much stricter `starters` pool (~1.3k everyday 4-letter words): the board only ever *opens* on one of these, so a round never starts on something obscure, while the full set stays valid for plays. Same split Wordle uses.

To regenerate it after changing sources, the build scripts live in the scratchpad — or just edit the JSON directly; its shape is `{ "4": [...], "5": [...], "6": [...], "starters": { "4": [...], "6": [...] } }`.

Multiplayer reads the same words from the `words` table, so `0004_expand_dictionary.sql` must be run for both modes to agree.

### Known issue: realtime push is unreliable, polling covers it

Supabase's realtime push (`postgres_changes`) sometimes doesn't deliver updates from one player's browser to another's, for a reason not yet root-caused — verified to *not* be the database, RLS, the publication setup, or Chromium/Playwright itself (raw `supabase-js` calls work fine from both Node and a real browser tab outside this app). As a reliability net, `lib/scrabble-slam/useMultiplayerRoom.ts` also polls the room/players/hand every 1.5s regardless of whether push delivery worked, so the game stays fully correct and playable — opponents' moves just take up to ~1.5s to visibly land instead of arriving instantly. If you want to chase the root cause further, that hook is where to start; the two symptoms to watch for are (a) the channel reports `SUBSCRIBED` status successfully, yet (b) events from another browser context never fire the `.on('postgres_changes', ...)` callback.

### Chinese mode (solo)

There is a real Chinese version of the game, not just a translated menu. The board is a two-character word 词 and you swap one character 字 to make another: **国家 → 大家 → 作家 → 专家**. Every other rule is unchanged — same hand, same power-ups, same rescue.

It's **solo only**, because the multiplayer server validates moves against a Postgres `words` table that holds no Han entries.

The word list is built the same way as the English one, blending a real lexicon with real usage:

- **CC-CEDICT** — a human-edited Chinese dictionary, so every entry is a genuine word (the role ENABLE plays for English)
- **jieba word frequencies** — so entries are actually used, with a floor applied to drop the long tail
- Personal names, place names and abbreviations are stripped

The result is 3,587 two-character words, every one of which has at least one legal successor.

**The character inventory is deliberately closed at 250.** That's the load-bearing decision. Latin play is closed at 26 letters, so any card you hold is likely to fit somewhere. Chinese has thousands of characters, and drawing from all of them was measured at a **44% chance** that a 12-card hand held any legal move at all — an unplayable game. Restricting the vocabulary to words spelled entirely from the 250 most productive characters takes that to **84%**, against the English game's 76%.

**Two slots instead of four changes the endgame,** which is why `Dictionary.rescueCards` exists. A one-card Chinese hand has a 16% chance of a legal move; in English it's 35%. At the English penalty of +2 cards per rescue, Chinese sat exactly at break-even — a rescue on 49% of turns and ~550 plays to finish a round. At +1 it lands at ~22 plays, in line with English's ~30. Both numbers are in `lib/scrabble-slam/dictionary.ts`.

To regenerate or retune the list, the knobs are the frequency floor and the inventory size; a larger inventory means more words but a thinner hand.

### Languages

The interface ships English and Chinese, toggled from the corner of every game screen and remembered in `localStorage`. Strings live in one file, [`lib/scrabble-slam/i18n.ts`](lib/scrabble-slam/i18n.ts) — add a language by adding a dictionary there and an entry to `LANGUAGES`; any key you miss falls back to English rather than showing a raw key.

The language toggle and the Chinese dictionary are independent: you can play English words with a Chinese interface, or vice versa. The rest of the portfolio is not translated — this is scoped to `/scrabble-slam`.

## C# & .NET Career Track (the page at /csharp)

A private study track: twelve modules, 51 lessons, six project briefs, an interview question bank, and a readiness checklist. Reached from the Selected Work card, or directly at `/csharp`. No Supabase, no backend of any kind — it is a static page plus `localStorage`.

See **The passphrase gate** below — `/csharp` and `/gameshows` share one lock.

### Content lives in data, not components

Same rule as `data/site.ts`: everything is data in [`data/csharp-course/`](data/csharp-course/), split into `foundations.ts` (modules 00–03), `web.ts` (04–07), `production.ts` (08–11), and `career.ts` (projects, the 16-week plan, question bank, checklist, resources). Adding a lesson means adding an object, never touching a component.

Two rules when writing code samples, both because samples live inside template literals: **no backslashes** (a `\n` inside a template literal becomes a real newline and silently mangles the sample) and **no backticks**.

**Lesson ids are load-bearing.** Progress is stored per device against `moduleId/lessonId`, so renaming either id silently resets that lesson for anyone who had ticked it off. Add freely; rename carefully.

### Two things built by hand instead of installed

- **Syntax highlighting** — [`lib/csharp-course/highlight.ts`](lib/csharp-course/highlight.ts) is a ~120-line tokeniser covering C#, bash, JSON, XML, SQL and plain text, rather than pulling in Prism or Shiki for one page. It tokenises line by line and returns plain data that the renderer turns into React elements, so nothing is ever injected as HTML. It deliberately does not track multi-line constructs (block comments, raw strings) — the samples avoid them, and line independence keeps it impossible to get stuck.
- **Progress state** — read through `useSyncExternalStore`, not an effect. `localStorage` does not exist during server rendering, so the server and hydration snapshots are empty and React swaps in the real value after hydrating. Doing this with `useEffect` + `setState` works but trips the React Compiler lint rule this project builds with (`react-hooks/set-state-in-effect`), and it is the wrong tool: `localStorage` is an external store.

## The passphrase gate (/csharp and /gameshows)

Both private pages sit behind one lock, in [`lib/private-gate.ts`](lib/private-gate.ts) and [`components/private/PassphraseGate.tsx`](components/private/PassphraseGate.tsx). The passphrase is `pleasehireme`, case- and whitespace-insensitive, and **one unlock opens both pages** — they belong to the same person, so typing it twice is friction with no benefit. The lock screen takes a `theme` (`violet` for the course, `gold` for the catalogue) so it still looks like the page behind it.

**This is obfuscation, not authorization, and the distinction matters.** Everything both pages render ships inside the client JavaScript bundle, so anyone who opens devtools can read the content without ever typing the passphrase. What the gate actually buys:

- the pages do not open for a casual visitor who clicks the card,
- the content is not in the initial HTML — the roots render the real page only after unlocking, so `curl` returns the lock screen and nothing else,
- `robots: { index: false, follow: false }` on both routes keeps them out of search results.

Nothing behind either page is confidential, which is the only reason that trade is acceptable. **If something genuinely private ever goes here, this is not enough** — that needs the passphrase checked on the server, an HttpOnly cookie, and the content passed from a server component as props so it never enters a client bundle at all.

To change the passphrase: hash the new value with the `hash` function in `lib/private-gate.ts` and replace `PASSPHRASE_HASH`. It is stored hashed rather than literal purely so that grepping the built JavaScript for the obvious string does not hand it over.

Note that the unlock is stored under `private-pages-unlocked-v1`. An earlier version used a course-specific key, so anyone already unlocked will be asked once more after this change.

## Game Show Formats (the page at /gameshows)

A single-page build catalogue: 39 television game show formats, each judged on how well it survives losing the studio, the audience and the host. Every entry carries its core loop, the part that is genuinely hard to build, and a twist worth building instead of a straight clone. Behind the passphrase gate, linked from Selected Work.

Content is data in [`data/gameshows.ts`](data/gameshows.ts), same rule as everywhere else: adding a format means adding an object. The page derives its own counts, so the headline numbers never go stale when the list changes — but the **project card description in `data/site.ts` hard-codes "39 formats"**, so update that string if you add entries.

Three parts of the file are not the catalogue and are the actually reusable bits:

- `sharedMachinery` — the engineering every format needs (server-authoritative buzzers, never sending the answer to the client, host/player/spectator roles, fuzzy answer matching). Build once, reuse across formats.
- `doesNotTranslate` — formats that genuinely do not work in a browser, and why. Worth keeping honest; the point of the page is judgement, not a list of every show ever made.
- `legalNotes` — mechanics are not copyrightable, names and logos and theme music are. Build the mechanic, name it yourself.

Filtering (genre, effort, "no realtime needed", search) is client-side over the whole array — 39 entries do not need anything cleverer, and it keeps the page static.

## Project thumbnails

Cards in Selected Work use screenshots at `public/projects/*.webp`, ~1600×1000 (16:10, the card's aspect ratio). The two newest were generated rather than taken by hand, which is repeatable:

1. `npm run build && npm start` — use the **production** server, so Next's dev indicator badge is not in the frame.
2. Screenshot with Playwright at a 1600×1000 viewport and `deviceScaleFactor: 2`. For `/csharp`, `addInitScript` sets the unlock flag and some lesson progress in `localStorage` first, so the shot shows the real page rather than the lock screen.
3. Convert: `ffmpeg -i shot.png -vf "scale=1600:1000:flags=lanczos" -c:v libwebp -quality 82 -compression_level 6 out.webp` — lands around 50–80KB, in line with the existing thumbnails.

## Health program (the page at /calendar)

Replaces the old meal-amount tracker. A personal 12-week plan for lowering blood pressure and losing weight, plus the daily log that feeds it: check-in, weight and BP trends, and progress photos. Behind the passphrase gate, `noindex`, and linked from the main nav.

**Setup:** run `supabase/migrations/0009_health_program.sql` in the SQL Editor. It creates `health_days`, `progress_photos`, and the private `progress-photos` Storage bucket with its policies. Same Supabase project and the same "Anonymous sign-ins" provider as everything else. `meal_logs` from `0003` is deliberately left in place — it still holds real history and nothing reads it; drop it yourself when you want it gone.

### The content is the deliverable

The plan lives in [`data/health-plan.ts`](data/health-plan.ts) and is written for one person and one medication, not as a generic template: 120 kg at 172 cm, walking but not running, cooking Filipino food, on **Veztenor (amlodipine + losartan)**. Change any of those and the plan needs rewriting, not tweaking.

Three parts are load-bearing and should not be edited casually:

- **`medication`** — the ARB in Veztenor raises potassium, which is why the plan says never to use "lite salt" or potassium-based salt substitutes, the exact thing hypertension advice usually recommends. It also covers NSAIDs blunting the ARB, amlodipine ankle swelling being mistaken for weight gain, and blood pressure potentially running too low as weight comes off.
- **`redFlags`** — the symptoms that mean the emergency room rather than the next appointment.
- **`bpCategories`** — home-reading bands, and `classifyBp` in [`lib/health/metrics.ts`](lib/health/metrics.ts) grades by the *worse* of the two numbers, which is the standard rule.

Everything is framed as general lifestyle guidance rather than medical advice, and the app repeats that in the footer of every tab. Keep that framing if you edit it.

### How the tracking works

Same pattern as the tracker it replaces — the browser talks to Supabase directly and RLS, not application code, is what guarantees you only see your own rows. `health_days` is one upsert-on-conflict row per day, so the form can save repeatedly through the day without tracking whether a row exists.

**Progress photos are the one piece with real protection**, unlike the passphrase gate: a **private** bucket, storage policies that confine each identity to its own `<user_id>/` folder, and display through signed URLs that expire in an hour. Images are downscaled to 1280px in a canvas before upload — a phone camera produces 4–8 MB files and none of that resolution helps you see a body change. The camera is reached through `<input capture>` rather than `getUserMedia`, which opens the real camera app on a phone and falls back to a file picker on desktop.

Two React details worth keeping:

- The check-in form seeds its state from the saved row at mount and is **remounted via `key`** when the day changes or the row first loads — not synced with an effect, which trips this project's React Compiler lint rule and would also wipe half-typed input on every refetch. The key deliberately excludes `updated_at`, so saving does not reset the form under you.
- Sign-in is inside the `try`: `signInAnonymously` *throws* rather than returning an error when the network is unreachable, and without that the page sat on "Loading…" forever offline. It now shows the error state with the migration hint, and the plan, exercise, food and safety tabs stay readable with no database at all.

### Charts

Two inline-SVG charts, no library. Weight and blood pressure are different scales so they are two charts, never one with two y-axes. Weight is a single series and carries no legend; blood pressure is two, so it gets a legend, direct labels on the latest point, and the readings table underneath — the orange series sits below 3:1 against the beige card surface, so identity never rests on colour alone. The two hues were checked against that surface rather than assumed (adjacent CVD ΔE 24.7, normal-vision ΔE 33.6).

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

If multiplayer is set up, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under the Vercel project's **Settings → Environment Variables** (they're gitignored locally via `.env.local`, so Vercel won't have them otherwise, and "Play with a Friend" will just stay disabled until they're added).

After deploying, remember to do one test contact-form submission to activate FormSubmit (see above).
