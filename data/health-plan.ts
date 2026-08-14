/**
 * ============================================================
 *  A 12-WEEK BLOOD PRESSURE AND WEIGHT PLAN
 *
 *  Written for one person: 120 kg, 172 cm, living in the Philippines,
 *  on Veztenor (amlodipine + losartan), able to walk but not run or jog,
 *  exercising at home, starting Monday 17 August 2026.
 *
 *  This is general lifestyle guidance, not medical advice, and it does not
 *  replace the doctor who prescribed the medication. Nothing here changes
 *  a dose. See `medication` and `redFlags` below — they are the parts that
 *  matter most, and they are in the app for a reason.
 *
 *  Content is data, same convention as the rest of the site.
 * ============================================================
 */

export type Phase = {
  id: string;
  number: string;
  title: string;
  weeks: string;
  /** Inclusive date range, "YYYY-MM-DD". */
  startDate: string;
  endDate: string;
  goal: string;
  /** The two or three things that actually change this phase. */
  changes: string[];
  walkTarget: string;
  strengthTarget: string;
  /** What you should be able to point at when the phase ends. */
  checkpoint: string;
};

export type Exercise = {
  id: string;
  name: string;
  /** Plain-language instruction. No jargon, no equipment you do not have. */
  how: string;
  /** The one cue that keeps the movement safe at 120 kg. */
  cue: string;
  /** Easier version, for a bad day or a sore knee. */
  easier: string;
  harder: string;
};

export type WorkoutBlock = {
  exerciseId: string;
  /** Prescription by phase index (0–3), so progression is visible at a glance. */
  prescription: [string, string, string, string];
};

export type Workout = {
  id: string;
  name: string;
  when: string;
  blurb: string;
  blocks: WorkoutBlock[];
};

export type Swap = {
  from: string;
  to: string;
  why: string;
};

export type Meal = {
  name: string;
  items: string[];
  note?: string;
};

export type SampleDay = {
  label: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
};

export type Milestone = {
  weightKg: number;
  label: string;
  meaning: string;
};

/* ------------------------------------------------------------------
   The numbers this plan is built around
------------------------------------------------------------------ */

export const profile = {
  startDate: "2026-08-17",
  endDate: "2026-11-08",
  prepStart: "2026-08-15",
  startWeightKg: 120,
  heightCm: 172,
  /** 5% of starting weight — the point where blood pressure reliably responds. */
  goal12WeekKg: 114,
  /** 10%, the six-month target. */
  goal6MonthKg: 108,
  /** Weekly rate that is fast enough to see and slow enough to keep. */
  weeklyLossKg: 0.5,
  /** Home readings, not clinic. Your doctor sets the real target — confirm it. */
  homeBpTarget: { systolic: 135, diastolic: 85 },
  medication: "Veztenor (amlodipine + losartan)",
};

/* ------------------------------------------------------------------
   The four phases
------------------------------------------------------------------ */

