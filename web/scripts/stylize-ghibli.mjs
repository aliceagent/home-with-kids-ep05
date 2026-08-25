#!/usr/bin/env node
/**
 * Ghibli img2img stylization for all episode screenshots via xAI Imagine API.
 * Usage: node --env-file=.env.local scripts/stylize-ghibli.mjs [--limit N] [--concurrency N]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SCREENSHOTS_DIR =
  process.env.SCREENSHOTS_DIR || "/workspace/screenshots";
const OUT_DIR =
  process.env.GHIBLI_OUT ||
  path.join(ROOT, "public/lessons/ep05/ghibli-4x3");
const LEGACY_DIR = path.join(ROOT, "public/lessons/ep05/lesson-01/ghibli-4x3");

const API_KEY = process.env.XAI_API_KEY;
const MODEL = process.env.GHIBLI_MODEL || "grok-imagine-image-2.0";
const PROMPT =
  process.env.GHIBLI_PROMPT ||
  "Transform this TV sitcom screenshot into Studio Ghibli anime illustration style. " +
  "Keep the exact same composition, camera angle, character positions, poses, props, and scene layout. " +
  "Soft watercolor backgrounds, warm natural lighting, hand-painted cel-shaded look, expressive Ghibli faces. " +
  "Remove any subtitles or on-screen text. Preserve the original 4:3 aspect ratio.";

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const concIdx = args.indexOf("--concurrency");
const concurrency = concIdx >= 0 ? parseInt(args[concIdx + 1], 10) : 2;

if (!API_KEY) {
  console.error("Missing XAI_API_KEY");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

function outPathFor(jpgName) {
  const stem = jpgName.replace(/\.jpg$/i, "");
  return path.join(OUT_DIR, `${stem}.jpg`);
}

function isDone(jpgName) {
  const stem = jpgName.replace(/\.jpg$/i, "");
  const jpg = path.join(OUT_DIR, `${stem}.jpg`);
  const png = path.join(OUT_DIR, `${stem}.png`);
  return (
    (fs.existsSync(jpg) && fs.statSync(jpg).size > 5000) ||
    (fs.existsSync(png) && fs.statSync(png).size > 5000)
  );
}

/** Copy previously generated lesson-01 Ghibli frames into episode folder */
function seedLegacy() {
  if (!fs.existsSync(LEGACY_DIR)) return;
  for (const f of fs.readdirSync(LEGACY_DIR)) {
    if (!f.endsWith(".png")) continue;
    const dest = path.join(OUT_DIR, f);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(LEGACY_DIR, f), dest);
      console.log(`seed ${f}`);
    }
  }
}

async function stylizeOne(jpgName) {
  const src = path.join(SCREENSHOTS_DIR, jpgName);
  const out = outPathFor(jpgName);
  if (isDone(jpgName)) {
    console.log(`skip ${jpgName}`);
    return;
  }

  const buf = fs.readFileSync(src);
  const b64 = buf.toString("base64");

  const res = await fetch("https://api.x.ai/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: PROMPT,
      aspect_ratio: "4:3",
      image: {
        url: `data:image/jpeg;base64,${b64}`,
        type: "image_url",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${jpgName}: ${res.status} ${err}`);
  }

  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error(`${jpgName}: no image URL in response`);

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`${jpgName}: download failed ${imgRes.status}`);
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(out, imgBuf);
  console.log(`✓ ${jpgName} → ${path.basename(out)} (${imgBuf.length} bytes)`);
}

async function pool(items, fn, n) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
}

async function main() {
  seedLegacy();

  const all = fs
    .readdirSync(SCREENSHOTS_DIR)
    .filter((f) => f.endsWith(".jpg"))
    .sort();
  const pending = all.filter((f) => !isDone(f)).slice(0, limit);

  console.log(
    `Stylizing ${pending.length} screenshots (${all.length - pending.length} already done, concurrency ${concurrency})`,
  );
  console.log(`Output: ${OUT_DIR}\n`);

  let failed = 0;
  await pool(
    pending,
    async (jpg) => {
      try {
        await stylizeOne(jpg);
      } catch (e) {
        failed++;
        console.error(`✗ ${e.message}`);
        fs.appendFileSync(
          path.join(OUT_DIR, "_errors.log"),
          `${new Date().toISOString()} ${e.message}\n`,
        );
      }
      await new Promise((r) => setTimeout(r, 400));
    },
    concurrency,
  );

  console.log(`\nDone. ${pending.length - failed}/${pending.length} succeeded.`);
  if (failed) process.exitCode = 1;
}

main();
