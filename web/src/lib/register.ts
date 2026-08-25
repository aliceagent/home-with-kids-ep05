/**
 * Rewrite a spoken line into textbook-standard Mandarin.
 *
 * Only the substitutions that actually occur in this episode — 耗子, 咱/咱俩,
 * and sentence-final 呀/呢/啊. Returns null when the line is already standard.
 */
export function textbookRewrite(chinese: string | null | undefined): string | null {
  if (!chinese?.trim()) return null;

  let next = chinese
    .replaceAll("咱俩", "我们俩")
    .replaceAll("咱", "我们")
    .replaceAll("耗子", "老鼠")
    .replaceAll("一家伙", "一下子");

  next = next.replace(/([呀呢啊])([。？！]?)$/u, "$2");
  next = next.replace(/\s{2,}/g, " ").trim();

  if (!next || next === chinese) return null;
  return next;
}
