/**
 * Teaching curriculum for EP5 猫鼠之争.
 *
 * Everything here is anchored to lines that actually occur in the episode —
 * `anchors` hold dialogue beat ids, so the injector can place a pause right
 * after the line a learner just heard.
 */

export interface BeijingNote {
  id: string;
  /** Dialogue beat ids where this feature appears */
  anchors: string[];
  /** Beat id after which the full teaching pause is inserted */
  teachAfter: string;
  feature: string;
  featurePinyin: string;
  /** One-line badge text shown inline under the subtitle */
  badge: string;
  standard: string;
  english: string;
  explanation: string;
  narratorScript: string;
}

export interface IdiomEntry {
  id: string;
  anchors: string[];
  teachAfter: string;
  chinese: string;
  pinyin: string;
  english: string;
  literal: string;
  /** Common learner trap, when the surface reading misleads */
  trap?: string;
  narratorScript: string;
}

export interface GrammarStep {
  id: string;
  anchors: string[];
  teachAfter: string;
  pattern: string;
  patternPinyin: string;
  english: string;
  /** Position in a multi-step ladder for the same structure */
  ladder?: { family: string; step: number; of: number };
  example: string;
  examplePinyin: string;
  exampleEnglish: string;
  drill: string;
  drillAnswer: string;
  narratorScript: string;
}

export interface VocabItem {
  chinese: string;
  pinyin: string;
  english: string;
  breakdown?: string[];
  /** Beat ids where the word is spoken */
  heardAt: string[];
  note?: string;
}

export interface VocabDeck {
  id: string;
  title: string;
  titleEn: string;
  theme: string;
  /** Insert the deck review pause after this beat */
  teachAfter: string;
  items: VocabItem[];
  narratorScript: string;
}

export interface CultureCard {
  id: string;
  anchors: string[];
  teachAfter: string;
  title: string;
  titlePinyin: string;
  english: string;
  body: string;
  narratorScript: string;
}

/* ------------------------------------------------------------------ *
 * 1–3. Beijing / northern colloquial speech
 * ------------------------------------------------------------------ */

export const BEIJING_NOTES: BeijingNote[] = [
  {
    id: "bj-haozi",
    anchors: ["041", "042", "050", "051", "068", "069", "070", "071", "072", "073", "074", "078", "079", "080", "082", "177", "178", "180"],
    teachAfter: "042",
    feature: "耗子",
    featurePinyin: "hàozi",
    badge: "耗子 = Beijing colloquial for 老鼠 (mouse)",
    standard: "老鼠 lǎoshǔ",
    english: "mouse / rat — casual northern word",
    explanation:
      "耗子 is what Beijing speakers actually say at home. 老鼠 is the neutral, written, or 'expert' word. Watch Liu Mei switch: she screams 耗子 when she is scared, then says 老鼠 the moment she pretends to be a mouse specialist.",
    narratorScript:
      "Beijing speech note. 耗子 — hàozi — is the everyday northern word for a mouse. The textbook word is 老鼠, lǎoshǔ. Listen for the switch: when Liu Mei is frightened she says 耗子, but when she is showing off her supposed expertise, she says 老鼠. Same animal, completely different register.",
  },
  {
    id: "bj-zan",
    anchors: ["025", "036", "047"],
    teachAfter: "047",
    feature: "咱 / 咱俩",
    featurePinyin: "zán / zán liǎ",
    badge: "咱 = we, including you (northern)",
    standard: "我们 wǒmen",
    english: "we — but always including the listener",
    explanation:
      "咱 is inclusive we: you are part of it. 我们 can exclude the person you are talking to. Northern speakers reach for 咱 and 咱俩 constantly — 咱俩 means 'the two of us'. Saying 咱 instead of 我们 is a small move that sounds instantly warmer.",
    narratorScript:
      "Beijing speech note. 咱 — zán — means we, and it always includes the person you are speaking to. 我们 might leave them out. So when Liu Mei says 咱俩的兴趣爱好多相投, zán liǎ — the two of us — she is pulling Xiaoxue onto her team. Northern speakers use 咱 far more than textbooks suggest.",
  },
  {
    id: "bj-softeners",
    anchors: ["023", "025", "032", "050", "052", "061", "069", "107", "129", "158", "181"],
    teachAfter: "061",
    feature: "呀 / 呢 / 啊",
    featurePinyin: "ya / ne / a",
    badge: "Sentence-final 呀 softens complaint into a whine",
    standard: "(no particle)",
    english: "final particles that carry attitude, not meaning",
    explanation:
      "These particles change tone, not content. 呀 turns a flat statement into a complaint, plea, or whine. 呢 adds 'and what about…' or gentle insistence. 啊 softens a command into a nudge. Strip them out and the same line sounds cold and abrupt.",
    narratorScript:
      "Beijing speech note. Listen to the last sound of these lines. 我是说 我害怕呀 — that 呀 turns 'I'm scared' into a whine, almost a plea. Without it, the line is flat and cold. 呢 adds gentle insistence, 啊 softens an order into a nudge. These particles carry no dictionary meaning at all — they carry attitude.",
  },
];