export const phases: Phase[] = [
  {
    id: "prep",
    number: "0",
    title: "Two days of setup",
    weeks: "Sat 15 – Sun 16 August",
    startDate: "2026-08-15",
    endDate: "2026-08-16",
    goal: "Start Monday with everything already in place, so day one is only about doing it.",
    changes: [
      "Buy a digital upper-arm blood pressure monitor with the correct cuff size. At 120 kg a standard cuff is very likely too small, and a tight cuff reads falsely high — measure around your upper arm and buy a large adult cuff if it is over 32 cm. Wrist monitors are not accurate enough for this.",
      "Buy or borrow a bathroom scale that goes past 130 kg. Put it on a hard floor, not tiles that flex, and leave it in one place.",
      "Weigh yourself Sunday morning after the toilet, before eating, in the same light clothes. That number is your baseline — write it down and do not weigh again until next Sunday.",
      "Take your starting photos (front and side) in the app. You will not believe the change later without them.",
      "Clear the kitchen: instant noodles, canned meat, hotdog, tocino, longganisa, bouillon cubes, softdrinks. If it is in the house you will eat it at 10pm.",
      "Do one palengke run using the shopping list in the Food tab.",
      "Walk 10 minutes on Sunday evening, easy. Just to prove the shoes work.",
    ],
    walkTarget: "One easy 10-minute walk on Sunday",
    strengthTarget: "None yet",
    checkpoint:
      "A working BP monitor, a baseline weight, two photos, a stocked kitchen and no junk in the house.",
  },
  {
    id: "phase-1",
    number: "1",
    title: "Foundations",
    weeks: "Weeks 1–2 · 17–30 August",
    startDate: "2026-08-17",
    endDate: "2026-08-30",
    goal: "Build the daily habit and cut the sodium. Do not chase weight loss yet — chase the streak.",
    changes: [
      "Walk 10 minutes twice a day, after breakfast and after dinner. Twice short beats once long when you are starting at 120 kg — it is easier on the knees and easier to actually do.",
      "Take your BP every morning and every evening, and log it. Two weeks of readings is what your doctor needs to see.",
      "Cut the big five sodium sources: instant noodles, canned meat, processed meat, dried fish, and bouillon cubes or Magic Sarap. This alone can move your systolic several points.",
      "Three meals a day, no skipping. Skipping leads to a 9pm binge, every time.",
      "Measure your rice. One cup cooked per meal, using an actual cup, not a serving spoon.",
      "Strength work twice a week — Workout A, two rounds. Fifteen minutes.",
    ],
    walkTarget: "10 min × 2 daily",
    strengthTarget: "Workout A, twice a week",
    checkpoint:
      "Fourteen days of BP readings, a walking habit that survived a rainy day, and no instant noodles in the house.",
  },
  {
    id: "phase-2",
    number: "2",
    title: "Build",
    weeks: "Weeks 3–6 · 31 August – 27 September",
    startDate: "2026-08-31",
    endDate: "2026-09-27",
    goal: "Lengthen the walks, add the second strength session, and get the plate right at every meal.",
    changes: [
      "Walk 20–25 minutes once a day, or keep it as two walks if that suits your day better. Pace where you can talk in sentences but not sing.",
      "Half your plate is vegetables at lunch and dinner. This is the single highest-value food change after sodium.",
      "Protein at breakfast — eggs, tokwa, or fish. It is what stops the 3pm hunger that ends in a bakery.",
      "Strength three times a week now, alternating Workout A and Workout B.",
      "BP drops to three mornings a week once you have two clean weeks logged, unless your doctor wants daily.",
      "Five minutes of slow breathing before bed. Six breaths a minute, in through the nose. Small effect, free, and it helps you sleep.",
    ],
    walkTarget: "20–25 min daily",
    strengthTarget: "Workouts A and B, three times a week",
    checkpoint:
      "About 2–3 kg down, walks that no longer feel like a task, and a morning BP average you can compare to week 1.",
  },
  {
    id: "phase-3",
    number: "3",
    title: "Consolidate",
    weeks: "Weeks 7–10 · 28 September – 25 October",
    startDate: "2026-09-28",
    endDate: "2026-10-25",
    goal: "Make it survive real life — fiestas, handaan, bad weeks, and eating out.",
    changes: [
      "Walk 30–40 minutes daily, or 20 minutes twice. Add a small hill or a slightly faster ten minutes in the middle.",
      "Strength stays three times a week, but the reps go up and the rest goes down.",
      "Learn the three eating-out moves in the Food tab and use them at the next handaan rather than avoiding the handaan.",
      "One planned free meal a week. Planned, eaten slowly, then straight back. This is what stops the all-or-nothing collapse.",
      "Book your doctor's appointment for week 11 or 12 now, while slots exist.",
    ],
    walkTarget: "30–40 min daily",
    strengthTarget: "Three times a week, progressed",
    checkpoint:
      "About 5–6 kg down, a fiesta survived without abandoning the plan, and an appointment in the calendar.",
  },
  {
    id: "phase-4",
    number: "4",
    title: "Review and reset",
    weeks: "Weeks 11–12 · 26 October – 8 November",
    startDate: "2026-10-26",
    endDate: "2026-11-08",
    goal: "Measure what happened, see the doctor with real data, and decide the next twelve weeks.",
    changes: [
      "Keep everything exactly as it is. Nothing new in the last two weeks.",
      "Take your progress photos again, in the same spot, same light, same clothes as day one.",
      "Print or screenshot your BP averages and your weight chart and bring them to the appointment.",
      "Ask about the medication. If your BP has come down, your doctor may want to adjust the dose — that decision is theirs, never yours.",
      "Ask for repeat labs: kidney function, potassium, sugar, cholesterol.",
      "Then set the next block: the six-month target is 108 kg.",
    ],
    walkTarget: "30–40 min daily, maintained",
    strengthTarget: "Three times a week, maintained",
    checkpoint:
      "A doctor's visit backed by twelve weeks of your own data, and a decision about what comes next.",
  },
];

/* ------------------------------------------------------------------
   The day itself
------------------------------------------------------------------ */

