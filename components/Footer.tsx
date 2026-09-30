import { CoupangBanner } from "@/components/CoupangBanner";
import { Disclosure } from "@/components/Disclosure";
import { SISTER_LINKS, withUtm } from "@/lib/shared";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-line bg-card">
      <div className="mx-auto max-w-5xl px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <CoupangBanner className="mb-3" />
        <Disclosure />
        <h2 className="mt-6 text-sm font-bold">함께 보면 좋은 사이트</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {SISTER_LINKS.map((item) => (
            <li key={item.href}>
              <a href={withUtm(item.href)} target="_blank" rel="noopener noreferrer" className="text-moss underline-offset-2 hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">© 나두랭귀지 캐러셀</p>
      </div>
    </footer>
  );
}
