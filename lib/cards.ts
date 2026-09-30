import type { Carousel } from "@/lib/carousels";

export function toCards(carousels: Carousel[]) {
  return carousels.map((carousel) => ({
    slug: carousel.slug,
    title: carousel.title,
    date: carousel.date,
    tags: carousel.tags,
    cover: carousel.cover,
    language: carousel.language,
    search: [
      carousel.title,
      carousel.summary,
      carousel.caption,
      carousel.tags.join(" "),
      carousel.slides.map((slide) => slide.text).join("\n"),
    ]
      .join("\n")
      .toLowerCase(),
  }));
}