/* ------------------------------------------------------------------ *
 * 4–5. Four-character idioms & set phrases
 * ------------------------------------------------------------------ */

export const IDIOMS: IdiomEntry[] = [
  {
    id: "idiom-chouwei",
    anchors: ["013"],
    teachAfter: "013",
    chinese: "臭味相投",
    pinyin: "chòu wèi xiāng tóu",
    english: "Birds of a feather flock together",
    literal: "Same foul smell, same direction",
    narratorScript:
      "Idiom break. 臭味相投 — chòu wèi xiāng tóu. Literally: the same bad smell, drawn together. It means people with the same quirky tastes stick together. Dad says it teasingly about Liu Mei and Xiaoxue bonding over F4 — it's an insult on paper, affectionate in practice.",
  },
  {
    id: "idiom-yijiaren",
    anchors: ["015"],
    teachAfter: "015",
    chinese: "不是一家人，不进一家门",
    pinyin: "bù shì yī jiā rén, bù jìn yī jiā mén",
    english: "Like attracts like — same kind ends up under one roof",
    literal: "If you're not one family, you don't walk through one door",
    narratorScript:
      "Another set phrase. 不是一家人，不进一家门 — if you're not one family, you don't enter through one door. It means people of the same kind end up together. Liu Mei twists it: she says 不像 instead of 不是, which is the joke — and for a blended family, the line lands with real weight.",
  },
  {
    id: "idiom-haoburongyi",
    anchors: ["030", "035"],
    teachAfter: "030",
    chinese: "好不容易",
    pinyin: "hǎo bù róng yì",
    english: "finally / with great difficulty",
    literal: "very not easy",
    trap:
      "It looks like 'not easy' — but 好不 here is an intensifier, so it means 'only after great effort'. It marks success, not failure.",
    narratorScript:
      "Careful with this one. 好不容易 — hǎo bù róng yì. It looks like it should mean 'not easy', but 好不 is an intensifier, and the phrase means 'finally, after great effort'. So 我好不容易快背下来了 means 'I've finally almost got it memorized' — she succeeded. Read it literally and you get the meaning backwards.",
  },
  {
    id: "idiom-yufangzhen",
    anchors: ["037"],
    teachAfter: "037",
    chinese: "打个预防针",
    pinyin: "dǎ ge yùfángzhēn",
    english: "to give someone a heads-up, to pre-warn them",
    literal: "To give someone a vaccination shot",
    trap:
      "Nothing medical is happening. 打预防针 is figurative: you warn someone early so the bad news doesn't hit as hard.",
    narratorScript:
      "Great colloquial phrase. 打个预防针 — dǎ ge yùfángzhēn. Literally, to give someone a vaccination. Figuratively, to warn someone in advance so bad news won't hit so hard. Donghai is pre-warning Liu Mei that kids' enthusiasms change fast — and he turns out to be right.",
  },
  {
    id: "idiom-xingzailehuo",
    anchors: ["179"],
    teachAfter: "179",
    chinese: "幸灾乐祸",
    pinyin: "xìng zāi lè huò",
    english: "to gloat over someone else's misfortune",
    literal: "Delight in disaster, take joy in calamity",
    narratorScript:
      "Idiom. 幸灾乐祸 — xìng zāi lè huò. To take pleasure in someone else's trouble — the German word is schadenfreude. 幸 and 乐 both mean to delight, 灾 and 祸 both mean disaster. Liu Mei accuses Donghai of exactly this while she's stuck feeding the mouse.",
  },
  {
    id: "idiom-zitaokuchi",
    anchors: ["122"],
    teachAfter: "122",
    chinese: "自讨苦吃",
    pinyin: "zì tǎo kǔ chī",
    english: "to bring trouble on yourself",
    literal: "To ask for bitterness and eat it",
    narratorScript:
      "Idiom. 自讨苦吃 — zì tǎo kǔ chī. Literally: you asked for the bitter food, now eat it. You brought this on yourself. Donghai uses it about Liu Mei hanging a mouse photo in her own bedroom to impress her stepdaughter.",
  },
  {
    id: "idiom-yanbujian",
    anchors: ["131"],
    teachAfter: "131",
    chinese: "眼不见，心不烦",
    pinyin: "yǎn bù jiàn, xīn bù fán",
    english: "Out of sight, out of mind",
    literal: "Eyes don't see it, heart isn't troubled",
    narratorScript:
      "A very common saying. 眼不见，心不烦 — yǎn bù jiàn, xīn bù fán. What the eyes don't see, the heart doesn't fret over. Out of sight, out of mind. He offers to turn off the light so she can't see the photo.",
  },
];

