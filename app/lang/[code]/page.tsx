import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeExplorer } from "@/components/HomeExplorer";
import { JsonLd } from "@/components/JsonLd";
import { toCards } from "@/lib/cards";
import { getByLanguage } from "@/lib/carousels";
import { BRAND_LINE, LANGUAGES, languageHref, languageInfo } from "@/lib/shared";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ code: lang.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const lang = languageInfo(code);
  if (!lang) return { title: "없는 언어", robots: { index: false, follow: false } };
  const title = `${lang.ko} 캐러셀 (${lang.label})`;
  const description = `AI 튜터와 매일 배우는 ${lang.ko} — 오늘의 표현, 교정 포인트, 3줄 요약을 카드뉴스로 넘겨 보세요.`;
  return {
    title,
    description,
    alternates: { canonical: languageHref(lang.code) },
    openGraph: { title, description, url: languageHref(lang.code) },
  };
}

export default async function LanguagePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const lang = languageInfo(code);
  if (!lang) notFound();
  const carousels = getByLanguage(lang.code);
  const tags = [...new Set(carousels.flatMap((carousel) => carousel.tags))];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${lang.ko} 캐러셀`,
    url: absoluteUrl(languageHref(lang.code)),
    inLanguage: "ko-KR",
    about: lang.label,
    hasPart: carousels.map((carousel) => ({
      "@type": "Article",
      headline: carousel.title,
      url: absoluteUrl(`/c/${carousel.slug}`),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="pt-6">
        <p className="text-xs font-semibold text-moss">{BRAND_LINE}</p>
        <h1 className="mt-2 text-[1.75rem] font-bold leading-tight tracking-tight">
          <span aria-hidden="true">{lang.flag} </span>
          {lang.label} <span className="text-lg font-semibold text-muted">· {lang.ko}</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          AI {lang.ko} 튜터와 매일 공부한 노트를 카드로 정리했습니다. 오늘의 표현과 교정 포인트를 넘겨 보며 복습하세요.
        </p>
      </section>
      {carousels.length === 0 ? (
        <div
          role="status"
          className="mt-6 rounded-2xl border px-4 py-10 text-center"
          style={{ background: lang.soft, borderColor: lang.soft }}
        >
          <p className="text-3xl" aria-hidden="true">
            {lang.flag}
          </p>
          <p className="mt-3 text-base font-bold text-ink">{lang.ko} 캐러셀을 준비하고 있어요</p>
          <p className="mt-1 text-sm leading-6 text-muted">곧 첫 공부 노트가 카드로 올라옵니다. 그때 여기서 넘겨 보세요.</p>
          <p className="mt-3 text-xs font-semibold tracking-wide" style={{ color: lang.accent }}>
            Coming soon
          </p>
        </div>
      ) : (
        <HomeExplorer cards={toCards(carousels)} tags={tags} />
      )}
    </>
  );
}
