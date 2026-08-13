/**
 * ============================================================
 *  GAME SHOW FORMATS THAT WORK IN A BROWSER
 *
 *  A build catalogue, not a fan page: every entry is judged on how well
 *  the format survives losing a studio, a live audience and a host, and
 *  on what it actually costs to build.
 *
 *  Same convention as data/site.ts — content is data, components render
 *  whatever they find here.
 * ============================================================
 */

export type Category =
  | "Quiz & trivia"
  | "Word & language"
  | "Numbers & money"
  | "Timing & luck"
  | "Survey & social"
  | "Media & memory";

/** How well the format survives the move to a browser. */
export type WebFit = "excellent" | "good" | "workable";

export type Effort = "Weekend" | "1–2 weeks" | "3–4 weeks" | "Month+";

export type Show = {
  id: string;
  name: string;
  /** Where the format comes from, so the reference is findable. */
  origin: string;
  category: Category;
  webFit: WebFit;
  effort: Effort;
  /** Who is at the keyboard, and in what arrangement. */
  players: string;
  /** True when players act at the same moment and order decides the winner. */
  realtime: boolean;
  /** True when the format is only as good as the question or answer bank behind it. */
  contentHeavy: boolean;
  /** One sentence: what the game is. */
  premise: string;
  /** The core loop, in the order a player experiences it. */
  loop: string[];
  /** What the build actually turns on — the hard parts, not the CRUD. */
  buildNotes: string[];
  /** A version worth building rather than a straight clone. */
  twist: string;
};

/* ------------------------------------------------------------------
   The catalogue
------------------------------------------------------------------ */