export const dailyRhythm: { time: string; what: string; detail: string }[] = [
  {
    time: "On waking",
    what: "Blood pressure, before coffee",
    detail:
      "Sit for five minutes first, back supported, feet flat. Take it before your medicine and before coffee, then log it.",
  },
  {
    time: "Morning",
    what: "Medicine, same time every day",
    detail:
      "Veztenor at the same hour daily. Tie it to something you already do so you never wonder whether you took it.",
  },
  {
    time: "Breakfast",
    what: "Protein first",
    detail: "Eggs, tokwa, or fish, plus one cup of rice or oats. Not just rice and coffee.",
  },
  {
    time: "After breakfast",
    what: "Walk",
    detail:
      "Before 7am if you can — the Philippine heat between 10am and 3pm is not worth fighting, and losartan makes dehydration matter more.",
  },
  {
    time: "Lunch",
    what: "Half the plate vegetables",
    detail: "One cup rice, a palm of fish or chicken, and the rest gulay.",
  },
  {
    time: "Late afternoon",
    what: "Strength, on its days",
    detail: "Fifteen to twenty minutes. Monday, Wednesday, Friday works well.",
  },
  {
    time: "Dinner",
    what: "Same plate, earlier if possible",
    detail: "Finishing by 8pm helps sleep, which helps blood pressure more than most people expect.",
  },
  {
    time: "After dinner",
    what: "Walk again",
    detail: "Ten minutes around the neighbourhood. It also blunts the after-meal sugar spike.",
  },
  {
    time: "Before bed",
    what: "Evening BP, then five minutes of slow breathing",
    detail: "Log it, then six slow breaths a minute for five minutes. Lights out at a consistent hour.",
  },
];

/* ------------------------------------------------------------------
   Exercise — all of it at home, none of it running
------------------------------------------------------------------ */

export const exercises: Exercise[] = [
  {
    id: "sit-to-stand",
    name: "Sit-to-stand",
    how: "Sit on a sturdy chair, feet flat and slightly apart. Lean your chest forward over your knees, push through your heels, and stand up fully. Sit back down slowly, counting three.",
    cue: "Push the floor away with your heels. The slow sit down is the part that builds the leg.",
    easier: "Use a higher chair, or push off your thighs with your hands.",
    harder: "Cross your arms over your chest, or hold a 1.5L water bottle at your chest.",
  },
  {
    id: "wall-pushup",
    name: "Wall push-up",
    how: "Stand an arm's length from a wall, hands flat at shoulder height and slightly wider than your shoulders. Bend your elbows to bring your chest toward the wall, then push back.",
    cue: "Keep your body in one straight line from head to heels — do not let your hips sag.",
    easier: "Stand closer to the wall.",
    harder: "Move your feet further back, or use a kitchen counter instead of the wall.",
  },
  {
    id: "standing-march",
    name: "Standing march",
    how: "Hold a chair back lightly. Lift one knee to hip height, put it down, lift the other. Keep a steady rhythm.",
    cue: "Stand tall and breathe. If you cannot say a full sentence, slow down.",
    easier: "Lift the knee only halfway, or march seated.",
    harder: "Let go of the chair, or add a slow arm swing.",
  },
  {
    id: "calf-raise",
    name: "Calf raise",
    how: "Hold the back of a chair. Rise onto the balls of both feet, hold for one second, lower slowly.",
    cue: "Lower for a count of three. Also genuinely helps ankle swelling from amlodipine.",
    easier: "Smaller range, both hands on the chair.",
    harder: "One hand only, or pause two seconds at the top.",
  },
  {
    id: "towel-row",
    name: "Towel or band row",
    how: "Sit or stand and loop a towel around a fixed post, or hold a resistance band. Pull your elbows back past your ribs, squeezing your shoulder blades together, then release slowly.",
    cue: "Lead with the elbows, not the hands. Chest up, shoulders down away from the ears.",
    easier: "Less tension — stand closer or shorten your grip.",
    harder: "More tension, or pause one second at the squeeze.",
  },
  {
    id: "glute-bridge",
    name: "Glute bridge",
    how: "Lie on your back, knees bent, feet flat and hip-width apart. Push through your heels to lift your hips until your body is a straight line from knees to shoulders. Lower slowly.",
    cue: "Squeeze your backside at the top. Do not arch your lower back to get higher.",
    easier: "Lift only halfway.",
    harder: "Pause three seconds at the top, or lift one foot slightly.",
  },
  {
    id: "wall-sit",
    name: "Wall sit",
    how: "Stand with your back against a wall and slide down until your knees are bent — shallow at first, nowhere near ninety degrees. Hold.",
    cue: "Stop immediately if your knees complain. Shallow is fine; this is a time exercise, not a depth exercise.",
    easier: "Barely bend the knees, hold ten seconds.",
    harder: "Deeper or longer, up to forty-five seconds.",
  },
  {
    id: "farmer-carry",
    name: "Farmer carry",
    how: "Hold a filled water bottle or a loaded bag in each hand, arms at your sides. Stand tall and walk slowly across the room and back.",
    cue: "Shoulders back, ribs down, breathe normally. This trains your grip, your core and your posture at once.",
    easier: "Lighter bottles, or one hand at a time.",
    harder: "Heavier, or walk further.",
  },
  {
    id: "bird-dog",
    name: "Bird-dog",
    how: "On hands and knees. Reach one arm forward and the opposite leg back, hold two seconds, return. Alternate sides.",
    cue: "Move slowly enough that your hips do not rock. If getting to the floor is hard, do the standing version: reach one arm forward while sliding the opposite leg back on the floor.",
    easier: "Arm only, or leg only.",
    harder: "Hold five seconds.",
  },
  {
    id: "step-touch",
    name: "Step-touch",
    how: "Step to the side with one foot, bring the other to meet it, then step back the other way. Add your arms once the feet feel easy.",
    cue: "This is your cardio when it is raining and you cannot walk outside. No jumping, ever.",
    easier: "Smaller steps, no arms.",
    harder: "Wider steps, faster, or add a knee lift at the end of each side.",
  },
];

