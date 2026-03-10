import { type Color, colorEquals, colorToCss } from "./styles/color";

export type TextRunStyle = {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: Color;
  letterSpacing?: number;
};

export type TextAlign = "start" | "center" | "end" | "justify";

export type ParagraphStyle = {
  textAlign?: TextAlign;
  lineHeight?: number;
};

export type TextRun = {
  text: string;
} & TextRunStyle;

export function hasTextRunStyleOverrides(style: TextRunStyle): boolean {
  return (
    style.fontSize !== undefined ||
    style.fontFamily !== undefined ||
    style.fontWeight !== undefined ||
    style.color !== undefined ||
    style.letterSpacing !== undefined
  );
}

export function hasParagraphStyleOverrides(style: ParagraphStyle): boolean {
  return style.textAlign !== undefined || style.lineHeight !== undefined;
}

export type Paragraph = {
  content: TextRun[];
} & ParagraphStyle;

export type TextStyle = Required<ParagraphStyle> & Required<TextRunStyle>;

export type TextNode = {
  id: string;
  name: string;
  type: "text";
  content: Paragraph[];
} & TextStyle;

const textDefaults: Omit<TextNode, "id" | "type" | "content"> = {
  name: "Text",
  textAlign: "start",
  fontSize: 16,
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  color: { r: 9, g: 9, b: 11, a: 1 },
  lineHeight: 1.5,
  letterSpacing: 0,
};

export function setTextNodeStyle(
  node: TextNode,
  style: Partial<TextStyle>,
): TextNode {
  const updated = { ...node, ...style };

  updated.content = node.content.map((p) => {
    const paragraph = { ...p };
    if (style.textAlign !== undefined) delete paragraph.textAlign;
    if (style.lineHeight !== undefined) delete paragraph.lineHeight;

    paragraph.content = p.content.map((run) => {
      const r = { ...run };
      if (style.fontSize !== undefined) delete r.fontSize;
      if (style.fontFamily !== undefined) delete r.fontFamily;
      if (style.fontWeight !== undefined) delete r.fontWeight;
      if (style.color !== undefined) delete r.color;
      if (style.letterSpacing !== undefined) delete r.letterSpacing;
      return r;
    });

    return paragraph;
  });

  return updated;
}

export function createText(
  opts: Pick<TextNode, "id" | "content"> &
    Partial<Omit<TextNode, "id" | "type" | "content">>,
): TextNode {
  return normalizeTextNode({
    type: "text",
    ...textDefaults,
    ...opts,
  });
}

export function textRunStyle(style: TextRunStyle) {
  const parts: string[] = [];

  if (style.fontSize !== undefined) {
    parts.push(`font-size: ${style.fontSize}px`);
  }

  if (style.fontFamily !== undefined) {
    parts.push(`font-family: ${style.fontFamily}`);
  }

  if (style.fontWeight !== undefined) {
    parts.push(`font-weight: ${style.fontWeight}`);
  }

  if (style.color !== undefined) {
    parts.push(`color: ${colorToCss(style.color)}`);
  }

  // letter-spacing being 0 makes sense
  if (style.letterSpacing !== undefined) {
    parts.push(`letter-spacing: ${style.letterSpacing}px`);
  }

  return parts.join("; ");
}

export function paragraphStyle(style: ParagraphStyle) {
  const parts: string[] = [];

  if (style.textAlign) {
    parts.push(`text-align: ${style.textAlign}`);
  }

  if (style.lineHeight) {
    parts.push(`line-height: ${style.lineHeight}`);
  }

  return parts.join(";");
}

export function textStyle(style: TextStyle) {
  const parts: string[] = [];
  const runStyle = textRunStyle(style);
  if (runStyle) {
    parts.push(runStyle);
  }

  const paraStyle = paragraphStyle(style);
  if (paraStyle) {
    parts.push(paraStyle);
  }

  return parts.join(";");
}

export function normalizeTextNode(node: TextNode): TextNode {
  let out = promoteDefaults(node);

  // 3) strip redundant overrides that match defaults
  out = stripRedundantOverrides(out);

  // 4) merge again (stripping can create new merge opportunities)
  out = {
    ...out,
    content: out.content.map(normalizeParagraph),
  };

  return out;
}

function normalizeParagraph(p: Paragraph): Paragraph {
  return {
    ...p,
    content: mergeAdjacentTextRuns(p.content),
  };
}

function promoteDefaults(node: TextNode): TextNode {
  // Promote when all *effective* values converge.
  // Effective paragraph value: p.override ?? node.default
  // Effective run value: r.override ?? node.default

  const paras = node.content;

  const effAlign = paras.map((p) => p.textAlign ?? node.textAlign);
  const effLineHeight = paras.map((p) => p.lineHeight ?? node.lineHeight);

  const next: TextNode = { ...node };

  if (allSame(effAlign)) next.textAlign = effAlign[0];
  if (allSame(effLineHeight)) next.lineHeight = effLineHeight[0];

  const runs = paras.flatMap((p) => p.content);

  // If there is no text at all, don't promote run defaults (keeps defaults stable).
  const hasRuns = runs.length > 0;

  if (hasRuns) {
    const effFontSize = runs.map((r) => r.fontSize ?? node.fontSize);
    const effFontFamily = runs.map((r) => r.fontFamily ?? node.fontFamily);
    const effFontWeight = runs.map((r) => r.fontWeight ?? node.fontWeight);
    const effLetter = runs.map((r) => r.letterSpacing ?? node.letterSpacing);
    const effColor = runs.map((r) => r.color ?? node.color);

    if (allSame(effFontSize)) next.fontSize = effFontSize[0];
    if (allSame(effFontFamily)) next.fontFamily = effFontFamily[0];
    if (allSame(effFontWeight)) next.fontWeight = effFontWeight[0];
    if (allSame(effLetter)) next.letterSpacing = effLetter[0];
    if (allSame(effColor, colorEquals)) next.color = effColor[0];
  }

  return next;
}

