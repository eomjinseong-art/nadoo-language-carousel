"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VisitCounter } from "@/components/VisitCounter";
import { NAV_LINKS } from "@/lib/shared";

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/tags/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" className="min-w-0">
          <span className="block text-[11px] font-semibold tracking-wide text-moss">나두랭귀지</span>
          <span className="block text-lg font-bold leading-none">캐러셀</span>
        </Link>
        <VisitCounter />
      </div>
      <nav aria-label="언어 선택" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
        {NAV_LINKS.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold ${
                current ? "bg-ink text-paper" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
