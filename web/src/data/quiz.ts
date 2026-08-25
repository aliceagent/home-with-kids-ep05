export interface QuizChoice {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  promptZh?: string;
  choices: QuizChoice[];
  correctId: string;
  why: string;
}

export const EP05_QUIZ: QuizQuestion[] = [
  {
    id: "q-haozi",
    prompt: "When Liu Mei is frightened she says 耗子. What is the textbook word, and why does she switch later?",
    promptZh: "耗子",
    choices: [
      { id: "a", label: "老鼠 — same animal; 耗子 is casual Beijing speech, 老鼠 is the neutral / 'expert' word" },
      { id: "b", label: "仓鼠 — 耗子 means hamster, 老鼠 means mouse" },
      { id: "c", label: "猫咪 — she is talking about the family cat" },
      { id: "d", label: "虫子 — 耗子 is a general word for pests" },
    ],
    correctId: "a",
    why: "耗子 is what Beijing speakers say at home. When Liu Mei pretends to be a mouse specialist she switches to 老鼠 — same creature, different register.",
  },
  {
    id: "q-zan",
    prompt: "夏东海 says 晚上咱吃什么呀. What does 咱 include that 我们 might not?",
    promptZh: "咱",
    choices: [
      { id: "a", label: "Nothing — 咱 and 我们 are always interchangeable" },
      { id: "b", label: "The listener — 咱 is inclusive we; 我们 can leave the other person out" },
      { id: "c", label: "Only children — 咱 is baby talk" },
      { id: "d", label: "Only men — 咱 is a masculine pronoun" },
    ],
    correctId: "b",
    why: "咱 always includes the person you are speaking to. 咱俩 is 'the two of us'. Northern speakers reach for it constantly; textbooks barely mention it.",
  },
  {
    id: "q-haoburongyi",
    prompt: "刘梅 says 我好不容易快背下来了. What does 好不容易 mean here?",
    promptZh: "好不容易",
    choices: [
      { id: "a", label: "It was not easy, and she failed" },
      { id: "b", label: "It was easy after all" },
      { id: "c", label: "Finally / with great difficulty — she succeeded" },
      { id: "d", label: "She does not want to memorize it" },
    ],
    correctId: "c",
    why: "好不 here is an intensifier. 好不容易 marks success after effort — 'I've finally almost got it memorized.' Read it as 'not easy' and you get the meaning backwards.",
  },
  {
    id: "q-bi",
    prompt: "Which sentence uses 比较, not 比…都 / 比…还 — and what does 比较 do?",
    promptZh: "比 / 比较",
    choices: [
      { id: "a", label: "他们比 F1、F2、F3 都帅 — 比较 compares two numbered series" },
      { id: "b", label: "对耗子的感情比对我还深呢 — 比较 means 'even more than'" },
      { id: "c", label: "公老鼠一般都块头比较大 — 比较 means 'relatively / fairly', with no second item" },
      { id: "d", label: "All three use the same 比 pattern" },
    ],
    correctId: "c",
    why: "比 compares two things. 比较 softens one adjective — 'on the large side.' That is step 3 of the 比 ladder in this episode.",
  },
  {
    id: "q-ayi",
    prompt: "Why does 夏雪 call 刘梅 阿姨 instead of 妈?",
    promptZh: "阿姨",
    choices: [
      { id: "a", label: "阿姨 is the child's word for any adult woman who is not her mother — here it marks polite distance" },
      { id: "b", label: "阿姨 is Liu Mei's given name" },
      { id: "c", label: "Chinese children never call stepmothers 妈" },
      { id: "d", label: "She is talking to a different aunt who lives next door" },
    ],
    correctId: "a",
    why: "阿姨 literally means auntie, and kids use it for any adult woman who isn't mum. Xiaoxue calling her stepmother 阿姨 is the quiet engine of the series — polite, and distant. Donghai notices when it upgrades from 哎 to 阿姨.",
  },
];
