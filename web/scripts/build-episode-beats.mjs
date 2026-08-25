#!/usr/bin/env node
/**
 * Build full EP5 dialogue beats: curated opening + screenshot extraction.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pinyin } from "pinyin-pro";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SCREENSHOTS = process.env.SCREENSHOTS_DIR || "/workspace/screenshots";
const OUT = path.join(ROOT, "src/data/ep05-beats.json");
const CURATED = path.join(ROOT, "src/data/lesson-01-beats.json");

const CREDIT_RE =
  /剧审|编剧|广编|友情演出|猫前|猫風|少女杀手|身高一米|体重|三围|与世隔绝|装傻|体育运动|周渝民|翟真景|够瘦的|^ON ON$|^2］$|^三上$|^等建宏$|^6$|^2\.$/i;

const CURATED_CUTOFF_SEC = 90; // use hand-checked beats through ~1:30

function parseTs(name) {
  const m = name.match(/^(\d+)m(\d+)s/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
}

function formatTs(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function toPinyin(text) {
  return pinyin(text, { toneType: "symbol", separator: " " });
}

function correct(raw) {
  let t = raw.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  const reps = [
    [/匢姨|河姨/g, "阿姨"],
    [/邦当然六9|那尝然了/g, "那当然了"],
    [/追垕族/g, "追星族"],
    [/喜软/g, "喜欢"],
    [/那萓/g, "那首"],
    [/帽两句/g, "唱两句"],
    [/第亠/g, "第一"],
    [/直忆2|E-F2~F3|Ff F2-R3|F1 F2 BS/g, ""],
    [/&/g, ""],
    [/小會/g, "小雪"],
    [/溶/g, "摸"],
    [/耗千/g, "耗子"],
    [/什公/g, "什么"],
    [/从徥/g, "懂得"],
    [/老園/g, "老鼠"],
    [/室于/g, "至于"],
    [/，我不但/g, "我不但"],
    [/谁質/g, "谁背"],
    [/距爱/g, "距离"],
    [/官/g, "它"],
    [/变耗子T/g, "变小耗子"],
    [/一f\s*股/g, "一般"],
    [/块比较/g, "块头比较"],
  ];
  for (const [re, rep] of reps) t = t.replace(re, rep);

  const known = {
    "来 宝贝 喝点牛奶": "来，宝贝，喝点牛奶。",
    "喜欢呢 真的": "喜欢呢，真的。",
    "我觉得吧": "我觉得吧，他们比 F1、F2、F3 都帅。",
    "那是什么乐队呀": "那是什么乐队呀？",
    "那都是些老乐队": "那都是些老乐队。",
    "阿姨 您对流行音乐的历史": "阿姨，您对流行音乐的历史还真有研究。",
    "还真有研究": null,
    "邦当然六9 阿姨是老追垕族": "那当然了，阿姨是老追星族。",
    "我就喜欢": "我就喜欢这首。",
    "你喜欢哪首歌呀": "阿姨，那您喜欢哪首歌呀？",
    "我喜软那萓要定你": "我喜欢那首《要定你》。",
    "我也喜欢这首": "我也喜欢这首。",
    "你们俩还有点臭味相投啊": "你们俩还有点臭味相投啊。",
    "那尝然了": "那当然了。",
    "这叫不像一家人不进一家门": "这叫不像一家人，不进一家门。",
    "阿姨 那您帽两句": "阿姨，那您唱两句。",
    "那第亠 句词是什么来着": "那第一句词是什么来着？",
    "第二句是什么词来": "第二句是什么词来着？",
    "爱主攻不喜欢被动": "爱主攻，不喜欢被动。",
    "我那洗衣机": "我那洗衣机怎么了？",
  };

  if (known[t] === null) return null;
  if (known[t]) return known[t];
  if (/我觉得.*都帅/.test(t)) return "我觉得吧，他们比 F1、F2、F3 都帅。";
  if (t === "F1 F2 F3" || t.length < 3) return null;
  if (!/[。！？]$/.test(t)) t += "。";
  return t;
}

function extractRaw(name) {
  return name.replace(/\.jpg$/i, "").split("_").slice(2).join("_").trim();
}

function isCredit(text, raw) {
  if (!text || text.length < 3) return true;
  if (CREDIT_RE.test(raw) || CREDIT_RE.test(text)) return true;
  if (/^（/.test(raw)) return true;
  return false;
}

function detectSpeaker(text, filename, prev) {
  if (/夏东海/.test(filename + text)) return "夏东海";
  if (/^OK|^小雨，快起来/.test(text)) return "夏雨";
  if (/^来，宝贝|^对吧，爸爸/.test(text)) return text.includes("爸爸") ? "夏雪" : "夏雨";
  if (/^阿姨，我回来|^阿姨，我买了/.test(text)) return "夏雨";

  if (
    /我们语文老师|写小老鼠|贴在我的卧室|观察真正的小老鼠|第一次送给您礼物|帮我挂起来|你来逗逗它|不会不答应|很少这样求别人|非常喜欢小动物|自己不会养|前天她还喜欢 F4|变小耗子/.test(
      text,
    ) ||
    (/^阿姨/.test(text) &&
      /F4|帅吗|哪首歌|唱两句|您怎么了|不喜欢小老鼠|懂得够多|还懂老鼠/.test(text)) ||
    (/^我/.test(text) && /喜欢那首|我们班|太俗|呢，就写/.test(text))
  )
    return "夏雪";

  if (
    /喜欢呢|F1、F2、F3|老乐队|追星族|我也喜欢这首|不像一家人|爱主攻|洗衣机|背下来|拉近距离|爱好什么|也不容易|预防针|最怕耗子|相投啊|争宠|摸下来|感情比对我|感情桥梁|喜欢耗子到喜欢|公老鼠|母老鼠|老鼠的研究|老鼠的喂养|怎么能不答应|那这个给你|我就喜欢这首|我害怕|不看了|坐这么远|干脆不看了|了解老鼠/.test(
      text,
    ) ||
    (/^那当然/.test(text) && !/你们俩/.test(text)) ||
    (/^我/.test(text) && /骚乱|暴风|主攻|了解/.test(text))
  )
    return "刘梅";

  if (
    /你们俩还有点|的确有些道理|你快帮我|给你茶|你过来拿|多好玩|耗子专家|幸灾乐祸|养耗子的活|跟我看什么关系|治不了|对，好像是|你说你喜欢这么多|谁背得下来|晚上咱吃什么|铅球|你没发现最近|共同的爱好|我说，我觉得|F40|小孩的事|只要不是我害怕/.test(
      text,
    )
  )
    return "夏东海";

  if (/太好玩了|别胡说|有这么粗|你吓死我/.test(text)) return "夏雨";

  return prev;
}

function extractFromScreenshots(minSec) {
  const files = fs
    .readdirSync(SCREENSHOTS)
    .filter((f) => f.endsWith(".jpg"))
    .sort((a, b) => parseTs(a) - parseTs(b));

  const groups = [];
  let current = null;

  for (const file of files) {
    const ts = parseTs(file);
    if (ts < minSec) continue;

    const raw = extractRaw(file);
    const text = correct(raw);
    if (!text || isCredit(text, raw)) continue;

    if (!current) {
      current = { file, text, ts };
      continue;
    }
    if (text === current.text) continue;
    if (
      (text.includes(current.text) || current.text.includes(text)) &&
      ts - current.ts < 20
    ) {
      if (text.length >= current.text.length) current = { file, text, ts };
      continue;
    }
    groups.push(current);
    current = { file, text, ts };
  }
  if (current) groups.push(current);
  return groups;
}

function main() {
  const curatedAll = JSON.parse(fs.readFileSync(CURATED, "utf8"));
  const curatedDialogue = curatedAll.filter(
    (b) => b.type === "dialogue" && parseTs(`00m${b.timestamp.replace(":", "m")}s`) < CURATED_CUTOFF_SEC ||
      (b.timestamp && parseTimestamp(b.timestamp) < CURATED_CUTOFF_SEC && b.type === "dialogue"),
  );

  function parseTimestamp(ts) {
    const [m, s] = ts.split(":").map(Number);
    return m * 60 + s;
  }

  const curated = curatedAll.filter((b) => b.type === "dialogue" && parseTimestamp(b.timestamp) <= 90);

  const autoGroups = extractFromScreenshots(91);
  let prevSpeaker = curated[curated.length - 1]?.speaker ?? null;

  const beats = [
    {
      id: "ep-intro",
      type: "title",
      timestamp: "0:00",
      durationSec: 6,
      chinese: "猫鼠之争",
      pinyin: "Māo shǔ zhī zhēng",
      english: "Cat vs. Mouse",
      speaker: null,
      source: "00m02s_001_来 宝贝 喝点牛奶.jpg",
      narratorScript:
        "Welcome to Home With Kids — 家有儿女 — Episode 5: Cat vs. Mouse. 猫鼠之争. Press play and follow every line with Chinese subtitles, pinyin, and character voices.",
    },
  ];

  let n = 1;
  for (const b of curated) {
    beats.push({
      id: String(n++).padStart(3, "0"),
      type: "dialogue",
      timestamp: b.timestamp,
      durationSec: b.durationSec ?? 4,
      chinese: b.chinese,
      pinyin: b.pinyin,
      english: b.english ?? "",
      speaker: b.speaker,
      source: b.source,
      grammar: b.grammar,
      vocab: b.vocab,
      idiom: b.idiom,
      notes: b.notes,
    });
    prevSpeaker = b.speaker;
  }

  for (const g of autoGroups) {
    const speaker = detectSpeaker(g.text, g.file, prevSpeaker);
    prevSpeaker = speaker;
    beats.push({
      id: String(n++).padStart(3, "0"),
      type: "dialogue",
      timestamp: formatTs(g.ts),
      durationSec: Math.max(3, Math.min(8, Math.ceil(g.text.length / 6))),
      chinese: g.text,
      pinyin: toPinyin(g.text),
      english: "",
      speaker,
      source: g.file,
    });
  }

  const last = autoGroups[autoGroups.length - 1] ?? { ts: 792, file: null };
  beats.push({
    id: "ep-end",
    type: "outro",
    timestamp: formatTs(last.ts),
    durationSec: 5,
    chinese: "（截图覆盖至 13:12 · 后半集待补充）",
    pinyin: "",
    english: "Screenshot coverage ends at 13:12 — second half needs source video",
    speaker: null,
    source: last.file,
    notes: "Full episode ~25 min; upload video for 13:12–25:00",
  });

  fs.writeFileSync(OUT, JSON.stringify(beats, null, 2));
  console.log(
    `Wrote ${beats.length} beats (${curated.length} curated + ${autoGroups.length} extracted)`,
  );
}

main();
