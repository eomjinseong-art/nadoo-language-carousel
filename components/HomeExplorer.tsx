"use client";

import { useMemo, useState } from "react";
import { CarouselCard, type CarouselCardData } from "@/components/CarouselCard";

type Card = CarouselCardData & { search: string };

export function HomeExplorer({ cards, tags }: { cards: Card[]; tags: string[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("전체");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const compact = needle.replace(/\s+/g, "");
    return cards.filter((card) => {
      const tagOk = tag === "전체" || card.tags.includes(tag);
      if (!tagOk || !needle) return tagOk;
      const hay = card.search;
      return hay.includes(needle) || hay.replace(/\s+/g, "").includes(compact);
    });
  }, [cards, query, tag]);

  return (
    <section>
      <form role="search" className="mt-4" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="carousel-search" className="text-xs font-semibold text-moss">
          캐러셀 검색
        </label>
        <input
          id="carousel-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목, 태그, 본문"
          className="mt-2 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-moss"
        />
      </form>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="toolbar" aria-label="태그">
        {["전체", ...tags].map((item) => {
          const selected = tag === item;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={selected}
              onClick={() => setTag(item)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
                selected ? "bg-moss text-paper" : "bg-card text-muted"
              }`}
            >
              {item === "전체" ? "전체" : `#${item}`}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">{filtered.length}개의 캐러셀</p>
      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-card px-4 py-8 text-center text-sm text-muted">찾는 캐러셀이 없습니다.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((card, index) => (
            <li key={card.slug}>
              <CarouselCard item={{ ...card, priority: index < 2 && !query && tag === "전체" }} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
