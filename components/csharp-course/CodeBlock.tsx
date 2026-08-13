"use client";

import { useMemo, useState } from "react";
import type { Snippet } from "@/data/csharp-course";
import { TOKEN_CLASS, tokenize } from "@/lib/csharp-course/highlight";

export function CodeBlock({ snippet }: { snippet: Snippet }) {
  const [copied, setCopied] = useState(false);
  const language = snippet.language ?? "csharp";
  const lines = useMemo(() => tokenize(snippet.code, language), [snippet.code, language]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked (insecure origin, permissions) — the code is selectable anyway */
    }
  }

  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-violet-500/20 bg-[#12101d]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-violet-500/15 bg-violet-500/5 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-300/70">
          {snippet.caption ?? language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-violet-400/25 px-2.5 py-1 font-mono text-[11px] text-violet-200/80 transition hover:border-violet-300/60 hover:text-violet-100"
        >
          {copied ? "copied" : "copy"}
        </button>
      </figcaption>

      <div className="overflow-x-auto">
        <pre className="min-w-full p-4 font-mono text-[12.5px] leading-relaxed sm:text-[13px]">
          <code>
            {lines.map((tokens, lineIndex) => (
              <span key={lineIndex} className="block">
                {tokens.map((token, tokenIndex) => (
                  <span key={tokenIndex} className={TOKEN_CLASS[token.type]}>
                    {token.text}
                  </span>
                ))}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}
