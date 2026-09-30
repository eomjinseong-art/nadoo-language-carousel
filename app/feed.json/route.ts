import { getVisibleCarousels } from "@/lib/carousels";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Public JSON feed of the latest language carousels (for hubs / aggregators).
export function GET() {
  const base = siteUrl();
  const items = getVisibleCarousels()
    .slice(0, 60)
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      date: c.date,
      language: c.language,
      tags: c.tags,
      url: `${base}/c/${c.slug}`,
      cover: `${base}${c.cover}`,
      slideCount: c.slides.length,
    }));
  return Response.json(
    { site: "나두랭귀지 캐러셀", updated: items[0]?.date ?? null, items },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    },
  );
}
