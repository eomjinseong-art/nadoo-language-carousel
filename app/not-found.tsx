import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "없는 페이지",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="py-16">
      <p className="text-xs font-semibold text-moss">404</p>
      <h1 className="mt-2 text-2xl font-bold">이 캐러셀은 없거나 내려갔습니다</h1>
      <p className="mt-3 text-sm leading-6 text-muted">주소가 바뀌었거나, 공개 목록에서 제외된 캐러셀입니다.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-4 py-3 text-sm font-semibold text-paper">
        캐러셀 목록으로
      </Link>
    </section>
  );
}