export const workouts: Workout[] = [
  {
    id: "workout-a",
    name: "Workout A",
    when: "Monday and Friday (Phase 1: Monday and Thursday)",
    blurb: "Legs and pushing. Fifteen minutes, no equipment beyond a chair and a wall.",
    blocks: [
      { exerciseId: "sit-to-stand", prescription: ["2 × 8", "2 × 10", "3 × 10", "3 × 12"] },
      { exerciseId: "wall-pushup", prescription: ["2 × 8", "2 × 10", "3 × 10", "3 × 12"] },
      { exerciseId: "calf-raise", prescription: ["2 × 10", "2 × 12", "3 × 12", "3 × 15"] },
      { exerciseId: "standing-march", prescription: ["2 × 30s", "2 × 45s", "3 × 45s", "3 × 60s"] },
    ],
  },
  {
    id: "workout-b",
    name: "Workout B",
    when: "Wednesday (added from Phase 2)",
    blurb: "Back, hips and core. The half that stops the aches from sitting and walking more.",
    blocks: [
      { exerciseId: "towel-row", prescription: ["—", "2 × 10", "3 × 10", "3 × 12"] },
      { exerciseId: "glute-bridge", prescription: ["—", "2 × 10", "3 × 12", "3 × 15"] },
      { exerciseId: "bird-dog", prescription: ["—", "2 × 6/side", "2 × 8/side", "3 × 8/side"] },
      { exerciseId: "farmer-carry", prescription: ["—", "2 × 30s", "3 × 40s", "3 × 60s"] },
      { exerciseId: "wall-sit", prescription: ["—", "2 × 15s", "3 × 20s", "3 × 30s"] },
    ],
  },
];

export const mobilityRoutine: string[] = [
  "Ankle circles, ten each way — do these seated, especially if your ankles swell.",
  "Shoulder rolls, ten backwards.",
  "Doorway chest stretch, thirty seconds. Forearm on the frame, step through gently.",
  "Seated hamstring stretch, thirty seconds each leg. One heel forward, hinge from the hips with a flat back.",
  "Neck side stretch, twenty seconds each side. Ear toward shoulder, no pulling.",
  "Calf stretch against the wall, thirty seconds each leg.",
];

export const exerciseSafety: string[] = [
  "Stop immediately and rest if you get chest pain or pressure, unusual shortness of breath, dizziness, a racing or irregular heartbeat, or pain in one calf. Chest pain that does not settle within a few minutes of rest is an emergency, not a reason to push through.",
  "If your blood pressure is 180/110 or higher when you check it, skip exercise that day and contact your doctor.",
  "Amlodipine can make you feel light-headed when you stand up quickly. Stand up in stages, especially getting off the floor after bridges or bird-dogs.",
  "Walk in the cooler hours and carry water. Losartan means dehydration puts more strain on your kidneys than it would otherwise.",
  "Shoes matter more at 120 kg than at 70. Cushioned, properly fitting, laced — and check your feet for blisters or hot spots after every walk.",
  "Knee or hip pain that lingers past the next morning means you did too much. Cut the walk in half for three days, then build again more slowly. Soreness in the muscle is fine; sharp pain in a joint is not.",
  "No running, no jogging, no jumping, and no deep squats. None of them are necessary, and all of them are hard on your joints at this weight.",
];