export const shows: Show[] = [
  /* ---------- Quiz & trivia ---------- */
  {
    id: "jeopardy",
    name: "Jeopardy!",
    origin: "US, 1964",
    category: "Quiz & trivia",
    webFit: "excellent",
    effort: "1–2 weeks",
    players: "3 players + optional host, or solo vs the clock",
    realtime: true,
    contentHeavy: true,
    premise:
      "A six-by-five board of categories and dollar values; answers are given as questions, and the player in control picks the next square.",
    loop: [
      "Player in control picks a category and value.",
      "Clue is revealed; everyone races to buzz in.",
      "Correct answer adds the value and keeps control; wrong subtracts it and reopens the buzzer.",
      "Daily Doubles and Final Jeopardy add a hidden wager against your own bank.",
    ],
    buildNotes: [
      "The buzzer is the whole game and it is a latency problem: timestamp the buzz on the server, not the client, and open the window server-side so a fast connection is not an advantage.",
      "Answer checking has to be fuzzy — 'Mark Twain' and 'Samuel Clemens' both count. Normalise case and punctuation, strip articles, then allow a Levenshtein distance of one or two.",
      "Never send the answer to the client with the clue. Validate on the server, exactly like a word game validates a play.",
      "The J-Archive dataset (200k+ real clues) exists and is the fastest way to a playable board.",
    ],
    twist:
      "Make the board generated per-topic from your own question bank, so a group can play 'Philippine history' or 'the codebase we all work on'.",
  },
  {
    id: "millionaire",
    name: "Who Wants to Be a Millionaire?",
    origin: "UK, 1998",
    category: "Quiz & trivia",
    webFit: "excellent",
    effort: "Weekend",
    players: "1, with the audience as an optional crowd",
    realtime: false,
    contentHeavy: true,
    premise:
      "A fifteen-question ladder of increasing value, three lifelines, and the option to walk away with what you have.",
    loop: [
      "Question with four options appears; there is no clock until you want one.",
      "Lock in, or spend a lifeline: fifty-fifty, ask the audience, phone a friend.",
      "Right answers climb the ladder; a wrong one drops you to the last safe haven.",
      "At any point you can walk away and keep the money.",
    ],
    buildNotes: [
      "The best first build in this whole list: single player, no realtime, no rooms. The tension is entirely in pacing and sound.",
      "Ask-the-audience needs real data — either aggregate how previous players answered that question, or model it from the question's difficulty rating.",
      "Difficulty must actually ramp. Tag every question 1–15 and draw from the right tier, or the ladder feels arbitrary.",
      "The walk-away decision is what makes it a game rather than a quiz. Show the risk explicitly at every step.",
    ],
    twist:
      "Phone-a-friend as a real feature: generate a link that opens a 30-second question view on someone else's phone, and show their answer live.",
  },
  {
    id: "the-chase",
    name: "The Chase",
    origin: "UK, 2009",
    category: "Quiz & trivia",
    webFit: "excellent",
    effort: "1–2 weeks",
    players: "1–4 vs a bot 'chaser'",
    realtime: false,
    contentHeavy: true,
    premise:
      "Build a cash pot in a rapid-fire round, then outrun a quiz expert down a numbered board back to the team bank.",
    loop: [
      "Cash builder: sixty seconds of rapid questions, each worth money.",
      "Choose your head start — more money means starting closer to the chaser.",
      "Head-to-head: you and the chaser answer the same multiple-choice question each step.",
      "Reach the bank to bring your money home; get caught and it is gone.",
    ],
    buildNotes: [
      "The chaser is an AI opponent with a tunable accuracy rate — 85% for the hardest, 65% for the easiest. That single number is your whole difficulty system.",
      "Give the chaser realistic thinking time. Instant answers feel like cheating even when the maths is fair.",
      "The head start offer is a genuinely interesting decision; make the expected value visible enough to reason about, but not calculated for the player.",
      "Works entirely without other humans, which makes it a far better portfolio piece than it looks.",
    ],
    twist:
      "Let the chaser's persona and accuracy be picked from a roster, and track your lifetime record against each one.",
  },
  {
    id: "weakest-link",
    name: "The Weakest Link",
    origin: "UK, 2000",
    category: "Quiz & trivia",
    webFit: "good",
    effort: "3–4 weeks",
    players: "6–8 + host",
    realtime: true,
    contentHeavy: true,
    premise:
      "A team builds a chain of correct answers against a clock, banking before a wrong answer wipes it — then votes one player off.",
    loop: [
      "Questions pass round the circle; each correct answer climbs the money chain.",
      "Any player can say 'bank' before their question to lock the chain in.",
      "A wrong answer resets the chain to zero.",
      "At the end of the round everyone votes off the 'weakest link'.",
    ],
    buildNotes: [
      "The banking decision is a real prisoner's dilemma between players, and it is the reason this format still works. Show the chain value prominently.",
      "The voting round needs anonymity plus a reveal, and a tie-breaker rule decided by the strongest player's statistics.",
      "You need turn order enforcement and a per-player clock — the same machinery as a turn-based multiplayer word game.",
      "Elimination means spectators, so plan a spectator view from the start rather than bolting it on.",
    ],
    twist:
      "Publish the round statistics the show hid: who actually banked most, who cost the team the most money, and let the vote happen after that reveal.",
  },
  {
    id: "pointless",
    name: "Pointless",
    origin: "UK, 2009",
    category: "Quiz & trivia",
    webFit: "good",
    effort: "3–4 weeks",
    players: "2–8 in pairs",
    realtime: false,
    contentHeavy: true,
    premise:
      "Give the most obscure correct answer. Your score is how many of 100 surveyed people said the same thing — and low is good.",
    loop: [
      "A question with many valid answers is posed: 'films starring Tom Hanks'.",
      "Each pair gives an answer they believe is correct but unpopular.",
      "The score counter runs down to reveal how many of 100 people said it.",
      "A wrong answer scores 100; a correct answer nobody gave scores zero and is 'pointless'.",
    ],
    buildNotes: [
      "This format is pure data. You need, for each question, a list of valid answers with a popularity count — which you can only get by surveying, scraping a proxy for popularity, or generating it from search volume.",
      "The counting-down animation is doing enormous emotional work. Budget real time for it; it is not decoration.",
      "You must accept answers you did not anticipate, so answer matching needs an 'is this valid at all?' check separate from 'how popular was it?'.",
      "Bootstrap the popularity data from your own players: every answer given feeds the counts for the next round.",
    ],
    twist:
      "Make the survey live — the popularity number is drawn from everyone who has ever played that question on your site, so it shifts over time.",
  },
  {
    id: "one-vs-hundred",
    name: "1 vs 100",
    origin: "Netherlands, 2000",
    category: "Quiz & trivia",
    webFit: "workable",
    effort: "Month+",
    players: "1 vs up to 100 concurrent",
    realtime: true,
    contentHeavy: true,
    premise:
      "One contestant faces a mob of a hundred; every mob member they knock out is worth money, and any survivor can take it all.",
    loop: [
      "A question goes to the contestant and the whole mob at once.",
      "Mob members who answer wrongly are eliminated and their share goes to the pot.",
      "The contestant can walk away with the pot at any point.",
      "If the contestant is wrong, the surviving mob splits the money.",
    ],
    buildNotes: [
      "The only format here with a genuine scale requirement: a hundred simultaneous answers per question, all resolved together.",
      "Broadcast the question once and collect answers into a single batch — do not do a hundred round trips per round.",
      "You will not have a hundred real people. Design so bots fill empty mob seats with realistic accuracy per question difficulty, and be honest in the UI about which is which.",
      "This is the one worth building specifically to talk about load in an interview.",
    ],
    twist:
      "Run it asynchronously: the mob answers over a whole day, and the contestant plays the resolved crowd that evening.",
  },
  {
    id: "fifth-grader",
    name: "Are You Smarter Than a 5th Grader?",
    origin: "US, 2007",
    category: "Quiz & trivia",
    webFit: "excellent",
    effort: "Weekend",
    players: "1",
    realtime: false,
    contentHeavy: true,
    premise:
      "Answer questions drawn from a primary school curriculum, with classmates available to copy from.",
    loop: [
      "Pick a subject and grade level from the board.",
      "Answer, or use a cheat: peek, copy, or save.",
      "Wrong answers end the run unless a save is available.",
      "Drop out at any point and keep your winnings.",
    ],
    buildNotes: [
      "Trivially buildable, and the grade-level tagging is the entire design. Real curriculum standards give you defensible difficulty tiers.",
      "The comedy is in the questions being easy and the player failing anyway — so choose questions that are genuinely elementary but oddly forgettable.",
      "A good vehicle for localised content: a Philippine curriculum version is a different product from a US one.",
    ],
    twist:
      "Point it at any curriculum — a company onboarding handbook, a driving code, a certification syllabus — and it becomes a training tool that people finish.",
  },
  {
    id: "mastermind",
    name: "Mastermind",
    origin: "UK, 1972",
    category: "Quiz & trivia",
    webFit: "excellent",
    effort: "Weekend",
    players: "1–4, sequential",
    realtime: false,
    contentHeavy: true,
    premise:
      "Two minutes of rapid-fire questions on a specialist subject you chose yourself, then two minutes on general knowledge.",
    loop: [
      "Choose a specialist subject from the available banks.",
      "Two minutes: answer or pass, as fast as you can.",
      "Passes come back at the end if time remains.",
      "General knowledge round decides ties.",
    ],
    buildNotes: [
      "The purest speed-quiz loop in the list and the easiest to get right: one timer, one queue, a pass stack.",
      "Typed answers beat multiple choice here and force you to solve fuzzy matching — good, that is the interesting engineering.",
      "Because subjects are self-selected, this is the format where user-submitted question banks make most sense.",
    ],
    twist:
      "Let players publish their own specialist subject bank and challenge friends to beat their score on it.",
  },
  {
    id: "game-ka-na-ba",
    name: "Game Ka Na Ba?",
    origin: "Philippines, 2001",
    category: "Quiz & trivia",
    webFit: "excellent",
    effort: "1–2 weeks",
    players: "1–4",
    realtime: true,
    contentHeavy: true,
    premise:
      "A fast Filipino quiz ladder mixing general knowledge with local culture, played against the clock and each other.",
    loop: [
      "Rounds escalate in difficulty and point value.",
      "Fastest correct answer takes the points.",
      "Lowest scorer drops out between rounds.",
      "A final head-to-head decides the winner.",
    ],
    buildNotes: [
      "The opportunity here is content, not mechanics: a well-made Filipino question bank is a differentiator no imported quiz app has.",
      "Bilingual questions need care — store the language per question and let players pick, rather than translating on the fly.",
      "Local formats travel badly and that is the point; this is a product with an audience rather than another trivia clone.",
    ],
    twist:
      "Regional editions — Bicol, Visayas, Mindanao question banks — with a leaderboard per region.",
  },
  {
    id: "cash-cab",
    name: "Cash Cab",
    origin: "UK, 2005",
    category: "Quiz & trivia",
    webFit: "workable",
    effort: "3–4 weeks",
    players: "1–4 on one device",
    realtime: false,
    contentHeavy: true,
    premise:
      "A quiz that runs while you travel from A to B, ending when you arrive — three wrong answers and you are thrown out.",
    loop: [
      "Set a destination; the quiz starts and the journey progresses.",
      "Questions come continuously; each correct answer adds money.",
      "Three strikes ends the ride early.",
      "Arriving with money intact banks it, with a double-or-nothing video bonus.",
    ],
    buildNotes: [
      "The journey is the timer, which is a lovely mechanic and needs either a real map API or a convincing simulated route.",
      "With geolocation this becomes a genuinely novel mobile web app — the quiz length is set by your actual commute.",
      "Handle backgrounding: phones suspend tabs, so the game state must survive being resumed mid-journey.",
    ],
    twist:
      "A commute-length quiz: enter how many minutes you have and it paces the whole ride to end exactly on time.",
  },

  /* ---------- Word & language ---------- */
  {
    id: "wheel-of-fortune",
    name: "Wheel of Fortune",
    origin: "US, 1975",
    category: "Word & language",
    webFit: "excellent",
    effort: "1–2 weeks",
    players: "3 + optional host",
    realtime: false,
    contentHeavy: true,
    premise:
      "Spin a wheel for a cash value, guess a consonant, and try to solve a hidden phrase before your opponents.",
    loop: [
      "Spin: land on a value, Bankrupt, or Lose a Turn.",
      "Call a consonant; each occurrence pays the spin value.",
      "Buy a vowel for a fixed price, or solve the puzzle.",
      "Solving banks the round's money and moves to the next puzzle.",
    ],
    buildNotes: [
      "The wheel needs weighted randomness plus a spin animation that lands on the value you already chose — animate to the result, never let the animation decide it.",
      "Puzzle categories (Phrase, Person, Place, Thing) are the difficulty dial, and a good puzzle bank is mostly hand-written.",
      "Letter reveal timing is where the drama lives: reveal occurrences one at a time, not all at once.",
      "You already have the letter-frequency and word-validation machinery if you have built a word game before.",
    ],
    twist:
      "Filipino phrase packs — sayings, place names, teleseryes — turn a familiar format into something with local pull.",
  },
  {
    id: "lingo",
    name: "Lingo",
    origin: "US, 1987",
    category: "Word & language",
    webFit: "excellent",
    effort: "Weekend",
    players: "1, or 2 teams alternating",
    realtime: false,
    contentHeavy: false,
    premise:
      "Guess a five-letter word in five tries, with green and yellow feedback — the format Wordle rediscovered thirty years later.",
    loop: [
      "The first letter is given free.",
      "Guess a valid word; letters are marked correct, present, or absent.",
      "A wrong guess passes control to the other team.",
      "Solving earns a ball draw toward a bingo card.",
    ],
    buildNotes: [
      "The smallest real build in this list, and the one where the dictionary matters more than the code — a guess list and a much smaller answer list, kept separate.",
      "The two-team alternation is what makes it a game show rather than Wordle: your opponent benefits from your failed guess.",
      "The bingo meta-layer is optional and can be added later without touching the core loop.",
    ],
    twist:
      "Head-to-head realtime: both teams see each other's feedback grid filling in, so a wrong guess is genuinely a gift.",
  },
  {
    id: "countdown-letters",
    name: "Countdown — letters round",
    origin: "UK, 1982 (from France, 1965)",
    category: "Word & language",
    webFit: "excellent",
    effort: "Weekend",
    players: "1–2",
    realtime: true,
    contentHeavy: false,
    premise:
      "Nine letters drawn from vowel and consonant piles, thirty seconds, longest valid word wins.",
    loop: [
      "Players alternate calling for a vowel or a consonant, nine times.",
      "Thirty-second clock, both players writing at once.",
      "Longest valid word scores its length; nine letters scores double.",
      "The solver then shows the best possible word, which is always demoralising.",
    ],
    buildNotes: [
      "The 'best possible word' solver is the interesting part: precompute an anagram index keyed by sorted letters, and subset lookup becomes fast enough to run instantly.",
      "Letter distributions are published and matter — get them right or the rounds feel wrong.",
      "Thirty seconds of two people typing at once is trivially realtime; the clock is the only shared state.",
    ],
    twist:
      "Show your word next to the solver's best word and the twenty you missed, as a teaching tool rather than a taunt.",
  },
  {
    id: "only-connect",
    name: "Only Connect — the connecting wall",
    origin: "UK, 2008",
    category: "Word & language",
    webFit: "excellent",
    effort: "1–2 weeks",
    players: "1–3 as a team",
    realtime: false,
    contentHeavy: true,
    premise:
      "Sixteen clues on a wall resolve into four groups of four — but the clues are built to belong to more than one group.",
    loop: [
      "Two and a half minutes to find four groups of four.",
      "Selecting four resolves them if correct; you get three lives once two groups are found.",
      "Then name the connection behind each group for bonus points.",
      "Solving the whole wall and all four connections is a perfect ten.",
    ],
    buildNotes: [
      "Authoring is the hard part, not code: a good wall needs deliberate red herrings, which means every clue should plausibly fit two groups.",
      "The interaction is a grid with selection state and an animation on resolve — genuinely simple to implement.",
      "Wall data is small and structured, so user-submitted walls with a moderation queue is a realistic feature.",
    ],
    twist:
      "A wall generator for any domain: feed it four categories from a dataset and let it pick items with deliberate overlap.",
  },
  {
    id: "password",
    name: "Password / Catchphrase",
    origin: "US, 1961",
    category: "Word & language",
    webFit: "good",
    effort: "1–2 weeks",
    players: "4+ in pairs",
    realtime: true,
    contentHeavy: false,
    premise:
      "Get your partner to say a secret word using single-word clues, without saying anything on the banned list.",
    loop: [
      "One player sees the word, the other does not.",
      "Clues are given one word at a time, alternating with guesses.",
      "Fewer clues means more points.",
      "Saying any part of the word forfeits the round.",
    ],
    buildNotes: [
      "Role-based visibility is the whole build: the same room, two completely different screens. Enforce it on the server, not by hiding UI.",
      "Typed clues are easier than voice and make automatic banned-word checking possible.",
      "Works beautifully as pass-the-phone on one device if you do not want realtime at all.",
    ],
    twist:
      "Automatic banned-list generation: derive forbidden words from the target using a thesaurus, so every round polices itself.",
  },
  {
    id: "blankety-blank",
    name: "Blankety Blank",
    origin: "UK, 1979",
    category: "Word & language",
    webFit: "good",
    effort: "1–2 weeks",
    players: "3+ plus a panel",
    realtime: false,
    contentHeavy: true,
    premise:
      "Fill in the blank in a silly sentence, and score by matching what the panel wrote.",
    loop: [
      "A sentence with a blank is read out.",
      "Everyone writes their answer privately.",
      "Answers are revealed one by one.",
      "You score for every other player who wrote the same thing.",
    ],
    buildNotes: [
      "Scoring by agreement means you need answer normalisation — 'car', 'a car' and 'CAR' must collide.",
      "The reveal order is the entertainment. Reveal one at a time with a beat between, never as a table.",
      "No host required if the prompts are written well, which makes it a good asynchronous party game.",
    ],
    twist:
      "Asynchronous mode: a prompt a day, everyone answers on their own time, results at 9pm.",
  },
  {
    id: "pinoy-henyo",
    name: "Pinoy Henyo",
    origin: "Philippines, 2006",
    category: "Word & language",
    webFit: "excellent",
    effort: "Weekend",
    players: "2 (one guesser, one answerer)",
    realtime: true,
    contentHeavy: false,
    premise:
      "A word is stuck on your forehead; you have to identify it by asking questions your partner can only answer oo, hindi, or pwede.",
    loop: [
      "Guesser sees nothing; the partner sees the word.",
      "Guesser asks yes/no questions against a clock.",
      "Partner answers only oo, hindi, or pwede.",
      "Identify the word before time runs out.",
    ],
    buildNotes: [
      "The cleanest two-device design in the whole list: one screen shows the word, the other shows the timer. That is the entire UI.",
      "Three fixed answer buttons means no typing, no parsing, and no cheating vector.",
      "Categories (pagkain, hayop, tao, lugar) are the difficulty dial and cost nothing to add.",
      "Works with two phones in the same room or two people on a call, with no host.",
    ],
    twist:
      "A spectator view where friends watch the guesser flail with the word visible — the thing that makes the TV version funny.",
  },
  {
    id: "taboo",
    name: "Taboo",
    origin: "US, 1989",
    category: "Word & language",
    webFit: "good",
    effort: "Weekend",
    players: "4+ in teams",
    realtime: true,
    contentHeavy: false,
    premise:
      "Describe a word to your team without using any of the five most obvious related words.",
    loop: [
      "Clue giver sees the word plus five banned words.",
      "Sixty seconds to get through as many cards as possible.",
      "An opposing player watches for banned-word slips.",
      "Skips are limited, so a hard card costs you real time.",
    ],
    buildNotes: [
      "Typed clues let the app enforce the banned list itself, which removes the need for a referee and makes it playable remotely.",
      "Card generation from a thesaurus or word-embedding neighbours produces surprisingly good banned lists automatically.",
      "The referee role is a nice third screen if you want the full party experience.",
    ],
    twist:
      "Difficulty by banned-list size: three banned words is a warm-up, eight is nearly impossible, and the same card bank serves both.",
  },
  {
    id: "boggle",
    name: "Boggle / Word Hunt",
    origin: "US, 1972",
    category: "Word & language",
    webFit: "excellent",
    effort: "Weekend",
    players: "1–8, all at once",
    realtime: true,
    contentHeavy: false,
    premise:
      "Find words by tracing adjacent letters in a shaken grid; everyone plays the same board simultaneously.",
    loop: [
      "A grid is generated and shown to everyone at once.",
      "Three minutes to find as many words as possible.",
      "Longer words score more.",
      "Words found by more than one player cancel out.",
    ],
    buildNotes: [
      "Everyone playing the same board means no turn order and no realtime coordination beyond a shared clock — the easiest multiplayer in this list.",
      "Path validation on the grid plus dictionary lookup; a trie makes both instant.",
      "The cancellation rule is what makes it social, and it needs the whole round's answers before scoring, so score at the end rather than live.",
      "Standard dice distributions are published; use them or grids will be unplayable.",
    ],
    twist:
      "Daily board: one grid for everyone worldwide each day, with a global leaderboard and shareable results.",
  },

  /* ---------- Numbers & money ---------- */
  {
    id: "deal-or-no-deal",
    name: "Deal or No Deal",
    origin: "Netherlands, 2000",
    category: "Numbers & money",
    webFit: "excellent",
    effort: "Weekend",
    players: "1",
    realtime: false,
    contentHeavy: false,
    premise:
      "Twenty-six sealed cases, one of them yours; eliminate the others while a banker tries to buy you out.",
    loop: [
      "Pick your case, then open others in batches.",
      "Remaining values shrink the board; the banker makes an offer.",
      "Deal, or no deal.",
      "Play to the end and take whatever is in your case.",
    ],
    buildNotes: [
      "No questions, no content bank, no opponents — pure probability and nerve. You can build this in a weekend and it is genuinely fun.",
      "The banker's offer is the entire design. A percentage of the expected value, rising toward it as the game progresses, and nudged down when the board is favourable.",
      "Make the offer feel like a person: hesitate, lowball early, get generous under pressure. That characterisation is the product.",
      "The maths is a perfect teaching tool — show expected value after the fact and players learn why the offer was insulting.",
    ],
    twist:
      "A banker with personality profiles — a cruel one, a fair one, a chaotic one — and stats on how you did against each.",
  },
  {
    id: "price-is-right",
    name: "The Price Is Right",
    origin: "US, 1956",
    category: "Numbers & money",
    webFit: "excellent",
    effort: "3–4 weeks",
    players: "1–4",
    realtime: false,
    contentHeavy: true,
    premise:
      "Guess retail prices without going over — a shell around dozens of distinct pricing mini-games.",
    loop: [
      "Contestants' Row: bid closest without exceeding the price.",
      "Win a pricing game: Cliff Hangers, Plinko, Hole in One, Ten Chances.",
      "Showcase Showdown wheel for a spot in the final.",
      "Showcase: bid on a prize package, closest without going over wins.",
    ],
    buildNotes: [
      "This is really a platform for mini-games, so build the shell plus two games first and add the rest as a content pipeline.",
      "Prices must be real and current or the game feels fake — scrape a retailer, or use a fixed dated catalogue and say so.",
      "Localised pricing is an enormous advantage: a version priced in pesos against local stores is a different, better product.",
      "Plinko is a physics toy, and physics is where the fun is — spend the time on it.",
    ],
    twist:
      "Price things from a local supermarket and it becomes a genuinely useful sense of what things cost, wrapped in a game.",
  },
  {
    id: "countdown-numbers",
    name: "Countdown — numbers round",
    origin: "UK, 1982",
    category: "Numbers & money",
    webFit: "excellent",
    effort: "Weekend",
    players: "1–2",
    realtime: true,
    contentHeavy: false,
    premise:
      "Six numbers, one three-digit target, thirty seconds, and only the four basic operations.",
    loop: [
      "Choose how many large numbers you want among the six.",
      "A random target between 101 and 999 appears.",
      "Thirty seconds to reach it exactly, or as close as possible.",
      "Explain your method — partial credit for being near.",
    ],
    buildNotes: [
      "The solver is a satisfying algorithm problem: exhaustive search over combinations and operations, pruned, and it runs in milliseconds for six numbers.",
      "Validating a player's working means parsing their steps, not just their answer — build the input as a sequence of operations rather than a free-text expression.",
      "Intermediate results must stay positive integers, which is the rule people forget and the one that makes the search tractable.",
    ],
    twist:
      "After the round, show the shortest exact solution and let the player replay the same numbers knowing one exists.",
  },
  {
    id: "golden-balls",
    name: "Golden Balls — Split or Steal",
    origin: "UK, 2007",
    category: "Numbers & money",
    webFit: "excellent",
    effort: "Weekend",
    players: "2",
    realtime: true,
    contentHeavy: false,
    premise:
      "Two players, one jackpot, one simultaneous secret choice: split it, or take it all and leave the other with nothing.",
    loop: [
      "A jackpot is built up over earlier rounds.",
      "Both players talk, promise, and negotiate freely.",
      "Both secretly choose Split or Steal.",
      "Split/Split shares it; Split/Steal gives everything to the stealer; Steal/Steal gives nobody anything.",
    ],
    buildNotes: [
      "A prisoner's dilemma with a chat window — the smallest possible build with the largest possible emotional payload.",
      "Simultaneity must be real: lock both choices server-side and reveal only when both are in, or the second player has an advantage.",
      "The negotiation phase is the game. Give it a timer, and keep a transcript to show alongside the reveal.",
      "Aggregate statistics across all games played become the interesting artefact: how often do people actually split?",
    ],
    twist:
      "Publish the running global split rate, and show each player their own history — people behave differently when their record is visible.",
  },
  {
    id: "card-sharks",
    name: "Card Sharks / Play Your Cards Right",
    origin: "US, 1978",
    category: "Numbers & money",
    webFit: "excellent",
    effort: "Weekend",
    players: "1–2",
    realtime: false,
    contentHeavy: true,
    premise:
      "Higher or lower on a row of playing cards, with the right to bet on how sure you are.",
    loop: [
      "Win the right to play by guessing a survey answer closest to the truth.",
      "Call higher or lower on the next card in the row.",
      "Wrong and you go back to the start of the row.",
      "Bet part of your bank on the final card.",
    ],
    buildNotes: [
      "The probability is genuinely computable, which makes it a good vehicle for showing players the odds after the fact.",
      "The survey questions gating each turn are the content cost; the card game itself is a hundred lines.",
      "Deck state matters — cards already shown change the odds, and a player who tracks them should be rewarded.",
    ],
    twist:
      "An 'odds coach' mode that shows the real probability after you commit, so the game teaches card counting by repetition.",
  },

  /* ---------- Timing & luck ---------- */
  {
    id: "press-your-luck",
    name: "Press Your Luck",
    origin: "US, 1983",
    category: "Timing & luck",
    webFit: "excellent",
    effort: "1–2 weeks",
    players: "1–3",
    realtime: true,
    contentHeavy: true,
    premise:
      "Stop a board of prizes that is cycling far too fast, and try not to land on the Whammy that wipes your score.",
    loop: [
      "Answer questions to earn spins.",
      "Press to stop the flashing board wherever it happens to be.",
      "Bank cash and prizes, or press on for more.",
      "A Whammy takes everything you have accumulated.",
    ],
    buildNotes: [
      "Reaction-timing over a network is unfair, so resolve the stop client-side against a seeded, deterministic board sequence and verify server-side.",
      "The flashing speed is the difficulty dial and should be tuned to feel just barely stoppable.",
      "The famous exploit — a contestant memorised the board's non-random pattern — is a reason to make yours genuinely random, and a great story to tell in the README.",
      "The push-or-bank decision is what makes it a game; make the accumulated total impossible to ignore.",
    ],
    twist:
      "Show your near-misses after each round: what you would have won had you stopped a tenth of a second earlier.",
  },
  {
    id: "plinko",
    name: "Plinko",
    origin: "US, 1983",
    category: "Timing & luck",
    webFit: "excellent",
    effort: "Weekend",
    players: "1",
    realtime: false,
    contentHeavy: false,
    premise:
      "Drop a chip down a peg board and watch it bounce into a prize slot. That is the whole game, and it is irresistible.",
    loop: [
      "Earn chips by guessing prices or answering questions.",
      "Choose a drop position along the top.",
      "Watch physics happen.",
      "Collect whatever slot it lands in.",
    ],
    buildNotes: [
      "A genuine physics build: use a 2D engine or write the collision yourself — pegs plus gravity plus restitution is a couple of hundred lines.",
      "Determinism matters if scores are competitive: seed the simulation and replay it server-side to verify, or players will find the exploit.",
      "The centre slot should be the jackpot and statistically rare — a binomial distribution does this for free.",
      "The best possible weekend project in this list because the payoff is visual and immediate.",
    ],
    twist:
      "Let players design the peg board, then share a link so friends drop chips down a layout you built.",
  },
  {
    id: "minute-to-win-it",
    name: "Minute to Win It",
    origin: "US, 2010",
    category: "Timing & luck",
    webFit: "workable",
    effort: "3–4 weeks",
    players: "1–4",
    realtime: true,
    contentHeavy: false,
    premise:
      "Sixty-second micro-challenges of escalating difficulty — most physical, but a real subset is achievable with a touchscreen.",
    loop: [
      "A challenge is explained in one sentence.",
      "Sixty seconds to complete it.",
      "Success moves you up the money ladder.",
      "Three lives; fail three challenges and you leave with nothing.",
    ],
    buildNotes: [
      "Be selective. Stacking cups does not translate; tapping accuracy, reaction chains, drag precision, rhythm timing and memory sequences all do.",
      "Each challenge is effectively its own mini-game, so build a challenge interface — mount, timer, success callback — and add challenges as plugins.",
      "Phone sensors open real options: shake, tilt and swipe challenges feel physical without needing a room full of props.",
      "The escalating ladder plus three lives is the frame that turns ten small toys into a show.",
    ],
    twist:
      "A challenge SDK — publish the interface and let other people write challenges that drop into the ladder.",
  },
  {
    id: "beat-the-clock",
    name: "Beat the Clock / Hot Potato",
    origin: "US, 1950",
    category: "Timing & luck",
    webFit: "good",
    effort: "Weekend",
    players: "3–8",
    realtime: true,
    contentHeavy: true,
    premise:
      "A hidden timer is running and the task passes from player to player — whoever is holding it when it stops is out.",
    loop: [
      "A category appears: 'name a Filipino dish'.",
      "Answer, then pass to the next player.",
      "Repeats and blanks are rejected.",
      "The clock stops at a random hidden moment and eliminates whoever is holding it.",
    ],
    buildNotes: [
      "The hidden timer must be server-authoritative and the duration randomised within a window, or clients can predict the explosion.",
      "You need a validity check on answers — an answer bank per category, plus fuzzy matching, plus a 'has this been said' set.",
      "Elimination-based formats need a spectator view; players out early must still be part of the room.",
      "Turn passing over a network is the same machinery as any turn-based multiplayer game.",
    ],
    twist:
      "Let the room submit categories before the game starts, so it becomes about the people in it.",
  },
  {
    id: "simon",
    name: "Simon / Sound memory",
    origin: "US, 1978",
    category: "Timing & luck",
    webFit: "excellent",
    effort: "Weekend",
    players: "1, or turn-based duel",
    realtime: false,
    contentHeavy: false,
    premise:
      "Repeat an ever-lengthening sequence of lights and tones until your memory gives out.",
    loop: [
      "The device plays a sequence.",
      "You repeat it exactly.",
      "One more step is added.",
      "Repeat until failure.",
    ],
    buildNotes: [
      "The Web Audio API rather than audio files: four oscillators at fixed frequencies, and you have the original hardware's sound with no assets.",
      "Timing precision matters — schedule tones on the audio clock, not with setTimeout, or the sequence drifts audibly.",
      "The duel variant is the game-show version: players alternate adding a step to a shared sequence.",
    ],
    twist:
      "A shared sequence duel where each player adds one step of their choosing, so it becomes offensive as well as defensive.",
  },
  {
    id: "concentration",
    name: "Concentration",
    origin: "US, 1958",
    category: "Timing & luck",
    webFit: "excellent",
    effort: "Weekend",
    players: "2",
    realtime: false,
    contentHeavy: true,
    premise:
      "Match pairs on a board; each matched pair peels away two tiles of a rebus puzzle you are racing to solve.",
    loop: [
      "Pick two numbered tiles.",
      "Matching prizes are yours and the tiles are removed.",
      "The picture underneath is progressively revealed.",
      "Solve the rebus at any time to win the round.",
    ],
    buildNotes: [
      "Memory matching is a beginner exercise; the rebus layer on top is what makes it a show and what costs authoring time.",
      "Rebus puzzles are images or composed glyphs — a small library of components (eye + heart + ewe) covers a lot of phrases.",
      "The tension between 'keep matching safely' and 'guess the rebus now' is the actual design; make guessing cost something.",
    ],
    twist:
      "Generate rebus puzzles from a phrase bank with a component library, so the puzzle supply is not hand-drawn.",
  },

  /* ---------- Survey & social ---------- */
  {
    id: "family-feud",
    name: "Family Feud",
    origin: "US, 1976",
    category: "Survey & social",
    webFit: "excellent",
    effort: "1–2 weeks",
    players: "2 teams + host, or solo vs the board",
    realtime: true,
    contentHeavy: true,
    premise:
      "We asked 100 people — name the most popular answers, not the right ones.",
    loop: [
      "Face-off: two players race to name the top answer.",
      "The winning team plays or passes, then works down the board.",
      "Three strikes hands the steal to the other team.",
      "Fast Money: two players, five questions, 200 points to win.",
    ],
    buildNotes: [
      "You need real survey data. Run your own surveys, aggregate what your players guess over time, or use an existing dataset — but invented answers feel wrong immediately and players can tell.",
      "Answer matching is the hard problem: 'the beach', 'beach', 'going to the beach' are one answer. Normalise, stem, and keep a manual alias list per answer.",
      "Strikes, steals and the pass decision are all simple state; the board reveal animation is what people actually remember.",
      "Solo against the board is a completely valid mode and removes all realtime work — build that first.",
    ],
    twist:
      "Survey your own audience continuously, so the board is built from the answers your previous players gave rather than an American survey from 1994.",
  },
  {
    id: "match-game",
    name: "Match Game",
    origin: "US, 1962",
    category: "Survey & social",
    webFit: "good",
    effort: "1–2 weeks",
    players: "4+",
    realtime: false,
    contentHeavy: true,
    premise:
      "Fill in a deliberately absurd blank and score by matching what other players wrote — the joke is the point.",
    loop: [
      "A prompt with an obvious but unsayable answer is read.",
      "Everyone writes privately.",
      "Answers reveal one at a time.",
      "You score for each player you matched.",
    ],
    buildNotes: [
      "Prompt writing is the entire product; the code is a form and a scoreboard. Budget your time accordingly.",
      "Normalisation again — matching has to be forgiving about articles, plurals and spelling.",
      "Works asynchronously, which makes it a good fit for a group chat rather than a scheduled session.",
    ],
    twist:
      "Let the room write the prompts for the next round, so the game generates its own content.",
  },
  {
    id: "hollywood-squares",
    name: "Hollywood Squares",
    origin: "US, 1966",
    category: "Survey & social",
    webFit: "good",
    effort: "1–2 weeks",
    players: "2 + 9 panellists (or bots)",
    realtime: true,
    contentHeavy: true,
    premise:
      "Noughts and crosses where you claim a square by deciding whether the personality in it answered correctly — and they are allowed to lie convincingly.",
    loop: [
      "Pick a square; that panellist gets a question.",
      "They answer, plausibly or not.",
      "You agree or disagree.",
      "Correct judgement claims the square; three in a row wins.",
    ],
    buildNotes: [
      "The bluff is the format. With bot panellists you need a wrong-answer generator that produces confident, plausible answers — much harder and more interesting than serving the right one.",
      "Distractor quality is the difficulty dial: a wrong answer that is obviously wrong makes the game trivial.",
      "The tic-tac-toe layer means a player can win on judgement alone without knowing any answers, which is a nice equaliser.",
    ],
    twist:
      "Let human players occupy squares and be scored on how often they successfully deceive, turning it into a lying competition.",
  },
  {
    id: "would-i-lie",
    name: "Would I Lie to You?",
    origin: "UK, 2007",
    category: "Survey & social",
    webFit: "good",
    effort: "1–2 weeks",
    players: "4–8",
    realtime: true,
    contentHeavy: false,
    premise:
      "Read out a statement about yourself — true or invented — and survive the cross-examination.",
    loop: [
      "A player is dealt a claim: one they wrote, or one the game invented.",
      "They present it as true.",
      "The other team interrogates freely.",
      "Everyone votes truth or lie; points for correct calls and for successful deception.",
    ],
    buildNotes: [
      "Players supply the content at the start of the session — everyone submits two true facts about themselves — which solves the content problem for free.",
      "The interrogation phase is voice or chat; the app's job is turn structure, voting, and keeping the secret.",
      "Secret-keeping must be server-side. If the truth value ever reaches a client that should not have it, the game is over.",
    ],
    twist:
      "The invented claims come from a pool of other players' real submissions, so a lie is always someone else's truth.",
  },
  {
    id: "the-mole",
    name: "The Mole / social deduction",
    origin: "Belgium, 1999",
    category: "Survey & social",
    webFit: "workable",
    effort: "Month+",
    players: "6–12",
    realtime: true,
    contentHeavy: true,
    premise:
      "The group completes tasks for a shared pot while one hidden player quietly sabotages it — identify them or lose everything.",
    loop: [
      "The group plays cooperative mini-games for money.",
      "The mole sabotages without being caught.",
      "Everyone takes a quiz about the mole's identity.",
      "The player who knows least is eliminated.",
    ],
    buildNotes: [
      "The heaviest build here: hidden roles, several cooperative mini-games, a quiz engine, and elimination — each of which is its own project.",
      "Sabotage must be deniable, so every mini-game needs failure modes that could plausibly be incompetence.",
      "Sessions run long, so state has to survive disconnects and reloads without leaking roles.",
      "Build this only after you have shipped two smaller ones; it is the capstone of this list.",
    ],
    twist:
      "A post-game replay showing every sabotage as it happened — the reveal is more satisfying than the game.",
  },
  {
    id: "improv-vote",
    name: "Whose Line-style improv",
    origin: "UK, 1988",
    category: "Survey & social",
    webFit: "workable",
    effort: "1–2 weeks",
    players: "3+ and an audience",
    realtime: true,
    contentHeavy: true,
    premise:
      "Prompts are generated, performances happen, and the audience votes — the points genuinely do not matter.",
    loop: [
      "A game type and a prompt are drawn.",
      "Players perform in text, voice, or on camera.",
      "The audience votes.",
      "Scores are awarded arbitrarily, which is the joke.",
    ],
    buildNotes: [
      "The app is a prompt generator plus a voting layer; everything entertaining happens outside it, which is a legitimate design.",
      "Audience voting at scale needs rate limiting and a way to stop one person voting fifty times.",
      "The prompt bank is the product. Generic prompts kill it; specific, absurd ones carry it.",
    ],
    twist:
      "Prompts composed from audience submissions in real time, so the room writes the show.",
  },

  /* ---------- Media & memory ---------- */
  {
    id: "name-that-tune",
    name: "Name That Tune / Beat Shazam",
    origin: "US, 1952",
    category: "Media & memory",
    webFit: "good",
    effort: "1–2 weeks",
    players: "1–4",
    realtime: true,
    contentHeavy: true,
    premise:
      "Identify a song from as few notes as possible, betting against an opponent on how little you need.",
    loop: [
      "Bid down: 'I can name that tune in four notes'.",
      "The clip plays for exactly that long.",
      "Name it correctly to score; fail and your opponent gets a full clip.",
      "Fastest correct identification wins the round.",
    ],
    buildNotes: [
      "Music licensing is the real obstacle, not code. Use royalty-free libraries, MIDI renditions of public-domain melodies, or user-supplied local files — do not ship copyrighted clips.",
      "MIDI sidesteps the problem elegantly: synthesise the melody in the browser and you have infinite clips with no licence.",
      "Audio timing needs the Web Audio API for precise clip lengths; HTML audio elements are too imprecise for a four-note bid.",
      "Answer matching must handle 'Bohemian Rhapsody' versus 'bohemian rapsody' gracefully.",
    ],
    twist:
      "A melody-only mode using synthesised MIDI, which is both legally clean and genuinely harder.",
  },
  {
    id: "catchphrase",
    name: "Catchphrase — picture reveal",
    origin: "UK, 1986",
    category: "Media & memory",
    webFit: "excellent",
    effort: "Weekend",
    players: "2–4",
    realtime: true,
    contentHeavy: true,
    premise:
      "A picture hiding a well-known phrase is revealed square by square; say what you see.",
    loop: [
      "Nine tiles cover an image.",
      "Correct answers to quick questions remove tiles.",
      "Any player can guess the phrase at any point.",
      "Guessing early is worth more and risks giving it away.",
    ],
    buildNotes: [
      "A tile grid over an image with a reveal animation — the simplest possible implementation of real tension.",
      "The puzzle art is the cost. A component library of pictorial elements lets you compose visual puzzles from parts rather than drawing each one.",
      "Buzzing in to guess needs the same server-timestamped buzzer as any quiz format.",
    ],
    twist:
      "Generate puzzles from emoji compositions — an entire visual puzzle bank with no illustration work at all.",
  },
  {
    id: "guess-the-year",
    name: "Guess the year / higher-lower facts",
    origin: "Format family, various",
    category: "Media & memory",
    webFit: "excellent",
    effort: "Weekend",
    players: "1–8, all at once",
    realtime: false,
    contentHeavy: true,
    premise:
      "An event, image or statistic is shown; place it on a timeline or say which of two is bigger.",
    loop: [
      "An item appears with a hidden number attached.",
      "Everyone commits a guess privately.",
      "The true value is revealed.",
      "Score by closeness rather than by being exactly right.",
    ],
    buildNotes: [
      "Scoring by proximity rather than correctness is the design that makes this work for mixed-knowledge groups — nobody is ever fully out.",
      "Any dataset with a number attached becomes content: populations, release dates, prices, distances. Content generation is nearly free.",
      "The timeline drag interaction is worth doing well; it is far more engaging than a text field.",
      "Public datasets make this the cheapest content pipeline in the entire list.",
    ],
    twist:
      "Build it against a dataset nobody has gamified — Philippine historical events, or the release dates of every tool in your stack.",
  },
];

