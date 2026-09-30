import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarouselCard } from "@/components/CarouselCard";
import { getByTag, getTags } from "@/lib/carousels";
import { tagHref } from "@/lib/shared";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTags().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `${decoded} 캐러셀`,
    description: `${decoded} 태그가 붙은 외국어 공부 캐러셀 모음.`,
    alternates: { canonical: tagHref(decoded) },
    openGraph: { title: `${decoded} 캐러셀`, url: tagHref(decoded) },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const carousels = getByTag(decoded);
  if (carousels.length === 0) notFound();

  return (
    <section className="pt-6">
      <p className="text-xs font-semibold text-moss">태그</p>
      <h1 className="mt-2 text-[1.75rem] font-bold leading-tight">#{decoded}</h1>
      <p className="mt-2 text-sm text-muted">{carousels.length}개의 캐러셀</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {carousels.map((carousel, index) => (
          <li key={carousel.slug}>
            <CarouselCard
              item={{
                slug: carousel.slug,
                title: carousel.title,
                date: carousel.date,
                tags: carousel.tags,
                cover: carousel.cover,
                language: carousel.language,
                priority: index < 2,
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
