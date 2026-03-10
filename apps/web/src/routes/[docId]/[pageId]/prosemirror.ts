import {
  colorToCss,
  createText,
  cssToColor,
  hasParagraphStyleOverrides,
  hasTextRunStyleOverrides,
  type Paragraph,
  type ParagraphStyle,
  paragraphStyle,
  type ResolvedTextStyle,
  resolveParagraphStyle,
  resolveTextRunStyle,
  type TextAlign,
  type TextNode,
  type TextRunStyle,
  textRunStyle,
  type TextStyle,
} from "@opendesigner/core";
import {
  type AttributeSpec,
  type Mark,
  type MarkSpec,
  type Node as PMNode,
  Schema,
} from "prosemirror-model";
import { EditorState, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

// -- PM attr types (null = "not set", falls back to node default) --

type TextRunAttrs = {
  fontSize: number | null;
  fontFamily: string | null;
  fontWeight: number | null;
  color: string | null;
  letterSpacing: number | null;
};

type ParagraphAttrs = {
  lineHeight: number | null;
  textAlign: TextAlign | null;
};

// -- Converters: model <-> PM attrs --

function textRunStyleToAttrs(run: TextRunStyle): TextRunAttrs {
  return {
    fontSize: run.fontSize ?? null,
    fontFamily: run.fontFamily ?? null,
    fontWeight: run.fontWeight ?? null,
    color: run.color ? colorToCss(run.color) : null,
    letterSpacing: run.letterSpacing ?? null,
  };
}

function attrsToTextRunStyle(attrs: TextRunAttrs): TextRunStyle {
  const run: TextRunStyle = {};
  if (attrs.fontSize !== null) run.fontSize = attrs.fontSize;
  if (attrs.fontFamily !== null) run.fontFamily = attrs.fontFamily;
  if (attrs.fontWeight !== null) run.fontWeight = attrs.fontWeight;
  if (attrs.color !== null) run.color = cssToColor(attrs.color);
  if (attrs.letterSpacing !== null) run.letterSpacing = attrs.letterSpacing;
  return run;
}

function paragraphStyleToAttrs(p: ParagraphStyle): ParagraphAttrs {
  return {
    textAlign: p.textAlign ?? null,
    lineHeight: p.lineHeight ?? null,
  };
}

function attrsToParagraphStyle(attrs: ParagraphAttrs): ParagraphStyle {
  const p: ParagraphStyle = {};
  if (attrs.textAlign !== null) p.textAlign = attrs.textAlign;
  if (attrs.lineHeight !== null) p.lineHeight = attrs.lineHeight;
  return p;
}

function marksToTextRunStyle(marks: readonly Mark[]): TextRunStyle {
  const mark = schema.marks.textStyle.isInSet(marks);
  if (!mark) return {};
  return attrsToTextRunStyle(mark.attrs as TextRunAttrs);
}

// -- Schema --

const textStyleMark: MarkSpec = {
  attrs: {
    fontSize: { default: null },
    fontFamily: { default: null },
    fontWeight: { default: null },
    color: { default: null },
    letterSpacing: { default: null },
  } satisfies Record<keyof TextRunAttrs, AttributeSpec>,
  toDOM(mark) {
    return [
      "span",
      { style: textRunStyle(attrsToTextRunStyle(mark.attrs as TextRunAttrs)) },
      0,
    ];
  },
};

export const schema = new Schema({
  nodes: {
    doc: {
      content: "paragraph+",
    },
    paragraph: {
      content: "text*",
      attrs: {
        textAlign: { default: null },
        lineHeight: { default: null },
      } satisfies Record<keyof ParagraphAttrs, AttributeSpec>,
      toDOM(node) {
        return [
          "p",
          {
            style: paragraphStyle(
              attrsToParagraphStyle(node.attrs as ParagraphAttrs),
            ),
          },
          0,
        ];
      },
    },
    text: { inline: true },
  },
  marks: {
    textStyle: textStyleMark,
  },
});

export const selectionHighlightPlugin = new Plugin({
  props: {
    decorations(state) {
      const { from, to, empty } = state.selection;
      if (empty) return DecorationSet.empty;
      return DecorationSet.create(state.doc, [
        Decoration.inline(from, to, {
          style:
            "background-color: color-mix(in oklch, var(--color-blue-500) 30%, transparent)",
        }),
      ]);
    },
  },
});

// -- Model <-> PM document conversion --

export function nodeToDoc(node: TextNode): PMNode {
  if (!node.content.length) {
    throw new Error(
      `Text node ${node.id} - ${node.name} must have at least one paragraph to convert to ProseMirror document!`,
    );
  }

  const pmParagraphs = node.content.map((p) => {
    const inlineContent = p.content.map((run) => {
      const marks = hasTextRunStyleOverrides(run)
        ? [schema.marks.textStyle.create(textRunStyleToAttrs(run))]
        : undefined;
      return schema.text(run.text, marks);
    });

    return schema.nodes.paragraph.create(
      paragraphStyleToAttrs(p),
      inlineContent,
    );
  });

  return schema.nodes.doc.create(null, pmParagraphs);
}

export function docToNode(doc: PMNode, base: TextNode): TextNode {
  const content: Paragraph[] = [];

  doc.forEach((child) => {
    if (child.type !== schema.nodes.paragraph) return;

    const paragraph: Paragraph = {
      ...attrsToParagraphStyle(child.attrs as ParagraphAttrs),
      content: [],
    };

    child.forEach((inline) => {
      if (!inline.isText || !inline.text) return;
      paragraph.content.push({
        text: inline.text,
        ...marksToTextRunStyle(inline.marks),
      });
    });

    content.push(paragraph);
  });

  return createText({
    id: base.id,
    name: base.name,
    content,
    textAlign: base.textAlign,
    lineHeight: base.lineHeight,
    fontSize: base.fontSize,
    fontFamily: base.fontFamily,
    fontWeight: base.fontWeight,
    color: base.color,
    letterSpacing: base.letterSpacing,
  });
}

// -- Active style (selection query) --

export function getActiveTextStyle(
  state: EditorState,
  base: TextNode,
): ResolvedTextStyle {
  const { $from, from, to, empty } = state.selection;

  if (empty) {
    const marks = state.storedMarks || $from.marks();
    return {
      ...resolveTextRunStyle([marksToTextRunStyle(marks)], base),
      ...resolveParagraphStyle(
        [attrsToParagraphStyle($from.parent.attrs as ParagraphAttrs)],
        base,
      ),
    };
  }

  const runStyles: TextRunStyle[] = [];
  const paragraphStyles: ParagraphStyle[] = [];

  state.doc.nodesBetween(from, to, (node) => {
    if (node.type === schema.nodes.paragraph) {
      paragraphStyles.push(attrsToParagraphStyle(node.attrs as ParagraphAttrs));
    }
    if (node.isText) {
      runStyles.push(marksToTextRunStyle(node.marks));
    }
  });

  return {
    ...resolveTextRunStyle(runStyles, base),
    ...resolveParagraphStyle(paragraphStyles, base),
  };
}

// -- Style mutation --

export function setTextStyle(view: EditorView, style: Partial<TextStyle>) {
  const { state } = view;
  const { $from, from, to, empty } = state.selection;
  const markType = schema.marks.textStyle;
  let tr = state.tr;

  if (hasParagraphStyleOverrides(style)) {
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type !== schema.nodes.paragraph) return;
      const existing = attrsToParagraphStyle(node.attrs as ParagraphAttrs);
      tr = tr.setNodeMarkup(
        pos,
        undefined,
        paragraphStyleToAttrs({ ...existing, ...style }),
      );
    });
  }

  if (!hasTextRunStyleOverrides(style)) {
    if (tr.docChanged) view.dispatch(tr);
    return;
  }

  if (empty) {
    const existing = marksToTextRunStyle(state.storedMarks || $from.marks());
    const merged: TextRunStyle = { ...existing, ...style };

    if (hasTextRunStyleOverrides(merged)) {
      tr = tr.addStoredMark(markType.create(textRunStyleToAttrs(merged)));
    } else {
      tr = tr.removeStoredMark(markType);
    }

    view.dispatch(tr);
    return;
  }

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) return;

    const nodeFrom = Math.max(from, pos);
    const nodeTo = Math.min(to, pos + node.nodeSize);
    const existing = marksToTextRunStyle(node.marks);
    const merged: TextRunStyle = { ...existing, ...style };

    if (hasTextRunStyleOverrides(merged)) {
      tr = tr.addMark(
        nodeFrom,
        nodeTo,
        markType.create(textRunStyleToAttrs(merged)),
      );
    } else {
      tr = tr.removeMark(nodeFrom, nodeTo, markType);
    }
  });

  view.dispatch(tr);
}
