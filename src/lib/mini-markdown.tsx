import type { ReactNode } from "react";

function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-extrabold text-cocoa-900">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{p}</span>;
  });
}

export function MiniMarkdown({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (list.length > 0) {
      out.push(
        <ul key={`ul-${out.length}`} className="mt-3 space-y-2">
          {list.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed font-semibold text-cocoa-700">
              <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-coral-500" />
              <span>{inline(item.replace(/^- /, ""), `li-${out.length}-${i}`)}</span>
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  blocks.forEach((b, bi) => {
    const trimmed = b.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("- ")) {
      list.push(trimmed);
      return;
    }
    flushList();
    out.push(
      <p key={`p-${bi}`} className="mt-4 text-[15px] leading-relaxed font-semibold text-cocoa-700 first:mt-0">
        {inline(trimmed, `p-${bi}`)}
      </p>
    );
  });
  flushList();
  return <div>{out}</div>;
}