/* ------------------------------------------------------------------
   Food — Philippine kitchen, Philippine prices
------------------------------------------------------------------ */

export const plateRule: { part: string; what: string; detail: string }[] = [
  {
    part: "Half the plate",
    what: "Gulay",
    detail:
      "Kangkong, pechay, talong, sitaw, upo, ampalaya, malunggay, repolyo, carrots. Cooked in water, sautéed with garlic, or in sinigang. Any vegetable is better than no vegetable.",
  },
  {
    part: "A quarter",
    what: "Protein, about the size of your palm",
    detail:
      "Fish is the cheapest good option — galunggong, tilapia, bangus, tamban. Also eggs, chicken without the skin, tokwa, monggo.",
  },
  {
    part: "A quarter",
    what: "Rice — one measured cup, cooked",
    detail:
      "Not a heaped serving spoon. Use an actual cup. Brown or red rice is better if you can get it, but a measured cup of white rice beats an unmeasured cup of brown.",
  },
];

export const swaps: Swap[] = [
  {
    from: "Instant noodles (Lucky Me, Payless)",
    to: "Nilagang gulay, monggo, or fresh sinigang",
    why: "One pack carries roughly a full day's sodium on its own. This is the single biggest change on the list.",
  },
  {
    from: "Canned corned beef, meat loaf, Spam",
    to: "Inihaw na galunggong or tilapia, or two eggs",
    why: "Canned meat is salt, fat and preservative. Fresh fish at the palengke is usually cheaper per meal.",
  },
  {
    from: "Hotdog, tocino, longganisa, ham, tapa",
    to: "Eggs, tokwa, chicken breast, fish",
    why: "Processed meat is the second biggest sodium source in most Filipino kitchens.",
  },
  {
    from: "Tuyo, daing, dilis, danggit",
    to: "Fresh fish, any kind",
    why: "Dried fish is preserved in salt — that is what drying is. A small piece can carry more sodium than a whole meal should.",
  },
  {
    from: "Magic Sarap, bouillon cubes, MSG",
    to: "Garlic, onion, ginger, black pepper, bay leaf, lemongrass",
    why: "Real aromatics give you flavour without sodium. Your taste adjusts in about two weeks — food stops tasting bland.",
  },
  {
    from: "Sinigang mix sachets",
    to: "Fresh sampalok, kamias, or calamansi",
    why: "The sachet is mostly salt. Fresh souring agents taste better and cost about the same.",
  },
  {
    from: "Toyo and patis dipping bowls",
    to: "Calamansi with a little sili, or suka with garlic",
    why: "Dipping is where the sodium sneaks back in after you cooked the meal properly.",
  },
  {
    from: "Softdrinks, sweetened iced tea, 3-in-1 coffee",
    to: "Water, unsweetened coffee, plain tea",
    why: "A single soft drink a day is roughly 3 kg of body weight over a year, and it does nothing for hunger.",
  },
  {
    from: "Pandesal with margarine, or bread as a snack",
    to: "Boiled saba, papaya, or a hard-boiled egg",
    why: "Same convenience, actual fullness, no sugar crash an hour later.",
  },
  {
    from: "Chicharon, chippy, fried snacks",
    to: "Unsalted peanuts (a small handful), or fresh fruit",
    why: "Portion is the problem with fried snacks — nobody eats a small amount of chicharon.",
  },
  {
    from: "Frying in deep oil",
    to: "Inihaw, nilaga, ginisa with a small amount of oil, or steamed",
    why: "Same food, far less fat. Grilled bangus and fried bangus are not the same meal.",
  },
  {
    from: "Second and third cup of rice",
    to: "A second helping of gulay",
    why: "The refill is where most of the day's extra calories live. Fill the gap with vegetables, not rice.",
  },
];