function allSame<T>(
  arr: T[],
  equalFn: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  if (arr.length <= 1) return true;

  const first = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (!equalFn(first, arr[i])) return false;
  }

  return true;
}

function stripRedundantOverrides(node: TextNode) {
  return {
    ...node,
    content: node.content.map((p) => {
      const out = { ...p };

      if (out.textAlign === node.textAlign) delete out.textAlign;
      if (out.lineHeight === node.lineHeight) delete out.lineHeight;

      // Run overrides
      out.content = p.content.map((r) => {
        const run = { ...r };

        if (run.fontSize === node.fontSize) delete run.fontSize;
        if (run.fontFamily === node.fontFamily) delete run.fontFamily;
        if (run.fontWeight === node.fontWeight) delete run.fontWeight;
        if (run.letterSpacing === node.letterSpacing) delete run.letterSpacing;

        if (run.color && colorEquals(run.color, node.color)) {
          delete run.color;
        }

        return run;
      });

      return out;
    }),
  };
}

function mergeAdjacentTextRuns(runs: TextRun[]): TextRun[] {
  const out: TextRun[] = [];
  for (const r of runs) {
    if (r.text.length === 0) continue; // drop empties during normalization
    if (out.length === 0) {
      out.push({ ...r });
      continue;
    }
    const prev = out[out.length - 1];
    if (textRunStyleEquals(prev, r)) {
      prev.text += r.text;
    } else {
      out.push({ ...r });
    }
  }
  return out;
}

function textRunStyleEquals(a: TextRunStyle, b: TextRunStyle): boolean {
  return (
    a.fontSize === b.fontSize &&
    a.fontFamily === b.fontFamily &&
    a.fontWeight === b.fontWeight &&
    a.letterSpacing === b.letterSpacing &&
    (a.color === b.color ||
      (a.color !== undefined &&
        b.color !== undefined &&
        colorEquals(a.color, b.color)))
  );
}

export type ResolvedTextRunStyle = {
  [T in keyof TextRunStyle]-?: TextRunStyle[T] | "mixed";
};

export type ResolvedParagraphStyle = {
  [T in keyof ParagraphStyle]-?: ParagraphStyle[T] | "mixed";
};

export type ResolvedTextStyle = ResolvedTextRunStyle & ResolvedParagraphStyle;

export function resolveTextRunStyle(
  styles: TextRunStyle[],
  defaults: TextStyle,
): ResolvedTextRunStyle {
  if (styles.length === 0) {
    return {
      fontSize: defaults.fontSize,
      fontFamily: defaults.fontFamily,
      fontWeight: defaults.fontWeight,
      color: defaults.color,
      letterSpacing: defaults.letterSpacing,
    };
  }

  const first = styles[0];
  const result: ResolvedTextRunStyle = {
    fontSize: first.fontSize ?? defaults.fontSize,
    fontFamily: first.fontFamily ?? defaults.fontFamily,
    fontWeight: first.fontWeight ?? defaults.fontWeight,
    color: first.color ?? defaults.color,
    letterSpacing: first.letterSpacing ?? defaults.letterSpacing,
  };

  for (let i = 1; i < styles.length; i++) {
    const s = styles[i];
    const eff = {
      fontSize: s.fontSize ?? defaults.fontSize,
      fontFamily: s.fontFamily ?? defaults.fontFamily,
      fontWeight: s.fontWeight ?? defaults.fontWeight,
      color: s.color ?? defaults.color,
      letterSpacing: s.letterSpacing ?? defaults.letterSpacing,
    };

    if (result.fontSize !== "mixed" && result.fontSize !== eff.fontSize)
      result.fontSize = "mixed";
    if (result.fontFamily !== "mixed" && result.fontFamily !== eff.fontFamily)
      result.fontFamily = "mixed";
    if (result.fontWeight !== "mixed" && result.fontWeight !== eff.fontWeight)
      result.fontWeight = "mixed";
    if (result.letterSpacing !== "mixed" && result.letterSpacing !== eff.letterSpacing)
      result.letterSpacing = "mixed";
    if (result.color !== "mixed" && !colorEquals(result.color, eff.color))
      result.color = "mixed";
  }

  return result;
}

export function resolveParagraphStyle(
  styles: ParagraphStyle[],
  defaults: TextStyle,
): ResolvedParagraphStyle {
  if (styles.length === 0) {
    return {
      textAlign: defaults.textAlign,
      lineHeight: defaults.lineHeight,
    };
  }

  const first = styles[0];
  const result: ResolvedParagraphStyle = {
    textAlign: first.textAlign ?? defaults.textAlign,
    lineHeight: first.lineHeight ?? defaults.lineHeight,
  };

  for (let i = 1; i < styles.length; i++) {
    const s = styles[i];

    if (result.textAlign !== "mixed" && result.textAlign !== (s.textAlign ?? defaults.textAlign))
      result.textAlign = "mixed";
    if (result.lineHeight !== "mixed" && result.lineHeight !== (s.lineHeight ?? defaults.lineHeight))
      result.lineHeight = "mixed";
  }

  return result;
}
