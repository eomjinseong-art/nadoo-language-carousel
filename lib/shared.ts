export const SITE_NAME = "나두랭귀지 캐러셀";

export const SITE_DESCRIPTION =
  "나두 = 나의 모든 일상을 AI와 함께. AI 튜터와 매일 배우는 영어·일본어·스페인어·이탈리아어·러시아어 공부 노트를 카드뉴스로 — 오늘의 표현, 교정 포인트, 3줄 요약을 슬라이드로 넘겨 보세요.";

export const SITE_TAGLINE = "AI 튜터와 매일 배우는 외국어 카드";

export const BRAND_LINE = "나두 · 나의 모든 일상을 AI와 함께";

export const DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

export const UTM_SOURCE = "nadoo-language-carousel";

export const LANGUAGES = [
  { code: "en", label: "English", ko: "영어", flag: "🇺🇸", htmlLang: "en" },
  { code: "ja", label: "日本語", ko: "일본어", flag: "🇯🇵", htmlLang: "ja" },
  { code: "es", label: "Español", ko: "스페인어", flag: "🇪🇸", htmlLang: "es" },
  { code: "it", label: "Italiano", ko: "이탈리아어", flag: "🇮🇹", htmlLang: "it" },
  { code: "ru", label: "Русский", ko: "러시아어", flag: "🇷🇺", htmlLang: "ru" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function languageInfo(code: string) {
  return LANGUAGES.find((item) => item.code === code) ?? null;
}

export function languageHref(code: string) {
  return `/lang/${code}`;
}

export const NAV_LINKS = [
  { href: "/", label: "전체" },
  ...LANGUAGES.map((item) => ({ href: languageHref(item.code), label: item.label })),
] as const;

export const SISTER_LINKS = [
  { href: "https://nadoo-carousel.vercel.app", label: "나두Ai 캐러셀" },
  { href: "https://ai-tools-site-liart-one.vercel.app", label: "나두Ai 홈" },
  { href: "https://tinalinkeom.vercel.app", label: "Tina 링크 허브" },
] as const;

export function withUtm(href: string) {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return href;
    url.searchParams.set("utm_source", UTM_SOURCE);
    return url.toString();
  } catch {
    return href;
  }
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const day = `${parts.year}.${parts.month}.${parts.day}`;
  return /T\d{2}:\d{2}/.test(iso) ? `${day} ${parts.hour}:${parts.minute}` : day;
}

export function kstStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    const digits = iso.replace(/\D/g, "");
    return { day: digits.slice(0, 8) || "date", time: digits.slice(8, 12) || "0000" };
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return { day: `${parts.year}${parts.month}${parts.day}`, time: `${parts.hour}${parts.minute}` };
}

export function routeSlugFor(postSlug: string, date: string, used: Set<string>) {
  const base = postSlug.trim() || "carousel";
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  const stamp = kstStamp(date);
  const candidates = [`${base}-${stamp.day}`, `${base}-${stamp.day}-${stamp.time}`];
  for (const candidate of candidates) {
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
  let extra = 2;
  let candidate = `${base}-${stamp.day}-${stamp.time}-${extra}`;
  while (used.has(candidate)) {
    extra += 1;
    candidate = `${base}-${stamp.day}-${stamp.time}-${extra}`;
  }
  used.add(candidate);
  return candidate;
}

export function tagHref(tag: string) {
  return `/tags/${encodeURIComponent(tag)}`;
}

export function slideSrc(slug: string, image: string) {
  const file = image.split("/").pop() || image;
  return `/carousels/${slug}/${file.replace(/\.(png|jpe?g|webp)$/i, ".webp")}`;
}