export const sampleDays: SampleDay[] = [
  {
    label: "Ordinary weekday",
    breakfast: {
      name: "Breakfast",
      items: ["2 boiled or poached eggs", "1 cup rice", "Sliced tomato and onion", "Black coffee, no sugar"],
    },
    lunch: {
      name: "Lunch",
      items: ["Inihaw na tilapia (one palm-sized)", "Ginisang kangkong with garlic", "1 cup rice", "Calamansi for dipping"],
    },
    dinner: {
      name: "Dinner",
      items: ["Monggo with malunggay and a little tokwa", "Steamed pechay", "1 cup rice"],
      note: "Monggo is cheap, filling, high in fibre, and one of the best dinners on this plan.",
    },
    snack: { name: "Snack", items: ["Papaya or one boiled saba"] },
  },
  {
    label: "Cooking for the family",
    breakfast: {
      name: "Breakfast",
      items: ["Oatmeal with sliced saba", "1 boiled egg", "Coffee, no sugar"],
    },
    lunch: {
      name: "Lunch",
      items: ["Nilagang manok (skin removed) with repolyo, sitaw and patatas", "1 cup rice"],
      note: "Everyone eats the same pot. You just take more gulay and one cup of rice.",
    },
    dinner: {
      name: "Dinner",
      items: ["Sinigang na bangus with fresh sampalok, kangkong and labanos", "1 cup rice"],
      note: "Use fresh sampalok rather than the mix and this becomes one of the lowest-sodium meals you can make.",
    },
    snack: { name: "Snack", items: ["A small handful of unsalted peanuts", "Water"] },
  },
  {
    label: "Busy or lazy day",
    breakfast: {
      name: "Breakfast",
      items: ["2 eggs scrambled with tomato", "1 cup rice"],
    },
    lunch: {
      name: "Lunch",
      items: ["Canned tuna in water, drained, with onion and calamansi", "1 cup rice", "Any raw or boiled vegetable"],
      note: "Tuna in water, not oil, and drain it. This is the emergency meal, not the daily one.",
    },
    dinner: {
      name: "Dinner",
      items: ["Ginisang gulay with egg", "1 cup rice"],
    },
    snack: { name: "Snack", items: ["Buko juice, unsweetened — but see the potassium note in Safety"] },
  },
];

export const shoppingList: { group: string; items: string[] }[] = [
  {
    group: "Gulay — buy for three days at a time",
    items: ["Kangkong", "Pechay", "Talong", "Sitaw", "Repolyo", "Malunggay", "Ampalaya", "Carrots", "Labanos", "Tomatoes", "Onion", "Garlic", "Ginger"],
  },
  {
    group: "Protein",
    items: ["Eggs (a tray)", "Galunggong or tamban", "Tilapia or bangus", "Chicken (breast or any cut, remove the skin)", "Tokwa", "Monggo (dried, cheap, keeps forever)", "Canned tuna in water — for emergencies only"],
  },
  {
    group: "Staples",
    items: ["Rice — brown or red if available", "Rolled oats", "Cooking oil (a small bottle, so you use less)", "Vinegar", "Black pepper", "Bay leaf", "Fresh sampalok or kamias"],
  },
  {
    group: "Fruit",
    items: ["Papaya", "Saba bananas", "Mango (one, as a treat)", "Calamansi (a lot)", "Pineapple or watermelon"],
  },
  {
    group: "Do not put in the basket",
    items: ["Instant noodles", "Canned meat", "Hotdog, tocino, longganisa", "Tuyo and dilis", "Bouillon cubes and Magic Sarap", "Softdrinks and 3-in-1 coffee", "Chicharon and chips", "Low-sodium salt substitute — see Safety"],
  },
];

export const eatingOut: { situation: string; move: string }[] = [
  {
    situation: "Fiesta or handaan",
    move: "Eat a real meal before you go so you arrive not-starving. Take one plate, build it the normal way — half gulay, a palm of meat, one scoop of rice — and then move away from the table. Going back is a decision made standing next to the food, which is why it always goes the same way.",
  },
  {
    situation: "Karinderya",
    move: "Choose anything inihaw or nilaga over anything fried or with a thick sauce, ask for extra gulay, and ask for one cup of rice rather than the default heap. Skip the sabaw if it is a salty broth — that is where most of the sodium is.",
  },
  {
    situation: "Fast food",
    move: "Order the smallest size available, no upgrade, water instead of the drink, and skip the gravy and the dipping sauces. If there is a grilled chicken option, take it and remove the skin.",
  },
  {
    situation: "Someone hands you food you did not plan for",
    move: "Take it, eat it slowly, enjoy it, and carry on with the next meal exactly as planned. One unplanned meal changes nothing. Three days of 'I already ruined it' changes everything.",
  },
  {
    situation: "Drinking",
    move: "Alcohol raises blood pressure directly and the pulutan does the rest. If you drink, keep it to one or two on an occasion, never daily, and put water between them. Cutting alcohol is one of the fastest BP wins there is.",
  },
];

/* ------------------------------------------------------------------
   Blood pressure — how to measure it so the number means something
------------------------------------------------------------------ */