/* ------------------------------------------------------------------ *
 * 6. Grammar — including the 比 ladder
 * ------------------------------------------------------------------ */

export const GRAMMAR_STEPS: GrammarStep[] = [
  {
    id: "gr-bi-1",
    anchors: ["005"],
    teachAfter: "005",
    pattern: "A 比 B 都 + 形容词",
    patternPinyin: "A bǐ B dōu + adj",
    english: "A is even more [adj] than B",
    ladder: { family: "比", step: 1, of: 3 },
    example: "他们比 F1、F2、F3 都帅。",
    examplePinyin: "Tāmen bǐ F1, F2, F3 dōu shuài.",
    exampleEnglish: "They're even better looking than F1, F2, and F3.",
    drill: "Say: This one is even prettier than that one. (用 比…都)",
    drillAnswer: "这个比那个都好看。",
    narratorScript:
      "Grammar, step one of three on 比. The pattern is A 比 B 都 plus an adjective. 比 marks the comparison; 都 pushes it further — even more than. And the joke: Liu Mei thinks F4 is a numbered series, so she rates them above F1, F2, and F3.",
  },
  {
    id: "gr-bi-2",
    anchors: ["073"],
    teachAfter: "073",
    pattern: "对 A 的感情比对 B 还深",
    patternPinyin: "duì A de gǎnqíng bǐ duì B hái shēn",
    english: "feels more strongly about A than about B",
    ladder: { family: "比", step: 2, of: 3 },
    example: "对耗子的感情比对我还深呢。",
    examplePinyin: "Duì hàozi de gǎnqíng bǐ duì wǒ hái shēn ne.",
    exampleEnglish: "She cares more about that mouse than about me.",
    drill: "Say: He likes dogs more than he likes me. (用 比…还)",
    drillAnswer: "他对狗的感情比对我还深。",
    narratorScript:
      "Step two on 比. Here 还 replaces 都 — 比…还 means 'even more than', with a note of complaint. 对…的感情 means 'feelings toward'. So: her feelings for the mouse run deeper than her feelings for me. Same comparison frame, wounded tone.",
  },
  {
    id: "gr-bi-3",
    anchors: ["147", "148"],
    teachAfter: "148",
    pattern: "比较 + 形容词",
    patternPinyin: "bǐjiào + adj",
    english: "relatively / fairly [adj] — no second item compared",
    ladder: { family: "比", step: 3, of: 3 },
    example: "公老鼠一般都块头比较大。",
    examplePinyin: "Gōng lǎoshǔ yìbān dōu kuàitou bǐjiào dà.",
    exampleEnglish: "Male mice are generally on the larger side.",
    drill: "Say: This room is fairly small. (用 比较)",
    drillAnswer: "这个房间比较小。",
    narratorScript:
      "Step three, and the trap. 比较 looks like 比 but does something different — it means 'relatively' or 'fairly', and there is no second thing being compared. 块头比较大 just means 'on the big side'. So: 比 compares two things, 比较 softens one adjective. Don't mix them up.",
  },
  {
    id: "gr-buzhi-erqie",
    anchors: ["078"],
    teachAfter: "078",
    pattern: "不但不…，反而…",
    patternPinyin: "bùdàn bù…, fǎn'ér…",
    english: "not only not… but on the contrary…",
    example: "我不但不能让她知道我怕耗子。",
    examplePinyin: "Wǒ bùdàn bù néng ràng tā zhīdào wǒ pà hàozi.",
    exampleEnglish: "Not only can I not let her know I'm scared of mice…",
    drill: "Say: Not only did he not get angry, he laughed. (用 不但不…反而)",
    drillAnswer: "他不但不生气，反而笑了。",
    narratorScript:
      "Grammar note. 不但不…反而… — not only did X not happen, the opposite happened instead. 反而 is the pivot word: 'on the contrary'. Liu Mei is planning the exact reverse of her instinct — hide the fear, and use the mouse to win the girl over.",
  },
  {
    id: "gr-zhiyu",
    anchors: ["134", "175"],
    teachAfter: "134",
    pattern: "你至于吗 / 至于…吗",
    patternPinyin: "nǐ zhìyú ma",
    english: "Is it really that serious? / Aren't you overreacting?",
    example: "你至于吗。",
    examplePinyin: "Nǐ zhìyú ma.",
    exampleEnglish: "Are you serious? Isn't that a bit much?",
    drill: "Say: It's just a photo — aren't you overreacting?",
    drillAnswer: "就是一张照片，你至于吗？",
    narratorScript:
      "Very useful spoken pattern. 至于吗 — zhìyú ma. It means 'is it really worth that much fuss?' You use it when someone overreacts. 你至于吗 is dismissive and extremely common in real conversation, and you will almost never see it in a textbook dialogue.",
  },
  {
    id: "gr-fanerhui",
    anchors: ["107"],
    teachAfter: "107",
    pattern: "反而会 + 动词",
    patternPinyin: "fǎn'ér huì + verb",
    english: "would actually end up [verb]-ing — the opposite of intended",
    example: "反而会禁锢了你的想象力呀。",
    examplePinyin: "Fǎn'ér huì jìngù le nǐ de xiǎngxiànglì ya.",
    exampleEnglish: "It would actually end up limiting your imagination.",
    drill: "Say: Studying too much would actually hurt your health.",
    drillAnswer: "学得太多反而会影响你的健康。",
    narratorScript:
      "Grammar. 反而 — fǎn'ér — means 'on the contrary' or 'actually, the opposite'. You use it when a reasonable-sounding action backfires. Liu Mei argues that staring at a mouse photo every day would actually stunt the girl's imagination — a beautifully desperate argument.",
  },
];