/* ------------------------------------------------------------------
   The machinery every one of these shares. Build it once.
------------------------------------------------------------------ */

export const sharedMachinery: { title: string; text: string }[] = [
  {
    title: "A fair buzzer is a server problem",
    text: "Whoever buzzes first must win regardless of connection quality. Open the buzz window server-side, timestamp arrivals on the server, and resolve after a short collection window rather than first-packet-wins. Otherwise the player on fibre beats the player on mobile data every time, and the game is decided by ISP.",
  },
  {
    title: "Never send the answer to the client",
    text: "If the correct answer travels with the question, it is in the network tab and the game is over. Send the question, validate the submission on the server, return only the verdict. This is the same rule as validating a word against a dictionary server-side in a multiplayer word game.",
  },
  {
    title: "Three roles, not one screen",
    text: "Almost every format has a host, players, and spectators, and they need genuinely different views — the host sees answers, players see their own hand, spectators see everything after elimination. Decide this on the server with per-role queries, not by hiding elements in the UI.",
  },
  {
    title: "Phones are the buzzers",
    text: "The strongest pattern for party formats is a shared screen — TV, laptop, projector — plus everyone's phone as a controller, joined by a short room code. It removes the need for an app, and it is how the successful commercial party games work.",
  },
  {
    title: "Fuzzy answer matching is the recurring hard part",
    text: "Typed answers need normalising for case, punctuation, articles and plurals, then a distance check for typos, then a manual alias list for the ones that still fail. Budget real time for it in any format with free-text answers; it is where most of the frustration lives.",
  },
  {
    title: "Content is the product, code is the shell",
    text: "For most of these formats the engineering is a few weeks and the question bank is forever. Decide early where content comes from — authored, scraped, generated, or crowdsourced from your own players — because a beautiful engine with two hundred questions dies in one sitting.",
  },
  {
    title: "Rooms, reconnects, and the tab that got closed",
    text: "Somebody will refresh mid-round, lose signal, or close the tab. Room state belongs on the server, keyed by a rejoin token, so a returning player drops back into their seat. Decide up front what happens to their turn while they are gone.",
  },
  {
    title: "Reveal timing is the entertainment",
    text: "The single biggest gap between a working implementation and something people enjoy is pacing. Reveal answers one at a time, run counters down rather than printing results, and let silence sit before the verdict. It is not polish; it is the format.",
  },
];