export const bpTechnique: string[] = [
  "Do not drink coffee, smoke, or exercise in the thirty minutes before. Empty your bladder first — a full bladder can add 10 points.",
  "Sit for five full minutes doing nothing before you press the button. This is the step everybody skips and it is the one that matters most.",
  "Sit with your back supported, both feet flat on the floor, legs uncrossed.",
  "Bare arm, resting on a table so the cuff is level with your heart. The cuff goes on the upper arm, about two fingers above the elbow crease, snug enough for one finger underneath.",
  "Do not talk during the reading. Talking adds several points.",
  "Take two readings a minute apart and record the second one. If they differ by a lot, take a third and record the average of the last two.",
  "Use the same arm every time. If your two arms read differently, use the higher one from now on.",
];

export const bpCategories: { label: string; range: string; tone: "good" | "warning" | "serious" | "critical"; meaning: string }[] = [
  { label: "At target", range: "Under 130/80", tone: "good", meaning: "This is where you want your home average to sit. Keep doing exactly what you are doing." },
  { label: "Acceptable", range: "130–134 / 80–84", tone: "good", meaning: "Fine as a home average for most people. Confirm your personal target with your doctor." },
  { label: "Above target", range: "135–159 / 85–99", tone: "warning", meaning: "Not an emergency, but it is the reason this plan exists. Keep logging and bring the averages to your appointment." },
  { label: "High", range: "160–179 / 100–109", tone: "serious", meaning: "Tell your doctor at the next opportunity rather than waiting for the scheduled visit — do not wait weeks." },
  { label: "Urgent", range: "180+ / 120+", tone: "critical", meaning: "Rest five minutes and measure again. If it stays this high, contact your doctor the same day. With chest pain, breathlessness, weakness on one side, trouble speaking, or vision changes, go to the emergency room immediately." },
];

/* ------------------------------------------------------------------
   The medication — the part that is specific to you
------------------------------------------------------------------ */

export const medication = {
  name: "Veztenor",
  contains: "Amlodipine (a calcium channel blocker) + losartan (an angiotensin II receptor blocker, an ARB)",
  disclaimer:
    "Below is general information about these two drug classes, not instructions about your prescription. Never change, split, skip or stop a dose based on anything here — that is your doctor's decision and yours together.",
  notes: [
    {
      title: "Do not use low-sodium salt substitutes",
      detail:
        "'Lite salt' and low-sodium salt are potassium chloride. Losartan already raises potassium, and too much potassium can cause dangerous heart rhythm problems. Cut sodium by using less salt and fewer salty products, not by replacing salt with a substitute. Do not take potassium supplements either.",
      severity: "high",
    },
    {
      title: "Normal fruit and vegetables are still fine — huge amounts of coconut water are not",
      detail:
        "Eating vegetables and fruit as this plan describes is safe and good for your blood pressure. What is worth moderating is drinking large amounts of buko juice every day, since coconut water is unusually high in potassium. Ask your doctor to check your potassium and kidney function at your next labs.",
      severity: "medium",
    },
    {
      title: "Avoid mefenamic acid and ibuprofen where you can",
      detail:
        "NSAIDs — Dolfenal, Advil, Alaxan and similar — work against ARBs, raise blood pressure, and put extra strain on the kidneys when combined with one. For ordinary aches and fever, paracetamol is generally the safer choice. Ask your doctor before using an NSAID regularly.",
      severity: "high",
    },
    {
      title: "Swollen ankles are an amlodipine effect, not weight gain",
      detail:
        "Amlodipine commonly causes fluid to pool in the ankles and lower legs. It can make the scale jump and it can look like failure when it is not. Calf raises, walking, and putting your feet up help. If the swelling is new, one-sided, painful, or comes with breathlessness, that needs a doctor now, not later.",
      severity: "medium",
    },
    {
      title: "As you lose weight, your blood pressure may go too low",
      detail:
        "This is a good problem and a real one. If you start feeling dizzy or light-headed when standing, or you notice readings drifting well below your target, that is a signal your dose may need reviewing. Bring your logged readings to your doctor — do not adjust anything yourself.",
      severity: "high",
    },
    {
      title: "Stand up in stages",
      detail:
        "Both drugs can cause a drop in blood pressure on standing. Sit on the edge of the bed for a few seconds before you get up, especially in the morning and after floor exercises.",
      severity: "low",
    },
    {
      title: "Heat and dehydration matter more on an ARB",
      detail:
        "Sweating heavily without drinking enough is harder on your kidneys while taking losartan. Walk in the early morning or the evening, carry water, and be careful during fever or a stomach bug — if you cannot keep fluids down, call your doctor.",
      severity: "medium",
    },
    {
      title: "Take it at the same time every day, and never double up",
      detail:
        "If you miss a dose and remember on the same day, take it. If it is nearly time for the next one, skip the missed one — do not take two. Never stop this medication suddenly because your readings look good.",
      severity: "medium",
    },
  ],
};

