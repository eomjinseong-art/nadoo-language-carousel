"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ViewerSlide = { src: string; alt: string };

export function CarouselViewer({ title, slides }: { title: string; slides: ViewerSlide[] }) {
  const [index, setIndex] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const regionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) return;
      if (event.key === "ArrowRight") setIndex((current) => Math.min(slides.length - 1, current + 1));
      if (event.key === "ArrowLeft") setIndex((current) => Math.max(0, current - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const go = (next: number) => setIndex(Math.max(0, Math.min(slides.length - 1, next)));

  return (
    <section
      ref={regionRef}
      aria-roledescription="carousel"
      aria-label={title}
      className="overflow-hidden rounded-3xl border border-line bg-card"
      tabIndex={0}
      onTouchStart={(event) => {
        const touch = event.changedTouches[0];
        start.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        if (!start.current) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.current.x;
        const dy = touch.clientY - start.current.y;
        start.current = null;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="relative">
        <div
          className="flex motion-reduce:transition-none transition-transform duration-300"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div key={slide.src} className="w-full shrink-0">
              <Image
                src={slide.src}
                alt={slide.alt}
                width={1080}
                height={1350}
                priority={slideIndex === 0}
                sizes="(max-width: 768px) 100vw, 640px"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="이전 슬라이드"
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-lg font-bold text-ink disabled:opacity-30"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="다음 슬라이드"
          disabled={index === slides.length - 1}
          onClick={() => go(index + 1)}
          className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-lg font-bold text-ink disabled:opacity-30"
        >
          ›
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="text-xs tabular-nums text-muted" aria-live="polite">
          {index + 1} / {slides.length}
        </p>
        <div className="flex">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`${slideIndex + 1}번 슬라이드`}
              aria-current={slideIndex === index ? "true" : undefined}
              onClick={() => go(slideIndex)}
              className="flex h-11 w-8 items-center justify-center"
            >
              <span className={`h-2 w-2 rounded-full ${slideIndex === index ? "bg-moss" : "bg-line"}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
