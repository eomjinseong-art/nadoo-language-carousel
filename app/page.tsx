import Link from "next/link";
import { HomeExplorer } from "@/components/HomeExplorer";
import { JsonLd } from "@/components/JsonLd";
import { toCards } from "@/lib/cards";
import { getLanguageCounts, getTags, getVisibleCarousels } from "@/lib/carousels";
import { BRAND_LINE, LANGUAGES, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, languageHref } from "@/lib/shared";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default function HomePage() {
  const carousels = getVisibleCarousels();
  const tags = getTags();
  const counts = getLanguageCounts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: siteUrl(),
        description: SITE_DESCRIPTION,
        inLanguage: "ko-KR",
      },
      {
        "@type": "ItemList",
        name: "최신 외국어 캐러셀",
        itemListElement: carousels.map((carousel, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/c/${carousel.slug}`),
          name: carousel.title,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="pt-6">
        <p className="text-xs font-semibold text-moss">{BRAND_LINE}</p>
        <h1 className="mt-2 text-[1.75rem] font-bold leading-tight tracking-tight">{SITE_NAME}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          {SITE_TAGLINE}. AI 튜터와 매일 나눈 공부 노트를 카드로 넘기고, 같은 내용을 글로 다시 읽을 수 있습니다. 위 탭에서
          언어를 고르세요.
        </p>
        <ul className="mt-4 grid grid-cols-5 gap-2" aria-label="언어별 캐러셀 수">
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <Link
                href={languageHref(lang.code)}
                className="flex flex-col items-center rounded-2xl border border-line px-1 py-2 text-center"
                style={{ background: lang.soft, color: lang.accent }}
              >
                <span className="text-lg" aria-hidden="true">
                  {lang.flag}
                </span>
                <span className="mt-0.5 text-[11px] font-semibold leading-4">{lang.label}</span>
                <span className="text-[10px] text-muted">{counts.get(lang.code) ?? 0}개</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <HomeExplorer cards={toCards(carousels)} tags={tags} />
    </>
  );
}
