import type { Metadata } from "next";
import { Disclosure } from "@/components/Disclosure";
import { BRAND_LINE, LANGUAGES, SISTER_LINKS, SITE_NAME, withUtm } from "@/lib/shared";

export const metadata: Metadata = {
  title: "소개",
  description: "나두랭귀지 캐러셀은 AI 튜터와 매일 나눈 외국어 공부 노트를 슬라이드와 글로 모아 두는 아카이브입니다.",
  alternates: { canonical: "/about" },
  openGraph: { title: "소개", url: "/about" },
};

export default function AboutPage() {
  return (
    <article className="max-w-xl pt-6">
      <p className="text-xs font-semibold text-moss">{BRAND_LINE}</p>
      <h1 className="mt-2 text-[1.75rem] font-bold leading-tight">{SITE_NAME}</h1>
      <div className="mt-4 space-y-4 text-sm leading-7 text-ink">
        <p>
          ‘나두’는 <strong>나의 모든 일상을 AI와 함께</strong>한다는 뜻입니다. 외국어 공부도 예외가 아니라서, 매일 AI 튜터와
          짧은 퀴즈와 대화를 나누고 그날 배운 것을 노트로 남깁니다.
        </p>
        <p>
          이 사이트는 그 노트를 카드뉴스로 바꿔 둔 곳입니다. {LANGUAGES.map((lang) => lang.label).join(" · ")} 다섯 언어의
          오늘의 표현, 자주 틀리는 교정 포인트, 3줄 요약을 슬라이드로 넘기고, 같은 내용을 글로도 다시 읽을 수 있습니다.
        </p>
        <p>새 공부 노트가 올라오면 날짜가 적힌 캐러셀이 하나씩 쌓입니다. 계정 없이 그냥 넘겨 보면 됩니다.</p>
      </div>
      <Disclosure className="mt-4" />
      <h2 className="mt-8 text-base font-bold">함께 보면 좋은 사이트</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {SISTER_LINKS.map((item) => (
          <li key={item.href}>
            <a href={withUtm(item.href)} target="_blank" rel="noopener noreferrer" className="text-moss underline-offset-2 hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
