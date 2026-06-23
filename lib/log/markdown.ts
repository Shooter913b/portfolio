export type MarkdownWrapResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export function applyMarkdownWrap(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string,
  placeholder = "text"
): MarkdownWrapResult {
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const next =
    value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  const start = selectionStart + before.length;
  const end = start + selected.length;
  return { value: next, selectionStart: start, selectionEnd: end };
}

export function applyLinePrefix(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string
): MarkdownWrapResult {
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndRaw = value.indexOf("\n", selectionEnd);
  const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const prefixed = lines
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
    .join("\n");
  const next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  const delta = prefixed.length - block.length;
  return {
    value: next,
    selectionStart: selectionStart,
    selectionEnd: selectionEnd + delta,
  };
}

export function insertMarkdownLink(
  value: string,
  selectionStart: number,
  selectionEnd: number
): MarkdownWrapResult {
  const selected = value.slice(selectionStart, selectionEnd) || "link text";
  const snippet = `[${selected}](https://)`;
  const next = value.slice(0, selectionStart) + snippet + value.slice(selectionEnd);
  const urlStart = selectionStart + selected.length + 3;
  const urlEnd = urlStart + 8;
  return { value: next, selectionStart: urlStart, selectionEnd: urlEnd };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-accent-blue underline decoration-accent-blue/40 underline-offset-2 transition-colors hover:decoration-accent-blue">$1</a>'
  );

  return html;
}

export type MarkdownBlock =
  | { type: "paragraph"; html: string }
  | { type: "heading"; level: 2 | 3; html: string }
  | { type: "list"; items: string[] }
  | { type: "blockquote"; html: string };

export function parseLogMarkdown(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const paragraphs = content.trim().split(/\n{2,}/);

  for (const paragraph of paragraphs) {
    const lines = paragraph.split("\n").map((line) => line.trimEnd());
    const nonEmpty = lines.filter((line) => line.trim().length > 0);
    if (nonEmpty.length === 0) continue;

    if (nonEmpty.every((line) => /^[-*]\s+/.test(line))) {
      blocks.push({
        type: "list",
        items: nonEmpty.map((line) => renderInline(line.replace(/^[-*]\s+/, ""))),
      });
      continue;
    }

    if (nonEmpty.every((line) => line.startsWith("> "))) {
      blocks.push({
        type: "blockquote",
        html: renderInline(nonEmpty.map((line) => line.slice(2)).join(" ")),
      });
      continue;
    }

    if (nonEmpty.length === 1) {
      const line = nonEmpty[0];
      const h3 = line.match(/^###\s+(.+)$/);
      if (h3) {
        blocks.push({ type: "heading", level: 3, html: renderInline(h3[1]) });
        continue;
      }
      const h2 = line.match(/^##\s+(.+)$/);
      if (h2) {
        blocks.push({ type: "heading", level: 2, html: renderInline(h2[1]) });
        continue;
      }
    }

    blocks.push({
      type: "paragraph",
      html: renderInline(nonEmpty.join(" ")),
    });
  }

  return blocks;
}
