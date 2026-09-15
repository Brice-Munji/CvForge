import { View, Text } from "@react-pdf/renderer";

/**
 * Renders a free-text description (experience / education / project body,
 * profile summary, …) with page-break behaviour that never splits a single
 * indivisible unit of content across two pages.
 *
 * How it works — the raw text is broken into blocks:
 *  - **Bullet lines** (lines beginning with •, -, *, –, · …) each become their
 *    own `<Text wrap={false}>`. react-pdf therefore moves an entire bullet to
 *    the next page rather than cutting it — even a bullet that wraps to two or
 *    three lines stays intact. Bullet points are never split across pages.
 *  - **Paragraph blocks** (runs of non-bullet lines) each become a `<Text>`
 *    with `orphans`/`widows` = 2, so a paragraph is never broken leaving a
 *    single dangling line at the bottom of one page or the top of the next. The
 *    paragraph stays together where it fits; where it genuinely cannot, it wraps
 *    cleanly at a whole-line boundary (react-pdf never divides a line of text).
 *
 * The visual result is identical to rendering the text as one `<Text>` block:
 * the container carries the original `marginTop`, individual blocks stack with
 * no extra gaps, and the same text style (font, size, colour, line-height) is
 * applied to every block. This is a pagination fix only — not a redesign.
 */

// Common bullet glyphs and leading dash/asterisk markers used in CV bodies.
const BULLET_RE = /^\s*(?:[••‣◦⁃∙‣◦·]|[-*–—])\s+/;

type Block = { type: "bullet" | "para"; content: string };

export function toDescriptionBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "para", content: para.join("\n") });
      para = [];
    }
  };

  for (const raw of lines) {
    if (!raw.trim()) {
      // Blank line ends the current paragraph but adds no empty block.
      flushPara();
      continue;
    }
    if (BULLET_RE.test(raw)) {
      flushPara();
      blocks.push({ type: "bullet", content: raw.replace(/\s+$/, "") });
    } else {
      para.push(raw.replace(/\s+$/, ""));
    }
  }
  flushPara();
  return blocks;
}

type TextStyle = Record<string, unknown> & { marginTop?: number };

export function Description({
  text,
  style,
}: {
  text: string;
  style: TextStyle;
}) {
  const blocks = toDescriptionBlocks(text);
  if (!blocks.length) return null;

  // Preserve the original block's top margin on the wrapper only, so the stacked
  // per-line <Text> elements reproduce the exact spacing of a single <Text>.
  const marginTop = typeof style.marginTop === "number" ? style.marginTop : 0;
  const lineStyle = { ...style, marginTop: 0 };

  return (
    <View style={{ marginTop }}>
      {blocks.map((b, i) =>
        b.type === "bullet" ? (
          // Indivisible: an entire bullet moves to the next page if it can't fit.
          <Text key={i} style={lineStyle} wrap={false}>
            {b.content}
          </Text>
        ) : (
          // Wrappable paragraph, but never leaves a single orphan/widow line.
          <Text key={i} style={lineStyle} orphans={2} widows={2}>
            {b.content}
          </Text>
        )
      )}
    </View>
  );
}
