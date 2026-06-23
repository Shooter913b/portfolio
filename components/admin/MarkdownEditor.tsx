"use client";

import { useRef } from "react";
import {
  applyLinePrefix,
  applyMarkdownWrap,
  insertMarkdownLink,
} from "@/lib/log/markdown";
import { cn } from "@/lib/cn";
import { TextArea } from "./AdminUi";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
};

type ToolbarAction = {
  label: string;
  title: string;
  run: (value: string, start: number, end: number) => {
    value: string;
    selectionStart: number;
    selectionEnd: number;
  };
};

const TOOLBAR: ToolbarAction[] = [
  {
    label: "B",
    title: "Bold",
    run: (value, start, end) => applyMarkdownWrap(value, start, end, "**", "**"),
  },
  {
    label: "I",
    title: "Italic",
    run: (value, start, end) => applyMarkdownWrap(value, start, end, "*", "*"),
  },
  {
    label: "Link",
    title: "Link",
    run: (value, start, end) => insertMarkdownLink(value, start, end),
  },
  {
    label: "H2",
    title: "Heading",
    run: (value, start, end) => applyLinePrefix(value, start, end, "## "),
  },
  {
    label: "•",
    title: "Bullet list",
    run: (value, start, end) => applyLinePrefix(value, start, end, "- "),
  },
  {
    label: ">",
    title: "Quote",
    run: (value, start, end) => applyLinePrefix(value, start, end, "> "),
  },
  {
    label: "</>",
    title: "Inline code",
    run: (value, start, end) => applyMarkdownWrap(value, start, end, "`", "`", "code"),
  },
];

export function MarkdownEditor({
  value,
  onChange,
  rows = 12,
  className,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runAction = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const result = action.run(value, start, end);
    onChange(result.value);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border border-white/10", className)}>
      <div
        className="flex flex-wrap gap-1 border-b border-white/10 bg-[#0d0d14] px-2 py-1.5"
        role="toolbar"
        aria-label="Formatting"
      >
        {TOOLBAR.map((action) => (
          <button
            key={action.title}
            type="button"
            title={action.title}
            onClick={() => runAction(action)}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-xs text-[#c8c8d8] transition-colors hover:bg-white/10 hover:text-white",
              action.label === "B" && "font-bold",
              action.label === "I" && "italic"
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
      <TextArea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-none border-0 focus:ring-0"
        placeholder="Write in Markdown — **bold**, *italic*, [links](url), ## headings, - lists"
      />
    </div>
  );
}
