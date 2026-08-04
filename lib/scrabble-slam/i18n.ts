/**
 * Localisation for the game's interface.
 *
 * Scope note worth being explicit about: this translates the CHROME, not
 * the puzzle. Scrabble Slam is built on changing one Latin letter of an
 * English word at a time, so the board, the cards and the dictionary stay
 * English in every language — there is no meaningful Chinese equivalent of
 * "change one letter of CART". A Chinese speaker gets Chinese menus, rules,
 * buttons and messages around an English word game.
 */

export type Lang = "en" | "zh";

export const LANGUAGES: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "zh", label: "中文", short: "中" },
];

type Dict = Record<string, string>;

const en: Dict = {
  // Mode select
  "app.kicker": "Word Blitz",
  "app.title": "Scrabble Slam!",
  "app.blurb":
    "Change one letter of the word at a time to make a new real word. Play solo against the clock, or race a friend live.",
  "mode.solo": "Play Solo",
  "mode.soloBlurb": "Race the timer. Available anytime, no one else needed.",
  "mode.multi": "Play with a Friend",
  "mode.multiBlurb": "Create a room, share the code, take turns.",
  "mode.multiOff": "Multiplayer isn't configured on this deployment yet.",
  "nav.backPortfolio": "← Back to portfolio",
  "nav.backModes": "← Back to game modes",
  "nav.back": "← Back",

  // Start screen
  "start.blurb":
    "Change one letter of the word at a time to make a new real word. Empty your hand before the clock runs out.",
  "start.wordLength": "Word length",
  "start.dictionary": "Dictionary",
  "start.timer": "Timer",
  "start.begin": "Start Round",
  "start.help":
    "Drag a card onto a letter slot, or tap the card then tap the slot. Power-ups sit on the side and recharge as you make words. You can shuffle your hand any time, and hold at most {max} cards. Run out of legal moves and the hand reshuffles itself, but you take 2 extra cards for it.",
  "length.4": "Easiest",
  "length.5": "Balanced",
  "length.6": "Hardest",
  "timer.casual": "Casual",
  "timer.standard": "Standard",
  "timer.blitz": "Blitz",
  "timer.endless": "Endless",
  "timer.noTimer": "No timer",
  "endless.rules":
    "Endless rules: no clock, so the only way to finish is to get down to zero cards. Every card you draw makes that further away, and Freeze and Swap are off (both are paid for in seconds).",
  "endless.rulesMulti":
    "Endless: no clock, so the race is purely to empty your hand first. A wrong guess costs you your turn instead of seconds.",

  // HUD
  "hud.quit": "← Quit",
  "hud.shuffle": "⇄ Shuffle",
  "hud.draw": "Draw card",
  "hud.swap": "Swap selected (−3s)",
  "hud.left": "{n} left",
  "hud.wordsPlayed": "{n} words played",
  "hud.wordPlayed": "{n} word played",
  "hud.mute": "Mute sound",
  "hud.unmute": "Unmute sound",
  "hud.handFull": "Your hand is full at {max} cards",
  "hud.drawHelp":
    "Draw a fresh letter card. Grows your hand by 1, and you win by emptying it.",
  "hud.shuffleHelp": "Reorder your hand. Same cards, free, as often as you like.",
  "hud.swapHelp": "Select a card first, then swap it for a new one (costs 3 seconds)",
  "hud.elapsedHelp": "No timer in Endless — this is how long you've been playing",

  // Hand
  "hand.title": "Your hand · {n} cards",
  "hand.titleOne": "Your hand · 1 card",

  // Power-ups
  "power.title": "Power-ups",
  "power.footer": "Cooldowns tick down each time you make a word.",
  "power.cooldown": "· {n}-word cooldown",
  "power.wordsLeft": "{n} words left",
  "power.wordLeft": "1 word left",
  "power.noTimer": "No timer",
  "power.hint.label": "Hint",
  "power.hint.short": "Show me a move",
  "power.hint.help":
    "Highlights one letter slot and the card in your hand that makes a valid word there. The fastest way out of a blank moment.",
  "power.chaos.label": "Chaos",
  "power.chaos.short": "Reroll 4 letters",
  "power.chaos.help":
    "Swaps 4 random cards in your hand for fresh ones. Your hand size doesn't change — use it when you're holding dead letters.",
  "power.freeze.label": "Freeze",
  "power.freeze.short": "+8 seconds",
  "power.freeze.help":
    "Puts 8 seconds back on your own clock. Save it for when your timer turns red.",
  "power.purge.label": "Purge",
  "power.purge.short": "Burn 2 cards",
  "power.purge.help":
    "Instantly discards 2 cards from your hand — straight progress toward emptying it, no word required. The longest cooldown for a reason.",

  // Rescue
  "rescue.noMoves": "No moves left",
  "rescue.deadEnd": "Dead-end word",
  "rescue.reshuffled": "Hand reshuffled · {gained}",
  "rescue.gainedCards": "+{n} cards",
  "rescue.gainedCard": "+1 card",
  "rescue.gainedReroll": "hand full, letters rerolled",
  "rescue.newWord": "Nothing plays off it, so here's a new one ·",

  // End screen
  "end.cleared": "Hand cleared",
  "end.timesUp": "Time's up",
  "end.win": "You win!",
  "end.lose": "Out of time",
  "end.score": "Score",
  "end.finalWord": "Final word:",
  "end.fromWords": "{n} from words",
  "end.forClearing": "+{n} for clearing",
  "end.timeLeft": "+{n} time left",
  "end.penalties": "−{n} {what}",
  "end.playAgain": "Play again",
  "stat.words": "Words",
  "stat.cardsLeft": "Cards left",
  "stat.draws": "Draws",
  "stat.rescues": "Rescues",
  "stat.swaps": "Swaps",
  "word.draws": "draws",
  "word.rescues": "rescues",

  // Leaderboard
  "board.title": "Leaderboard",
  "board.clear": "Clear",
  "board.confirmClear": "Delete all saved runs?",
  "board.confirmYes": "Yes, delete",
  "board.confirmNo": "Keep them",
  "board.empty": "No runs yet. Finish a round and your score lands here.",
  "board.thisRun": "This run",
  "board.cleared": "Cleared",
  "board.timedOut": "Timed out",
  "board.mode": "{len} letters · {timer}",
  "board.modeHan": "{len} characters · {timer}",

  // Lobby
  "lobby.kicker": "Multiplayer",
  "lobby.title": "Play with a friend",
  "lobby.create": "Create a room",
  "lobby.join": "Join a room",
  "lobby.yourName": "Your name",
  "lobby.namePlaceholder": "e.g. Leandro",
  "lobby.roomCode": "Room code",
  "lobby.codePlaceholder": "e.g. AB3XQ9",
  "lobby.creating": "Creating…",
  "lobby.createBtn": "Create room",
  "lobby.joining": "Joining…",
  "lobby.joinBtn": "Join room",
  "lobby.needName": "Enter a name first.",
  "lobby.needCode": "Enter the room code your friend shared.",
  "lobby.noConnect": "Couldn't connect to the multiplayer server. Try again shortly.",
  "lobby.noRoom": "No room with that code.",
  "lobby.started": "That game has already started.",
  "lobby.createFailed": "Couldn't create the room.",
  "lobby.joinFailed": "Couldn't join the room.",

  // Waiting room
  "wait.roomCode": "Room code",
  "wait.share": "Share this code with your friend.",
  "wait.you": "(you)",
  "wait.host": "Host",
  "wait.waiting": "Waiting for another player to join…",
  "wait.start": "Start game",
  "wait.starting": "Starting…",
  "wait.hostWillStart": "Waiting for the host to start the game…",
  "wait.needMore": "Waiting on at least one more player.",
  "wait.leave": "← Leave room",
  "wait.turnOrder": "Turn order follows the order everyone joined.",

  // Turn / roster
  "turn.yours": "Your turn",
  "turn.theirs": "{name}'s turn",
  "turn.waiting": "Waiting for {name}…",
  "turn.notYours": "Wait for your turn",
  "turn.pass": "Pass turn",
  "turn.skipStalled": "Skip stalled turn",
  "turn.stalledNote": "This turn has been idle a while. Anyone can move it on.",
  "roster.title": "Players",
  "roster.cards": "{n} cards",
  "roster.card": "1 card",
  "roster.out": "Out",
  "roster.noClock": "No clock",
  "roster.wrongGuess": "−{n}s wrong guess",
  "roster.turnSkipped": "Turn skipped",

  // Spectator
  "spec.title": "You're out",
  "spec.kicker": "Spectating",
  "spec.blurb":
    "Your clock ran out, so you're watching the rest play it out. Every hand is face up to you now.",
  "spec.hands": "Every hand",
  "spec.leave": "← Leave the room",
  "spec.stillPlaying": "still playing",
  "spec.eliminated": "out",

  // Multiplayer end
  "mp.won": "{name} wins!",
  "mp.youWon": "You win!",
  "mp.everyoneOut": "Everyone ran out of time",
  "mp.backToLobby": "Back to the lobby",

  "dict.standard.label": "Standard English",
  "dict.standard.desc": "Common everyday words.",
  "dict.tech.label": "Tech Terminology",
  "dict.tech.desc": "Programming and software words.",
  "dict.chinese.label": "中文 Chinese",
  "dict.chinese.desc": "Two-character words. Swap one character.",
  "start.hanRules":
    "Chinese plays as two-character words 词: swap one character 字 to make another real word. 国家 → 大家 → 作家 → 专家. Cards are single characters, drawn from a fixed set of 250.",
  "start.helpHan":
    "Drag a character onto a slot, or tap the card then tap the slot. Power-ups sit on the side and recharge as you make words. You can shuffle your hand any time, and hold at most {max} cards. Run out of legal moves and the hand is redrawn, but you take 2 extra cards for it.",

  // Language
  "lang.label": "Language",
};

