import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  latex,
  displayMode = false,
  className = "",
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return `<span class="font-mono text-emerald-400">${latex}</span>`;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={`inline-block math-render text-slate-100 ${displayMode ? "my-2 overflow-x-auto max-w-full text-center" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
