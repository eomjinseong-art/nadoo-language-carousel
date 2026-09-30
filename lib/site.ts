const DEFAULT_SITE_URL = "https://nadoo-language-carousel.vercel.app";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function absoluteUrl(pathname: string) {
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) return pathname;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl()}${path}`;
}