const zh: Dict = {
  "app.kicker": "单词闪电战",
  "app.title": "拼字猛击！",
  "app.blurb":
    "每次改变单词中的一个字母，拼出新的真实单词。可以独自挑战计时，也可以和朋友实时对战。",
  "mode.solo": "单人游戏",
  "mode.soloBlurb": "与时间赛跑。随时可玩，无需他人。",
  "mode.multi": "与朋友对战",
  "mode.multiBlurb": "创建房间，分享房号，轮流出牌。",
  "mode.multiOff": "此部署尚未配置多人游戏。",
  "nav.backPortfolio": "← 返回作品集",
  "nav.backModes": "← 返回模式选择",
  "nav.back": "← 返回",

  "start.blurb":
    "每次改变单词中的一个字母，拼出新的真实单词。在时间耗尽前打完手牌。",
  "start.wordLength": "单词长度",
  "start.dictionary": "词库",
  "start.timer": "计时",
  "start.begin": "开始回合",
  "start.help":
    "把卡牌拖到字母格上，或先点卡牌再点格子。强化技能在侧边栏，每拼出一个单词就会冷却一格。手牌随时可以重排，最多持有 {max} 张。若无子可走，手牌会自动重抽，但你要额外拿 2 张牌。",
  "length.4": "最简单",
  "length.5": "均衡",
  "length.6": "最难",
  "timer.casual": "休闲",
  "timer.standard": "标准",
  "timer.blitz": "闪电",
  "timer.endless": "无尽",
  "timer.noTimer": "无计时",
  "endless.rules":
    "无尽模式规则：没有计时，唯一的结束方式就是把手牌打到零张。每抽一张牌都会离胜利更远，且「冻结」与「换牌」不可用（两者都以秒数为代价）。",
  "endless.rulesMulti":
    "无尽模式：没有计时，比的就是谁先打完手牌。猜错的代价是失去这一回合，而不是扣秒数。",

  "hud.quit": "← 退出",
  "hud.shuffle": "⇄ 重排",
  "hud.draw": "抽牌",
  "hud.swap": "换掉所选（−3秒）",
  "hud.left": "剩 {n} 张",
  "hud.wordsPlayed": "已拼出 {n} 个单词",
  "hud.wordPlayed": "已拼出 {n} 个单词",
  "hud.mute": "静音",
  "hud.unmute": "取消静音",
  "hud.handFull": "手牌已满，上限 {max} 张",
  "hud.drawHelp": "抽一张新的字母牌。手牌加一张，而打完手牌才算获胜。",
  "hud.shuffleHelp": "重排手牌顺序。牌不变，免费，随时可用。",
  "hud.swapHelp": "先选一张牌，再换成新的（消耗 3 秒）",
  "hud.elapsedHelp": "无尽模式没有倒计时，这里显示已用时间",

  "hand.title": "你的手牌 · {n} 张",
  "hand.titleOne": "你的手牌 · 1 张",

  "power.title": "强化技能",
  "power.footer": "每拼出一个单词，冷却就减少一格。",
  "power.cooldown": "· 冷却 {n} 个单词",
  "power.wordsLeft": "还差 {n} 个单词",
  "power.wordLeft": "还差 1 个单词",
  "power.noTimer": "无计时",
  "power.hint.label": "提示",
  "power.hint.short": "给我一步棋",
  "power.hint.help":
    "高亮一个字母格，以及手牌中能在该处拼成合法单词的那张牌。卡壳时最快的出路。",
  "power.chaos.label": "混沌",
  "power.chaos.short": "重抽 4 张",
  "power.chaos.help":
    "随机把手牌中的 4 张换成新的。手牌数量不变，适合在握着一手废字母时使用。",
  "power.freeze.label": "冻结",
  "power.freeze.short": "+8 秒",
  "power.freeze.help": "为自己的计时器加回 8 秒。留到计时变红时再用。",
  "power.purge.label": "清除",
  "power.purge.short": "烧掉 2 张",
  "power.purge.help":
    "立即弃掉手牌中的 2 张，无需拼词就能直接推进。冷却最长自有其道理。",

  "rescue.noMoves": "无子可走",
  "rescue.deadEnd": "死路单词",
  "rescue.reshuffled": "手牌已重抽 · {gained}",
  "rescue.gainedCards": "+{n} 张牌",
  "rescue.gainedCard": "+1 张牌",
  "rescue.gainedReroll": "手牌已满，改为重抽字母",
  "rescue.newWord": "它接不出任何单词，换一个 ·",

  "end.cleared": "手牌清空",
  "end.timesUp": "时间到",
  "end.win": "你赢了！",
  "end.lose": "时间耗尽",
  "end.score": "得分",
  "end.finalWord": "最终单词：",
  "end.fromWords": "单词得分 {n}",
  "end.forClearing": "清空奖励 +{n}",
  "end.timeLeft": "剩余时间 +{n}",
  "end.penalties": "−{n} {what}",
  "end.playAgain": "再来一局",
  "stat.words": "单词",
  "stat.cardsLeft": "剩余手牌",
  "stat.draws": "抽牌",
  "stat.rescues": "救援",
  "stat.swaps": "换牌",
  "word.draws": "抽牌",
  "word.rescues": "救援",

  "board.title": "排行榜",
  "board.clear": "清空",
  "board.confirmClear": "确定删除所有记录？",
  "board.confirmYes": "确定删除",
  "board.confirmNo": "保留",
  "board.empty": "还没有记录。打完一局，成绩就会出现在这里。",
  "board.thisRun": "本局",
  "board.cleared": "已清空",
  "board.timedOut": "超时",
  "board.mode": "{len} 字母 · {timer}",
  "board.modeHan": "双字词 · {timer}",

  "lobby.kicker": "多人游戏",
  "lobby.title": "与朋友对战",
  "lobby.create": "创建房间",
  "lobby.join": "加入房间",
  "lobby.yourName": "你的名字",
  "lobby.namePlaceholder": "例如：Leandro",
  "lobby.roomCode": "房间号",
  "lobby.codePlaceholder": "例如：AB3XQ9",
  "lobby.creating": "创建中…",
  "lobby.createBtn": "创建房间",
  "lobby.joining": "加入中…",
  "lobby.joinBtn": "加入房间",
  "lobby.needName": "请先输入名字。",
  "lobby.needCode": "请输入朋友分享的房间号。",
  "lobby.noConnect": "无法连接到多人服务器，请稍后再试。",
  "lobby.noRoom": "没有找到该房间号。",
  "lobby.started": "该局游戏已经开始了。",
  "lobby.createFailed": "无法创建房间。",
  "lobby.joinFailed": "无法加入房间。",

  "wait.roomCode": "房间号",
  "wait.share": "把这个房间号分享给你的朋友。",
  "wait.you": "（你）",
  "wait.host": "房主",
  "wait.waiting": "等待其他玩家加入…",
  "wait.start": "开始游戏",
  "wait.starting": "开始中…",
  "wait.hostWillStart": "等待房主开始游戏…",
  "wait.needMore": "至少还需要一名玩家。",
  "wait.leave": "← 离开房间",
  "wait.turnOrder": "出牌顺序按加入房间的先后排列。",

  "turn.yours": "轮到你了",
  "turn.theirs": "轮到 {name}",
  "turn.waiting": "等待 {name}…",
  "turn.notYours": "等待你的回合",
  "turn.pass": "跳过回合",
  "turn.skipStalled": "跳过卡住的回合",
  "turn.stalledNote": "这个回合已经闲置一段时间了，任何人都可以推进。",
  "roster.title": "玩家",
  "roster.cards": "{n} 张牌",
  "roster.card": "1 张牌",
  "roster.out": "淘汰",
  "roster.noClock": "无计时",
  "roster.wrongGuess": "猜错 −{n} 秒",
  "roster.turnSkipped": "回合被跳过",

  "spec.title": "你被淘汰了",
  "spec.kicker": "观战中",
  "spec.blurb": "你的时间用完了，现在观看其他人继续。所有手牌对你都是明牌。",
  "spec.hands": "所有手牌",
  "spec.leave": "← 离开房间",
  "spec.stillPlaying": "仍在游戏",
  "spec.eliminated": "已淘汰",

  "mp.won": "{name} 获胜！",
  "mp.youWon": "你赢了！",
  "mp.everyoneOut": "所有人都用完了时间",
  "mp.backToLobby": "返回大厅",

  "dict.standard.label": "标准英语",
  "dict.standard.desc": "日常常用单词。",
  "dict.tech.label": "科技术语",
  "dict.tech.desc": "编程与软件相关单词。",
  "dict.chinese.label": "中文",
  "dict.chinese.desc": "双字词，每次换一个字。",
  "start.hanRules":
    "中文模式玩的是双字词：每次换掉其中一个字，拼出另一个真实的词。国家 → 大家 → 作家 → 专家。卡牌是单个汉字，从固定的 250 字表中抽取。",
  "start.helpHan":
    "把汉字卡拖到字格上，或先点卡牌再点字格。强化技能在侧边栏，每拼出一个词就会冷却一格。手牌随时可以重排，最多持有 {max} 张。若无子可走，手牌会重抽，但你要额外拿 2 张牌。",

  "lang.label": "语言",
};

const DICTS: Record<Lang, Dict> = { en, zh };

/* ---------- Store ----------
   Same external-store shape as the mute preference and the leaderboard:
   the read happens in getSnapshot, which is where React wants impure reads,
   and the snapshot stays referentially stable between writes. */

const STORAGE_KEY = "scrabble-slam:lang";
let current: Lang | null = null;
const listeners = new Set<() => void>();

export function subscribeLang(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLangSnapshot(): Lang {
  if (current === null) {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored === "en" || stored === "zh") current = stored;
    else current = navigator?.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
  }
  return current;
}

/** Always English on the server so markup matches the first client paint. */
export function getLangServerSnapshot(): Lang {
  return "en";
}

export function setLang(next: Lang): void {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode: the choice just won't survive a reload.
  }
  listeners.forEach((l) => l());
}

/** Looks up a key, filling {placeholders}. Falls back to English, then the key. */
export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>
): string {
  const raw = DICTS[lang]?.[key] ?? en[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name) =>
    name in params ? String(params[name]) : m
  );
}