export const redFlags: { sign: string; action: string }[] = [
  {
    sign: "Chest pain or pressure, pain spreading to the jaw or arm, cold sweat",
    action: "Emergency. Call 911 or get to the nearest hospital immediately. Do not drive yourself.",
  },
  {
    sign: "Sudden weakness or numbness on one side, face drooping, trouble speaking or understanding, sudden vision loss",
    action: "Emergency — these are stroke signs. Note the time symptoms started and go immediately.",
  },
  {
    sign: "BP 180/120 or higher with headache, breathlessness, chest pain or vision changes",
    action: "Emergency room now.",
  },
  {
    sign: "BP 180/120 or higher with no symptoms, still high after resting five minutes and re-measuring",
    action: "Contact your doctor the same day.",
  },
  {
    sign: "Sudden shortness of breath, or breathlessness lying flat that wakes you at night",
    action: "Same-day medical attention.",
  },
  {
    sign: "Fainting, or repeated dizziness on standing",
    action: "Call your doctor — this can mean your blood pressure is now running too low for your dose.",
  },
  {
    sign: "Swelling in one leg with pain or warmth in the calf",
    action: "Same-day medical attention — this is different from the usual amlodipine ankle swelling.",
  },
  {
    sign: "Passing much less urine than usual, or swelling in the face",
    action: "Contact your doctor — kidney function needs checking on an ARB.",
  },
];

export const doctorQuestions: string[] = [
  "What home blood pressure number are we aiming for in my case?",
  "Here are twelve weeks of readings and my weight chart — does the dose still look right as I lose weight?",
  "Can I have my kidney function and potassium checked, given I am on losartan?",
  "Can I have fasting blood sugar or HbA1c, and a cholesterol panel? At my weight these matter.",
  "I snore and often wake up tired — should I be checked for sleep apnoea? (This is very common at my weight and it drives blood pressure up on its own.)",
  "Is there anything in this exercise plan you would change for me specifically?",
  "Which painkiller should I use, given the ARB?",
  "Would seeing a dietitian help, and is that available here?",
];

/* ------------------------------------------------------------------
   Motivation that is made of facts
------------------------------------------------------------------ */

export const milestones: Milestone[] = [
  { weightKg: 118, label: "First 2 kg", meaning: "Roughly 8 kg less force through each knee with every step you take. This is usually when walking starts feeling easier." },
  { weightKg: 116, label: "4 kg down", meaning: "Blood pressure typically starts responding around here — about 1 mmHg per kilogram is a reasonable expectation." },
  { weightKg: 114, label: "5% — the 12-week goal", meaning: "The threshold doctors actually care about. Real improvements in blood pressure, blood sugar and cholesterol start at 5%." },
  { weightKg: 110, label: "10 kg down", meaning: "Clothes fit differently, stairs are noticeably easier, and your BP chart should show it clearly by now." },
  { weightKg: 108, label: "10% — the six-month goal", meaning: "Sleep apnoea often improves here. This is frequently the point where a doctor reviews whether the dose can come down." },
  { weightKg: 100, label: "Under 100 kg", meaning: "A number worth marking. Two digits again." },
  { weightKg: 95, label: "BMI 32", meaning: "Out of the highest obesity category. Joint load, breathing and stamina are all meaningfully better." },
  { weightKg: 85, label: "BMI 28.7", meaning: "Overweight rather than obese. From here the conversation with your doctor changes completely." },
];

export const truths: string[] = [
  "Weight does not fall in a line. It goes down, flattens for ten days, then drops again. The flat stretch is the normal part, not the failure part.",
  "Salt, a heavy meal, poor sleep and amlodipine's ankle swelling can each move the scale a kilo or two overnight. That is water, not fat. This is exactly why you weigh weekly, not daily.",
  "Blood pressure is noisy. One high reading means nothing. The weekly average is the number that means something.",
  "Missing a day is a day. Missing a day and then quitting is the actual risk, and it is the only failure mode that matters.",
  "You cannot out-walk a bad kitchen. Food is most of the weight; walking is most of the blood pressure. You need both, but do not expect exercise alone to do it.",
  "Twelve weeks is not the plan. Twelve weeks is the first block of a plan you will run for years — that is why nothing here is extreme enough to need willpower.",
  "The people around you will offer you food. That is affection, not sabotage. Take a small plate and thank them.",
];
