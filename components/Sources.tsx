import { withUtm } from "@/lib/shared";

function Inline({ text }: { text: string }) {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
  const nodes: Array<string | { label: string; href: string }> = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const href = match[2] || match[3];
    nodes.push({ label: match[1] || href, href });
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return (
    <>
      {nodes.map((node, index) =>
        typeof node === "string" ? (
          <span key={index}>{node}</span>
        ) : (
          <a
            key={index}
            href={withUtm(node.href)}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-moss underline-offset-2 hover:underline"
          >
            {node.label}
          </a>
        ),
      )}
    </>
  );
}

export function Sources({ markdown }: { markdown: string }) {
  const blocks = markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2 text-sm leading-6">
      {blocks.map((line, index) => {
        const heading = /^(#{1,3})\s+(.+)$/.exec(line);
        if (heading) {
          return (
            <h3 key={index} className="pt-2 font-semibold">
              <Inline text={heading[2]} />
            </h3>
          );
        }
        const item = /^[-*]\s+(.+)$/.exec(line);
        if (item) {
          return (
            <p key={index} className="pl-4">
              <span className="mr-2 text-muted">·</span>
              <Inline text={item[1]} />
            </p>
          );
        }
        return (
          <p key={index}>
            <Inline text={line} />
          </p>
        );
      })}
    </div>
  );
}