/* ------------------------------------------------------------------ *
 * 7. Thematic vocabulary decks
 * ------------------------------------------------------------------ */

export const VOCAB_DECKS: VocabDeck[] = [
  {
    id: "deck-music",
    title: "追星 · 音乐",
    titleEn: "Pop music & fandom",
    theme: "The F4 conversation that opens the episode",
    teachAfter: "019",
    narratorScript:
      "Vocabulary review — pop music and fandom, from the opening scene. 乐队, a band. 追星族, a star chaser, a fan. 流行音乐, pop music. 首, the measure word for songs. And 帅, handsome.",
    items: [
      {
        chinese: "乐队",
        pinyin: "yuèduì",
        english: "band (music group)",
        breakdown: ["乐 yuè = music", "队 duì = team"],
        heardAt: ["006", "007"],
      },
      {
        chinese: "追星族",
        pinyin: "zhuīxīngzú",
        english: "fan, groupie — literally 'star-chasing tribe'",
        breakdown: ["追 zhuī = chase", "星 xīng = star", "族 zú = tribe"],
        heardAt: ["009"],
        note: "刘梅 calls herself a 老追星族 — a fan since way back.",
      },
      {
        chinese: "流行音乐",
        pinyin: "liúxíng yīnyuè",
        english: "pop music",
        breakdown: ["流行 liúxíng = popular", "音乐 yīnyuè = music"],
        heardAt: ["008"],
      },
      {
        chinese: "帅",
        pinyin: "shuài",
        english: "handsome, sharp-looking",
        heardAt: ["004", "005"],
      },
      {
        chinese: "首",
        pinyin: "shǒu",
        english: "measure word for songs and poems",
        heardAt: ["010", "012"],
      },
    ],
  },
  {
    id: "deck-sports",
    title: "球类运动",
    titleEn: "Ball sports",
    theme: "Donghai cramming the list of sports Xiaoxue likes",
    teachAfter: "029",
    narratorScript:
      "Vocabulary review — ball sports. Notice the pattern: almost every one ends in 球, ball. 篮球 basketball, 排球 volleyball, 网球 tennis, 足球 football, 乒乓球 ping pong. And the odd one out — 铅球, the shot put, which is why the joke lands.",
    items: [
      { chinese: "篮球", pinyin: "lánqiú", english: "basketball", heardAt: ["024", "027"] },
      { chinese: "排球", pinyin: "páiqiú", english: "volleyball", heardAt: ["021", "024", "027"] },
      { chinese: "网球", pinyin: "wǎngqiú", english: "tennis", heardAt: ["021", "027"] },
      { chinese: "足球", pinyin: "zúqiú", english: "football / soccer", heardAt: ["028"] },
      { chinese: "乒乓球", pinyin: "pīngpāngqiú", english: "ping pong, table tennis", heardAt: ["021", "028"] },
      {
        chinese: "铅球",
        pinyin: "qiānqiú",
        english: "shot put",
        heardAt: ["021", "026"],
        note: "The punchline — Donghai asks how anyone could chew a shot put.",
      },
    ],
  },
  {
    id: "deck-mouse",
    title: "耗子 · 老鼠",
    titleEn: "Mice, pets & fear",
    theme: "The central conflict — Liu Mei versus the mouse",
    teachAfter: "080",
    narratorScript:
      "Vocabulary review — the heart of this episode. 耗子 and 老鼠, both mouse: one casual, one neutral. 怕 to fear, 害怕 to be afraid. 公 male and 母 female for animals. 喂养 to raise or feed. And 争宠 — to compete for someone's affection.",
    items: [
      {
        chinese: "耗子",
        pinyin: "hàozi",
        english: "mouse (Beijing colloquial)",
        heardAt: ["041", "042", "050"],
        note: "What people actually say at home in Beijing.",
      },
      {
        chinese: "老鼠",
        pinyin: "lǎoshǔ",
        english: "mouse, rat (neutral / written)",
        heardAt: ["056", "105", "145"],
      },
      { chinese: "害怕", pinyin: "hàipà", english: "to be afraid", heardAt: ["059", "061"] },
      {
        chinese: "公 / 母",
        pinyin: "gōng / mǔ",
        english: "male / female (for animals)",
        heardAt: ["145", "148", "155"],
      },
      { chinese: "喂养", pinyin: "wèiyǎng", english: "to feed, to raise (an animal)", heardAt: ["157", "159"] },
      {
        chinese: "争宠",
        pinyin: "zhēngchǒng",
        english: "to compete for someone's favour",
        breakdown: ["争 zhēng = compete", "宠 chǒng = dote on"],
        heardAt: ["082"],
      },
    ],
  },
  {
    id: "deck-family",
    title: "家人 · 称呼",
    titleEn: "Family & how you address people",
    theme: "阿姨, 娘俩, and the emotional core of a blended family",
    teachAfter: "085",
    narratorScript:
      "Vocabulary review — family and address terms. 阿姨, auntie, which is what Xiaoxue calls her stepmother instead of mum. 娘俩, mother and child as a pair. 感情, feelings or bond. And 礼物, a gift.",
    items: [
      {
        chinese: "阿姨",
        pinyin: "āyí",
        english: "auntie — also how a child addresses a non-parent adult woman",
        heardAt: ["002", "008", "009", "010"],
        note: "Xiaoxue uses 阿姨, not 妈. That single word carries the whole show.",
      },
      {
        chinese: "娘俩",
        pinyin: "niángliǎ",
        english: "mother and child (as a pair)",
        heardAt: ["075"],
      },
      { chinese: "感情", pinyin: "gǎnqíng", english: "feelings, emotional bond", heardAt: ["073", "076"] },
      { chinese: "礼物", pinyin: "lǐwù", english: "gift, present", heardAt: ["114", "127"] },
      {
        chinese: "桥梁",
        pinyin: "qiáoliáng",
        english: "bridge (often figurative)",
        heardAt: ["076"],
        note: "感情桥梁 — an emotional bridge between them.",
      },
    ],
  },
  {
    id: "deck-colloquial",
    title: "口语 · 地道说法",
    titleEn: "Colloquial expressions",
    theme: "The everyday phrases that make this dialogue sound real",
    teachAfter: "139",
    narratorScript:
      "Vocabulary review — colloquial expressions. These are the phrases that make the dialogue sound like real speech. 一家伙, all at once. 趁早, better do it now. 干脆, might as well just. 多亏, thanks to. And 争宠, competing for affection.",
    items: [
      {
        chinese: "一家伙",
        pinyin: "yī jiāhuo",
        english: "all at once, just like that (northern colloquial)",
        heardAt: ["085"],
        note: "一下子就从「哎」变成「阿姨」了 — she went from 'hey' to 'Auntie' overnight.",
      },
      {
        chinese: "趁早",
        pinyin: "chènzǎo",
        english: "better do it now, while there's still time",
        heardAt: ["072"],
      },
      {
        chinese: "干脆",
        pinyin: "gāncuì",
        english: "might as well just… / simply",
        heardAt: ["063"],
      },
      {
        chinese: "多亏",
        pinyin: "duōkuī",
        english: "thanks to, fortunately because of",
        heardAt: ["139"],
        note: "多亏您的指点 — thanks to your guidance. Said with total sincerity, which is what makes it funny.",
      },
      {
        chinese: "拉近距离",
        pinyin: "lājìn jùlí",
        english: "to close the distance, get closer to someone",
        heardAt: ["031"],
      },
      {
        chinese: "吓死我了",
        pinyin: "xià sǐ wǒ le",
        english: "You scared me to death!",
        heardAt: ["066", "121"],
      },
    ],
  },
  {
    id: "deck-school",
    title: "作文 · 观察",
    titleEn: "Homework & observation",
    theme: "The composition assignment that starts the whole mess",
    teachAfter: "101",
    narratorScript:
      "Vocabulary review — school and observation. 作文, a composition. 描写, to describe in writing. 观察, to observe. 仔细, careful or attentive. And 想象力, imagination.",
    items: [
      { chinese: "作文", pinyin: "zuòwén", english: "composition, school essay", heardAt: ["142"] },
      { chinese: "描写", pinyin: "miáoxiě", english: "to describe (in writing)", heardAt: ["053", "055"] },
      { chinese: "观察", pinyin: "guānchá", english: "to observe", heardAt: ["099", "101", "141"] },
      { chinese: "仔细", pinyin: "zǐxì", english: "careful, meticulous", heardAt: ["099"] },
      { chinese: "想象力", pinyin: "xiǎngxiànglì", english: "imagination", heardAt: ["107"] },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * 8. Culture & period sidebars
 * ------------------------------------------------------------------ */

export const CULTURE_CARDS: CultureCard[] = [
  {
    id: "cul-ayi",
    anchors: ["002", "008", "010", "085"],
    teachAfter: "085",
    title: "阿姨",
    titlePinyin: "āyí",
    english: "Why she says 'auntie', not 'mum'",
    body:
      "阿姨 literally means auntie, and Chinese children use it for any adult woman who isn't their mother. Xiaoxue calling her stepmother 阿姨 is the quiet engine of the whole series — it marks polite distance. Donghai notices the shift in this episode: 一下子就从「哎」变成「阿姨」了 — she went from 'hey' to 'Auntie'. That's a promotion, not a demotion.",
    narratorScript:
      "Culture note. 阿姨 means auntie, and Chinese kids use it for any adult woman who isn't their mum. So when Xiaoxue calls her stepmother 阿姨 instead of 妈, that one word carries the entire show — it's polite, and it's distance. Watch how much Liu Mei works for a small upgrade in what the kids call her.",
  },
  {
    id: "cul-f4",
    anchors: ["002", "004", "005", "089"],
    teachAfter: "005",
    title: "F4",
    titlePinyin: "F4",
    english: "The boy band every 2004 teenager was obsessed with",
    body:
      "F4 were a Taiwanese boy band formed from the cast of the 2001 hit drama 流星花园 (Meteor Garden). By 2004 they were inescapable across Chinese-speaking Asia — the exact thing a teenage girl would idolise and a stepmother would pretend to know about. Liu Mei's mistake is treating F4 like a model number, so she rates them above 'F1, F2, F3'.",
    narratorScript:
      "Culture note. F4 were a Taiwanese boy band from the 2001 drama Meteor Garden, and by 2004 every teenager in Chinese-speaking Asia knew them. That's what makes Liu Mei's line funny — she treats F4 like a product number and says they're better looking than F1, F2, and F3. She's bluffing, and Xiaoxue can tell.",
  },
  {
    id: "cul-dapian",
    anchors: ["044", "046"],
    teachAfter: "046",
    title: "大片",
    titlePinyin: "dàpiàn",
    english: "'Blockbuster' — and the 2004 VCD era",
    body:
      "大片 means a big-budget blockbuster. In 2004 a family watched one by buying a VCD or DVD and crowding onto the sofa — which is exactly why the mouse scene works: everyone is squeezed together in the dark in front of one screen, with nowhere to escape.",
    narratorScript:
      "Culture note. 大片 — dàpiàn — a blockbuster. In 2004 that meant buying a disc and crowding the whole family onto one sofa. That setup is the joke engine here: everyone squeezed together in the dark, and Liu Mei with no way to escape the mouse on screen.",
  },
  {
    id: "cul-zuowen",
    anchors: ["052", "053", "097"],
    teachAfter: "053",
    title: "语文作文",
    titlePinyin: "yǔwén zuòwén",
    english: "The Chinese-class composition, and 观察 culture",
    body:
      "语文 is Chinese language class. A classic primary-school assignment is 描写一种小动物 — describe a small animal — and teachers stress 仔细观察, careful first-hand observation. Xiaoxue is following the instruction to the letter, which is how a live mouse ends up in the living room.",
    narratorScript:
      "Culture note. 语文 is Chinese language class, and describing a small animal is a classic composition assignment. Teachers push 仔细观察 — observe carefully, first-hand. Xiaoxue is being an excellent student, which is precisely why there is now a live mouse in the living room.",
  },
];
