import { colorToCss } from "./styles/color";
import {
  type BlendMode,
  blendModeStyle,
  opacityStyle,
  rotationStyle,
  type TextEffectLayer,
  textEffectLayersStyle,
} from "./styles/effect";
import {
  type FillLayer,
  fillLayersEquals,
  fillLayersStyle,
} from "./styles/fill";
import { type Dimensions, dimensionsStyle } from "./styles/layout";

export type TextDecoration = "none" | "underline" | "line-through";
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
export type FontStyle = "normal" | "italic";

export type RunStyle = {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: FontStyle;
  fills?: FillLayer[];
  letterSpacing?: number;
  textDecoration?: TextDecoration;
  textTransform?: TextTransform;
};

export type TextAlign = "start" | "center" | "end" | "justify";

export type ParagraphStyle = {
  textAlign?: TextAlign;
  lineHeight?: number;
};

export function effectiveRun(
  run: RunStyle,
  base: Required<RunStyle>,
): Required<RunStyle> {
  return {
    fontSize: run.fontSize ?? base.fontSize,
    fontFamily: run.fontFamily ?? base.fontFamily,
    fontWeight: run.fontWeight ?? base.fontWeight,
    fontStyle: run.fontStyle ?? base.fontStyle,
    fills: run.fills ?? base.fills,
    letterSpacing: run.letterSpacing ?? base.letterSpacing,
    textDecoration: run.textDecoration ?? base.textDecoration,
    textTransform: run.textTransform ?? base.textTransform,
  };
}

export function effectiveParagraph(
  paragraph: ParagraphStyle,
  base: Required<ParagraphStyle>,
): Required<ParagraphStyle> {
  return {
    textAlign: paragraph.textAlign ?? base.textAlign,
    lineHeight: paragraph.lineHeight ?? base.lineHeight,
  };
}

export type TextRun = {
  text: string;
} & RunStyle;

export function hasRunStyleOverrides(style: RunStyle): boolean {
  return (
    style.fontSize !== undefined ||
    style.fontFamily !== undefined ||
    style.fontWeight !== undefined ||
    style.fontStyle !== undefined ||
    style.fills !== undefined ||
    style.letterSpacing !== undefined ||
    style.textDecoration !== undefined ||
    style.textTransform !== undefined
  );
}

export function hasParagraphStyleOverrides(style: ParagraphStyle): boolean {
  return style.textAlign !== undefined || style.lineHeight !== undefined;
}

export type Paragraph = {
  content: TextRun[];
} & ParagraphStyle;

export type TypographyStyle = Required<ParagraphStyle> & Required<RunStyle>;

export type TextStyle = TypographyStyle & {
  dimensions: Dimensions;
  effects: TextEffectLayer[];
  blendMode: BlendMode;
  opacity: number;
  rotation: number;
};

export type TextNode = {
  id: string;
  name: string;
  type: "text";
  visible: boolean;
  content: Paragraph[];
} & TextStyle;

const textDefaults: Omit<TextNode, "id" | "type" | "content"> = {
  name: "Text",
  visible: true,
  textAlign: "start",
  fontSize: 16,
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontStyle: "normal",
  fills: [],
  lineHeight: 1.5,
  letterSpacing: 0,
  textDecoration: "none",
  textTransform: "none",
  effects: [],
  blendMode: "normal",
  opacity: 1,
  rotation: 0,
  dimensions: {
    width: { type: "hug" },
    height: { type: "hug" },
    minWidth: 0,
    maxWidth: "none",
    minHeight: 0,
    maxHeight: "none",
  },
};

