import { DISCLOSURE } from "@/lib/shared";

export function Disclosure({ className = "" }: { className?: string }) {
  return <p className={`text-[11px] leading-5 text-muted ${className}`}>{DISCLOSURE}</p>;
}