/* ------------------------------------------------------------------
   Formats that genuinely do not survive the move to a browser.
------------------------------------------------------------------ */

export const doesNotTranslate: { name: string; reason: string }[] = [
  {
    name: "Wipeout, Ninja Warrior, Takeshi's Castle",
    reason:
      "The entertainment is bodies failing against physical obstacles. A digital version is a platformer, which is a different genre competing against much better platformers.",
  },
  {
    name: "Supermarket Sweep, Double Dare",
    reason:
      "Built on physical chaos in real space — running, grabbing, mess. Remove the space and only a timer remains.",
  },
  {
    name: "Fear Factor",
    reason: "Requires genuine physical stakes. Simulated risk is not risk.",
  },
  {
    name: "Blind Date, The Bachelor",
    reason:
      "Formats about people meeting people. What survives is a chat app, and the format contributes nothing to it.",
  },
  {
    name: "Anything whose appeal is a celebrity host",
    reason:
      "If the format is a frame for one person's charisma, the web version is a shell. Pick formats whose mechanics carry them.",
  },
];

/* ------------------------------------------------------------------
   The bit people skip.
------------------------------------------------------------------ */

export const legalNotes: string[] = [
  "Game mechanics are not protected by copyright — you can build a game where a wheel is spun and letters are guessed. Names, logos, set designs, catchphrases, theme music and specific visual identity are protected, and formats are aggressively licensed by their owners.",
  "So: build the mechanic, name it something else. 'Wheel of Fortune' is a trademark; a phrase-guessing wheel game with your own name and art is not.",
  "Never ship the theme music. Audio is the fastest route to a takedown, and there is always a royalty-free alternative or a synthesised one you can generate yourself.",
  "Survey data, question banks and puzzle sets scraped from a show's archive carry their own copyright. Public datasets, your own surveys, and your own writing avoid the problem entirely — and produce a better product, because the content is yours.",
  "If it is a portfolio piece rather than a product, say so plainly in the README, use your own naming, and none of this becomes a conversation.",
];

/* ------------------------------------------------------------------
   Derived helpers used by the page.
------------------------------------------------------------------ */

export const categories: Category[] = [
  "Quiz & trivia",
  "Word & language",
  "Numbers & money",
  "Timing & luck",
  "Survey & social",
  "Media & memory",
];

export const efforts: Effort[] = ["Weekend", "1–2 weeks", "3–4 weeks", "Month+"];

export const gameshowsMeta = {
  title: "Game show formats that work on the web",
  subtitle: `${shows.length} formats, judged on how well they survive losing the studio`,
  description:
    "A build catalogue of television game show formats that translate to a browser: the core loop, the part that is actually hard to build, and a version worth making rather than cloning.",
};
