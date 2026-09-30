import Image from "next/image";
import Link from "next/link";
import { formatDate, languageInfo, tagHref } from "@/lib/shared";

export type CarouselCardData = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  cover: string;
  language?: string;
  priority?: boolean;
};

export function CarouselCard({ item }: { item: CarouselCardData }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card">
      <Link href={`/c/${item.slug}`} className="block">
        <Image
          src={item.cover}
          alt=""
          width={1080}
          height={1350}
          priority={item.priority}
          sizes="(max-width: 640px) 50vw, 320px"
          className="aspect-[4/5] w-full object-cover"
        />
        <div className="px-3 pt-3">
          <p className="flex items-center gap-2 text-[11px] text-muted">
            {item.language && languageInfo(item.language) ? (
              <span className="rounded-full bg-paper px-2 py-0.5 font-semibold text-moss">
                {languageInfo(item.language)?.label}
              </span>
            ) : null}
            <time dateTime={item.date}>{formatDate(item.date)}</time>
          </p>
          <h2 className="mt-1 line-clamp-3 text-sm font-semibold leading-5">{item.title}</h2>
        </div>
      </Link>
      {item.tags.length > 0 ? (
        <p className="flex flex-wrap gap-x-2 px-3 pt-2 pb-3">
          {item.tags.map((tag) => (
            <Link key={tag} href={tagHref(tag)} className="text-[11px] font-semibold text-moss">
              #{tag}
            </Link>
          ))}
        </p>
      ) : (
        <div className="h-3" />
      )}
    </article>
  );
}