export function applyUniformTypographyStyle(
  node: TextNode,
  style: Partial<TypographyStyle>,
): TextNode {
  const updated = { ...node, ...style };

  updated.content = node.content.map((p) => {
    const paragraph = { ...p };
    if (style.textAlign !== undefined) {
      delete paragraph.textAlign;
    }
    if (style.lineHeight !== undefined) {
      delete paragraph.lineHeight;
    }

    paragraph.content = p.content.map((run) => {
      const r = { ...run };
      if (style.fontSize !== undefined) {
        delete r.fontSize;
      }
      if (style.fontFamily !== undefined) {
        delete r.fontFamily;
      }
      if (style.fontWeight !== undefined) {
        delete r.fontWeight;
      }
      if (style.fontStyle !== undefined) {
        delete r.fontStyle;
      }
      if (style.fills !== undefined) {
        delete r.fills;
      }
      if (style.letterSpacing !== undefined) {
        delete r.letterSpacing;
      }
      if (style.textDecoration !== undefined) {
        delete r.textDecoration;
      }
      if (style.textTransform !== undefined) {
        delete r.textTransform;
      }
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

export function runStyle(run: RunStyle, base?: RunStyle) {
  const fontSize = run.fontSize ?? base?.fontSize;
  const fontFamily = run.fontFamily ?? base?.fontFamily;
  const fontWeight = run.fontWeight ?? base?.fontWeight;
  const fontStyle = run.fontStyle ?? base?.fontStyle;
  const fills = run.fills ?? base?.fills;
  const letterSpacing = run.letterSpacing ?? base?.letterSpacing;
  const textDecoration = run.textDecoration ?? base?.textDecoration;
  const textTransform = run.textTransform ?? base?.textTransform;

  const parts: string[] = [];

  if (fontSize !== undefined) {
    parts.push(`font-size: ${fontSize}px`);
  }

  if (fontFamily !== undefined) {
    parts.push(`font-family: ${fontFamily}`);
  }

  if (fontWeight !== undefined) {
    parts.push(`font-weight: ${fontWeight}`);
  }

  if (fontStyle !== undefined && fontStyle !== "normal") {
    parts.push(`font-style: ${fontStyle}`);
  }

  if (fills !== undefined) {
    if (fills.length === 0) {
      parts.push("color: transparent");
    } else if (fills.length === 1 && fills[0].fill.type === "solid") {
      parts.push(`color: ${colorToCss(fills[0].fill.color)}`);
    } else {
      parts.push(fillLayersStyle(fills));
      parts.push("-webkit-background-clip: text");
      parts.push("background-clip: text");
      parts.push("color: transparent");
    }
  }

  if (letterSpacing !== undefined) {
    parts.push(`letter-spacing: ${letterSpacing}px`);
  }

  if (textDecoration !== undefined && textDecoration !== "none") {
    parts.push(`text-decoration: ${textDecoration}`);
  }

  if (textTransform !== undefined && textTransform !== "none") {
    parts.push(`text-transform: ${textTransform}`);
  }

  return parts.join("; ");
}

export function paragraphStyle(
  paragraph: ParagraphStyle,
  base?: ParagraphStyle,
) {
  const textAlign = paragraph.textAlign ?? base?.textAlign;
  const lineHeight = paragraph.lineHeight ?? base?.lineHeight;

  const parts: string[] = [];

  if (textAlign) {
    parts.push(`text-align: ${textAlign}`);
  }

  if (lineHeight) {
    parts.push(`line-height: ${lineHeight}`);
  }

  return parts.join(";");
}

export function textStyle(style: TextStyle) {
  const parts: string[] = [
    dimensionsStyle(style.dimensions),
    textEffectLayersStyle(style.effects),
    blendModeStyle(style.blendMode),
    opacityStyle(style.opacity),
    rotationStyle(style.rotation),
  ].filter((s) => s !== "");

  return parts.join("; ");
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

  if (allSame(effAlign)) {
    next.textAlign = effAlign[0];
  }
  if (allSame(effLineHeight)) {
    next.lineHeight = effLineHeight[0];
  }

  const runs = paras.flatMap((p) => p.content);

  // If there is no text at all, don't promote run defaults (keeps defaults stable).
  const hasRuns = runs.length > 0;

  if (hasRuns) {
    const effFontSize = runs.map((r) => r.fontSize ?? node.fontSize);
    const effFontFamily = runs.map((r) => r.fontFamily ?? node.fontFamily);
    const effFontWeight = runs.map((r) => r.fontWeight ?? node.fontWeight);
    const effFontStyle = runs.map((r) => r.fontStyle ?? node.fontStyle);
    const effLetter = runs.map((r) => r.letterSpacing ?? node.letterSpacing);
    const effFills = runs.map((r) => r.fills ?? node.fills);
    const effDecoration = runs.map(
      (r) => r.textDecoration ?? node.textDecoration,
    );
    const effTransform = runs.map((r) => r.textTransform ?? node.textTransform);

    if (allSame(effFontSize)) {
      next.fontSize = effFontSize[0];
    }
    if (allSame(effFontFamily)) {
      next.fontFamily = effFontFamily[0];
    }
    if (allSame(effFontWeight)) {
      next.fontWeight = effFontWeight[0];
    }
    if (allSame(effFontStyle)) {
      next.fontStyle = effFontStyle[0];
    }
    if (allSame(effLetter)) {
      next.letterSpacing = effLetter[0];
    }
    if (allSame(effFills, fillLayersEquals)) {
      next.fills = effFills[0];
    }
    if (allSame(effDecoration)) {
      next.textDecoration = effDecoration[0];
    }
    if (allSame(effTransform)) {
      next.textTransform = effTransform[0];
    }
  }

  return next;
}

function allSame<T>(
  arr: T[],
  equalFn: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  if (arr.length <= 1) {
    return true;
  }

  const first = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (!equalFn(first, arr[i])) {
      return false;
    }
  }

  return true;
}

function stripRedundantOverrides(node: TextNode) {
  return {
    ...node,
    content: node.content.map((p) => {
      const out = { ...p };

      if (out.textAlign === node.textAlign) {
        delete out.textAlign;
      }
      if (out.lineHeight === node.lineHeight) {
        delete out.lineHeight;
      }

      // Run overrides
      out.content = p.content.map((r) => {
        const run = { ...r };

        if (run.fontSize === node.fontSize) {
          delete run.fontSize;
        }
        if (run.fontFamily === node.fontFamily) {
          delete run.fontFamily;
        }
        if (run.fontWeight === node.fontWeight) {
          delete run.fontWeight;
        }
        if (run.fontStyle === node.fontStyle) {
          delete run.fontStyle;
        }
        if (run.letterSpacing === node.letterSpacing) {
          delete run.letterSpacing;
        }
        if (run.textDecoration === node.textDecoration) {
          delete run.textDecoration;
        }
        if (run.textTransform === node.textTransform) {
          delete run.textTransform;
        }

        if (run.fills && fillLayersEquals(run.fills, node.fills)) {
          delete run.fills;
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
    if (r.text.length === 0) {
      continue;
    } // drop empties during normalization
    if (out.length === 0) {
      out.push({ ...r });
      continue;
    }
    const prev = out[out.length - 1];
    if (runStyleEquals(prev, r)) {
      prev.text += r.text;
    } else {
      out.push({ ...r });
    }
  }
  return out;
}

function runStyleEquals(a: RunStyle, b: RunStyle): boolean {
  return (
    a.fontSize === b.fontSize &&
    a.fontFamily === b.fontFamily &&
    a.fontWeight === b.fontWeight &&
    a.fontStyle === b.fontStyle &&
    a.letterSpacing === b.letterSpacing &&
    a.textDecoration === b.textDecoration &&
    a.textTransform === b.textTransform &&
    (a.fills === b.fills ||
      (a.fills !== undefined &&
        b.fills !== undefined &&
        fillLayersEquals(a.fills, b.fills)))
  );
}

export type CommonRunStyle = {
  [T in keyof RunStyle]-?: RunStyle[T] | "mixed";
};

export type CommonParagraphStyle = {
  [T in keyof ParagraphStyle]-?: ParagraphStyle[T] | "mixed";
};

export type CommonTypographyStyle = CommonRunStyle & CommonParagraphStyle;

export function commonRunStyle(
  styles: RunStyle[],
  defaults: TypographyStyle,
): CommonRunStyle {
  if (styles.length === 0) {
    return {
      fontSize: defaults.fontSize,
      fontFamily: defaults.fontFamily,
      fontWeight: defaults.fontWeight,
      fontStyle: defaults.fontStyle,
      fills: defaults.fills,
      letterSpacing: defaults.letterSpacing,
      textDecoration: defaults.textDecoration,
      textTransform: defaults.textTransform,
    };
  }

  const first = styles[0];
  const result: CommonRunStyle = {
    fontSize: first.fontSize ?? defaults.fontSize,
    fontFamily: first.fontFamily ?? defaults.fontFamily,
    fontWeight: first.fontWeight ?? defaults.fontWeight,
    fontStyle: first.fontStyle ?? defaults.fontStyle,
    fills: first.fills ?? defaults.fills,
    letterSpacing: first.letterSpacing ?? defaults.letterSpacing,
    textDecoration: first.textDecoration ?? defaults.textDecoration,
    textTransform: first.textTransform ?? defaults.textTransform,
  };

  for (let i = 1; i < styles.length; i++) {
    const s = styles[i];
    const eff = {
      fontSize: s.fontSize ?? defaults.fontSize,
      fontFamily: s.fontFamily ?? defaults.fontFamily,
      fontWeight: s.fontWeight ?? defaults.fontWeight,
      fontStyle: s.fontStyle ?? defaults.fontStyle,
      fills: s.fills ?? defaults.fills,
      letterSpacing: s.letterSpacing ?? defaults.letterSpacing,
      textDecoration: s.textDecoration ?? defaults.textDecoration,
      textTransform: s.textTransform ?? defaults.textTransform,
    };

    if (result.fontSize !== "mixed" && result.fontSize !== eff.fontSize) {
      result.fontSize = "mixed";
    }
    if (result.fontFamily !== "mixed" && result.fontFamily !== eff.fontFamily) {
      result.fontFamily = "mixed";
    }
    if (result.fontWeight !== "mixed" && result.fontWeight !== eff.fontWeight) {
      result.fontWeight = "mixed";
    }
    if (result.fontStyle !== "mixed" && result.fontStyle !== eff.fontStyle) {
      result.fontStyle = "mixed";
    }
    if (
      result.letterSpacing !== "mixed" &&
      result.letterSpacing !== eff.letterSpacing
    ) {
      result.letterSpacing = "mixed";
    }
    if (
      result.fills !== "mixed" &&
      !fillLayersEquals(result.fills, eff.fills)
    ) {
      result.fills = "mixed";
    }
    if (
      result.textDecoration !== "mixed" &&
      result.textDecoration !== eff.textDecoration
    ) {
      result.textDecoration = "mixed";
    }
    if (
      result.textTransform !== "mixed" &&
      result.textTransform !== eff.textTransform
    ) {
      result.textTransform = "mixed";
    }
  }

  return result;
}

export function commonParagraphStyle(
  styles: ParagraphStyle[],
  defaults: TypographyStyle,
): CommonParagraphStyle {
  if (styles.length === 0) {
    return {
      textAlign: defaults.textAlign,
      lineHeight: defaults.lineHeight,
    };
  }

  const first = styles[0];
  const result: CommonParagraphStyle = {
    textAlign: first.textAlign ?? defaults.textAlign,
    lineHeight: first.lineHeight ?? defaults.lineHeight,
  };

  for (let i = 1; i < styles.length; i++) {
    const s = styles[i];

    if (
      result.textAlign !== "mixed" &&
      result.textAlign !== (s.textAlign ?? defaults.textAlign)
    ) {
      result.textAlign = "mixed";
    }
    if (
      result.lineHeight !== "mixed" &&
      result.lineHeight !== (s.lineHeight ?? defaults.lineHeight)
    ) {
      result.lineHeight = "mixed";
    }
  }

  return result;
}
