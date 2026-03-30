import {
  applyUniformTypographyStyle,
  commonParagraphStyle,
  commonRunStyle,
  type CommonTypographyStyle,
  createFrame,
  createText,
  type Document,
  effectiveRun,
  type FillLayer,
  type FontStyle,
  type FrameNode,
  hasParagraphStyleOverrides,
  hasRunStyleOverrides,
  type Node,
  type Page,
  type Paragraph,
  paragraphStyle,
  type ParagraphStyle,
  runStyle,
  type RunStyle,
  type ScreenNode,
  type Size,
  type TextAlign,
  type TextDecoration,
  type TextNode,
  type TextTransform,
  type TypographyStyle,
} from "@dashedhq/core";
import { produce } from "immer";
import { nanoid } from "nanoid";
import {
  type AttributeSpec,
  type Mark,
  type MarkSpec,
  Node as PMNode,
  Schema,
} from "prosemirror-model";
import { EditorState as PMEditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

import { clamp } from "$lib/utils";

export const [getEditorState, setEditorState] = createContext<EditorState>();

export function generateStopId() {
  return `stop_${nanoid(5)}`;
}

export function generateFillId() {
  return `fill_${nanoid(5)}`;
}

export function generateEffectId() {
  return `effect_${nanoid(5)}`;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

type Patch = {
  added: Node[];
  removed: Node[];
  updated: Record<string, { old: Node; next: Node }>;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasMeasurements = {
  boundingRect: Rect;
  clientLeft: number;
  clientTop: number;
};

export type NodeMeasurements = {
  boundingRect: Rect;
  offsetWidth: number;
  offsetHeight: number;
};

export type EditMode =
  | { type: "idle" }
  | { type: "text"; editor: { view: EditorView; state: PMEditorState } | null };

export type Selection = {
  nodeId: string;
  mode: EditMode;
} | null;

export class EditorState {
  #document: Document;
  readonly pageId: string;
  #nodes: SvelteMap<string, Node>;
  #children: string[];
  #selection = $state<Selection>(null);
  #canvasMeasurements = $state<CanvasMeasurements | null>(null);
  #nodeEl: HTMLElement | null = null;
  #nodeMeasurements = $state<NodeMeasurements | null>(null);
  #panX = $state(0);
  #panY = $state(0);
  #zoom = $state(1);
  #currentPatch: Patch | null = null;
  #undoStack = $state<Patch[]>([]);
  #redoStack = $state<Patch[]>([]);

  constructor(document: Document, page: Page) {
    this.#document = $state(document);
    this.pageId = page.id;
    this.#nodes = new SvelteMap(Object.entries(page.nodes));
    this.#children = $state(page.children);
    this.topLevelNodes = $derived(this.resolveChildren(this.#children));

    $effect(() => {
      /* eslint-disable @typescript-eslint/no-unused-expressions */
      this.#panX;
      this.#panY;
      this.#zoom;
      this.selectedNode;
      /* eslint-enable @typescript-eslint/no-unused-expressions */
      this.#measureNode();
    });
  }

  get selectedNodeId() {
    return this.#selection?.nodeId ?? null;
  }

  get editMode(): EditMode {
    return this.#selection?.mode ?? { type: "idle" };
  }

  get canvasMeasurements(): CanvasMeasurements | null {
    return this.#canvasMeasurements;
  }

  get nodeMeasurements(): NodeMeasurements | null {
    return this.#nodeMeasurements;
  }

  get document(): Document {
    return this.#document;
  }

  readonly topLevelNodes: Node[];
  readonly canUndo = $derived(this.#undoStack.length > 0);
  readonly canRedo = $derived(this.#redoStack.length > 0);
  readonly selectedNode: Node | null = $derived(
    this.#selection
      ? this.#getNodeOrDie(this.#selection.nodeId, "selectedNode")
      : null,
  );

  #getNodeOrDie(id: string, fn: string) {
    const node = this.#nodes.get(id);
    if (!node) {
      throw new Error(`${fn}: Node ${id} doesn't exist`);
    }

    return node;
  }

  getNode(id: string): Node {
    return this.#getNodeOrDie(id, "getNode");
  }

  getFrame(id: string): FrameNode {
    const node = this.getNode(id);
    if (node.type !== "frame") {
      throw new Error(`getFrame: Node ${id} is not a frame`);
    }
    return node;
  }

  getText(id: string): TextNode {
    const node = this.getNode(id);
    if (node.type !== "text") {
      throw new Error(`getText: Node ${id} is not a text`);
    }
    return node;
  }

  getScreen(id: string): ScreenNode {
    const node = this.getNode(id);
    if (node.type !== "screen") {
      throw new Error(`getScreen: Node ${id} is not a screen`);
    }
    return node;
  }

  #updateNode(id: string, fn: string, mutate: (curr: Node) => void) {
    const curr = this.#getNodeOrDie(id, fn);
    const next = produce(curr, mutate);

    if (next === curr) {
      return;
    }

    const patch = this.#currentPatch || { added: [], removed: [], updated: {} };
    const old = patch.updated[id]?.old || curr;

    patch.updated[id] = { old, next };
    this.#nodes.set(id, next);

    if (!this.#currentPatch) {
      this.#undoStack.push(patch);
      this.#redoStack = [];
    }
  }

  beginPatch() {
    this.#currentPatch = { added: [], removed: [], updated: {} };
  }

  commitPatch() {
    if (!this.#currentPatch) {
      throw new Error(`commitPatch: beginPatch must be called first`);
    }
    this.#undoStack.push(this.#currentPatch);
    this.#redoStack = [];
    this.#currentPatch = null;
  }

  undo() {
    const patch = this.#undoStack.pop();
    if (!patch) {
      return;
    }
    for (const node of patch.added) {
      this.#nodes.delete(node.id);
    }
    for (const node of patch.removed) {
      this.#nodes.set(node.id, node);
    }
    for (const [id, { old }] of Object.entries(patch.updated)) {
      this.#nodes.set(id, old);
    }
    this.#redoStack.push(patch);
  }

  redo() {
    const patch = this.#redoStack.pop();
    if (!patch) {
      return;
    }
    for (const node of patch.removed) {
      this.#nodes.delete(node.id);
    }
    for (const node of patch.added) {
      this.#nodes.set(node.id, node);
    }
    for (const [id, { next }] of Object.entries(patch.updated)) {
      this.#nodes.set(id, next);
    }
    this.#undoStack.push(patch);
  }

  resolveChildren(children: string[]) {
    return children.map((id) => this.#getNodeOrDie(id, "resolveChildren"));
  }

  #flushTextEdit() {
    if (
      !this.#selection ||
      this.#selection.mode.type !== "text" ||
      !this.#selection.mode.editor
    ) {
      return;
    }

    const pmDoc = this.#selection.mode.editor.state.doc;
    this.#updateNode(this.#selection.nodeId, "stopTextEdit", (curr) => {
      if (curr.type !== "text") {
        throw new Error("stopTextEdit: Not a text node");
      }
      return docToNode(pmDoc, curr);
    });
  }

  #setSelection(next: Selection) {
    this.#flushTextEdit();
    this.#selection = next;
  }

  selectNode(id: string) {
    if (!this.#nodes.has(id)) {
      throw new Error(`selectNode: Node ${id} doesn't exist`);
    }
    if (this.#selection?.nodeId === id) {
      return;
    }
    this.#setSelection({ nodeId: id, mode: { type: "idle" } });
  }

  registerCanvasEl(el: HTMLElement): () => void {
    const measure = () => {
      this.#canvasMeasurements = {
        boundingRect: el.getBoundingClientRect(),
        clientLeft: el.clientLeft,
        clientTop: el.clientTop,
      };
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => {
      observer.disconnect();
      this.#canvasMeasurements = null;
    };
  }

  get panX() {
    return this.#panX;
  }

  get panY() {
    return this.#panY;
  }

  get zoom() {
    return this.#zoom;
  }

  pan(dx: number, dy: number) {
    this.#panX += dx;
    this.#panY += dy;
  }

  applyZoom(pivotX: number, pivotY: number, factor: number) {
    const clamped = clamp(this.#zoom * factor, MIN_ZOOM, MAX_ZOOM);
    this.#panX = pivotX - ((pivotX - this.#panX) / this.#zoom) * clamped;
    this.#panY = pivotY - ((pivotY - this.#panY) / this.#zoom) * clamped;
    this.#zoom = clamped;
  }

  resetZoom() {
    this.#zoom = 1;
  }

  #measureNode() {
    if (this.#nodeEl) {
      this.#nodeMeasurements = {
        boundingRect: this.#nodeEl.getBoundingClientRect(),
        offsetWidth: this.#nodeEl.offsetWidth,
        offsetHeight: this.#nodeEl.offsetHeight,
      };
    }
  }

  registerSelectedNodeEl(el: HTMLElement): () => void {
    this.#nodeEl = el;
    this.#measureNode();

    const observer = new ResizeObserver(() => this.#measureNode());
    observer.observe(el);

    return () => {
      observer.disconnect();
      this.#nodeEl = null;
      this.#nodeMeasurements = null;
    };
  }

  clearNodeSelection() {
    this.#setSelection(null);
  }

  findParent(nodeId: string): Node | null {
    for (const node of this.#nodes.values()) {
      if (
        (node.type === "frame" || node.type === "screen") &&
        node.children.includes(nodeId)
      ) {
        return node;
      }
    }
    return null;
  }

  #collectDescendants(nodeId: string): Node[] {
    const node = this.#nodes.get(nodeId);
    if (!node) {
      return [];
    }
    const result: Node[] = [node];
    if (node.type === "frame" || node.type === "screen") {
      for (const childId of node.children) {
        result.push(...this.#collectDescendants(childId));
      }
    }
    return result;
  }

  deleteNode(id: string) {
    const node = this.#nodes.get(id);
    if (!node) {
      throw new Error(`deleteNode: Node ${id} doesn't exist`);
    }
    if (node.type === "screen") {
      return;
    }

    const parent = this.findParent(id);
    if (!parent) {
      return;
    }

    const removed = this.#collectDescendants(id);
    const patch: Patch = { added: [], removed, updated: {} };

    const oldParent = parent;
    const nextParent = produce(parent, (draft) => {
      if (draft.type === "frame" || draft.type === "screen") {
        draft.children = draft.children.filter((c) => c !== id);
      }
    });
    patch.updated[parent.id] = { old: oldParent, next: nextParent };
    this.#nodes.set(parent.id, nextParent);

    for (const n of removed) {
      this.#nodes.delete(n.id);
    }

    this.#undoStack.push(patch);
    this.#redoStack = [];

    if (this.#selection?.nodeId === id) {
      this.#setSelection(null);
    }
  }

  #addChildNode(parentId: string, node: Node) {
    const parent = this.#getNodeOrDie(parentId, "addChildNode");
    if (parent.type !== "frame" && parent.type !== "screen") {
      throw new Error("addChildNode: Parent must be a frame or screen");
    }

    const patch: Patch = { added: [node], removed: [], updated: {} };

    const nextParent = produce(parent, (draft) => {
      if (draft.type === "frame" || draft.type === "screen") {
        draft.children.push(node.id);
      }
    });
    patch.updated[parent.id] = { old: parent, next: nextParent };

    this.#nodes.set(node.id, node);
    this.#nodes.set(parent.id, nextParent);
    this.#undoStack.push(patch);
    this.#redoStack = [];

    this.selectNode(node.id);
  }

  addFrame(parentId: string) {
    const frame = createFrame({ id: `frame_${nanoid(5)}` });
    this.#addChildNode(parentId, frame);
  }

  addText(parentId: string) {
    const text = createText({
      id: `text_${nanoid(5)}`,
      content: [{ content: [{ text: "Text" }] }],
    });
    this.#addChildNode(parentId, text);
  }

  // -- Node property updates --

  resizeNode(id: string, size: { width?: Size; height?: Size }) {
    this.#updateNode(id, "resizeNode", (curr) => {
      if (curr.type !== "frame" && curr.type !== "text") {
        throw new Error("resizeNode: Not a frame or text node");
      }
      const d = curr.dimensions;
      if (size.width) {
        if (size.width.type === "fixed") {
          let v = size.width.value;
          if (v < d.minWidth) {
            v = d.minWidth;
          }
          if (d.maxWidth !== "none" && v > d.maxWidth) {
            v = d.maxWidth;
          }
          d.width = { type: "fixed", value: v };
        } else {
          d.width = size.width;
        }
      }
      if (size.height) {
        if (size.height.type === "fixed") {
          let v = size.height.value;
          if (v < d.minHeight) {
            v = d.minHeight;
          }
          if (d.maxHeight !== "none" && v > d.maxHeight) {
            v = d.maxHeight;
          }
          d.height = { type: "fixed", value: v };
        } else {
          d.height = size.height;
        }
      }
    });
  }

  updateFrame(id: string, mutate: (node: FrameNode) => void) {
    this.#updateNode(id, "updateFrame", (curr) => {
      if (curr.type !== "frame") {
        throw new Error("updateFrame: Not a frame node");
      }

      mutate(curr);
    });
  }

  updateText(id: string, mutate: (node: TextNode) => void) {
    this.#updateNode(id, "updateText", (curr) => {
      if (curr.type !== "text") {
        throw new Error("updateText: Not a text node");
      }

      mutate(curr);
    });
  }

  updateScreen(id: string, mutate: (node: ScreenNode) => void) {
    this.#updateNode(id, "updateScreen", (curr) => {
      if (curr.type !== "screen") {
        throw new Error("updateScreen: Not a screen node");
      }

      mutate(curr);
    });
  }

  startTextEdit() {
    if (!this.#selection) {
      throw new Error("startTextEdit: No selected node");
    }

    if (this.#selection.mode.type === "text") {
      return;
    }

    const node = this.#getNodeOrDie(this.#selection.nodeId, "startTextEdit");
    if (node.type !== "text") {
      throw new Error("startTextEdit: Not a text node");
    }

    this.#setSelection({
      nodeId: this.#selection.nodeId,
      mode: { type: "text", editor: null },
    });
  }

  registerTextEditor(view: EditorView, state: PMEditorState) {
    if (!this.#selection || this.#selection.mode.type !== "text") {
      throw new Error("registerTextEditor: Must call startTextEdit() first");
    }
    this.#selection.mode.editor = { view, state };
  }

  updateTextEditorState(editorState: PMEditorState) {
    if (
      !this.#selection ||
      this.#selection.mode.type !== "text" ||
      !this.#selection.mode.editor
    ) {
      throw new Error(
        "updateTextEditorState: Must call registerTextEditor() first",
      );
    }
    this.#selection.mode.editor.state = editorState;
  }

  stopTextEdit() {
    if (this.#selection && this.#selection.mode.type === "text") {
      this.#setSelection({
        nodeId: this.#selection.nodeId,
        mode: { type: "idle" },
      });
    }
  }

  commonTypographyStyle(id: string): CommonTypographyStyle {
    const node = this.#getNodeOrDie(id, "commonTypographyStyle");
    if (node.type !== "text") {
      throw new Error("commonTypographyStyle: Not a text node");
    }

    if (
      this.#selection &&
      this.#selection.nodeId === id &&
      this.#selection.mode.type === "text" &&
      this.#selection.mode.editor
    ) {
      return commonTypographyStyle(this.#selection.mode.editor.state, node);
    }

    return {
      textAlign: node.textAlign,
      fontSize: node.fontSize,
      fontFamily: node.fontFamily,
      fontWeight: node.fontWeight,
      fontStyle: node.fontStyle,
      fills: node.fills,
      lineHeight: node.lineHeight,
      letterSpacing: node.letterSpacing,
      textDecoration: node.textDecoration,
      textTransform: node.textTransform,
    };
  }

  applyTypographyStyle(id: string, style: Partial<TypographyStyle>) {
    if (
      this.#selection &&
      this.#selection.mode.type === "text" &&
      this.#selection.mode.editor
    ) {
      applyTypographyStyle(this.#selection.mode.editor.view, style);
      return;
    }

    this.#updateNode(id, "applyTypographyStyle", (curr) => {
      if (curr.type !== "text") {
        throw new Error("applyTypographyStyle: Not a text node");
      }

      return applyUniformTypographyStyle(curr, style);
    });
  }
}

type RunAttrs = {
  fontSize: number | null;
  fontFamily: string | null;
  fontWeight: number | null;
  fontStyle: FontStyle | null;
  fills: FillLayer[] | null;
  letterSpacing: number | null;
  textDecoration: TextDecoration | null;
  textTransform: TextTransform | null;
};

type ParagraphAttrs = {
  lineHeight: number | null;
  textAlign: TextAlign | null;
};

function runStyleToAttrs(run: RunStyle): RunAttrs {
  return {
    fontSize: run.fontSize ?? null,
    fontFamily: run.fontFamily ?? null,
    fontWeight: run.fontWeight ?? null,
    fontStyle: run.fontStyle ?? null,
    fills: run.fills ?? null,
    letterSpacing: run.letterSpacing ?? null,
    textDecoration: run.textDecoration ?? null,
    textTransform: run.textTransform ?? null,
  };
}

function attrsToRunStyle(attrs: RunAttrs) {
  const run: RunStyle = {};
  if (attrs.fontSize !== null) {
    run.fontSize = attrs.fontSize;
  }
  if (attrs.fontFamily !== null) {
    run.fontFamily = attrs.fontFamily;
  }
  if (attrs.fontWeight !== null) {
    run.fontWeight = attrs.fontWeight;
  }
  if (attrs.fontStyle !== null) {
    run.fontStyle = attrs.fontStyle;
  }
  if (attrs.fills !== null) {
    run.fills = attrs.fills;
  }
  if (attrs.letterSpacing !== null) {
    run.letterSpacing = attrs.letterSpacing;
  }
  if (attrs.textDecoration !== null) {
    run.textDecoration = attrs.textDecoration;
  }
  if (attrs.textTransform !== null) {
    run.textTransform = attrs.textTransform;
  }
  return run;
}

function paragraphStyleToAttrs(p: ParagraphStyle): ParagraphAttrs {
  return {
    textAlign: p.textAlign ?? null,
    lineHeight: p.lineHeight ?? null,
  };
}

function attrsToParagraphStyle(attrs: ParagraphAttrs) {
  const p: ParagraphStyle = {};
  if (attrs.textAlign !== null) {
    p.textAlign = attrs.textAlign;
  }
  if (attrs.lineHeight !== null) {
    p.lineHeight = attrs.lineHeight;
  }
  return p;
}

function marksToRunStyle(marks: readonly Mark[]) {
  const mark = schema.marks.textStyle.isInSet(marks);
  if (!mark) {
    return {};
  }
  return attrsToRunStyle(mark.attrs as RunAttrs);
}

// -- Schema --

const textStyleMark: MarkSpec = {
  attrs: {
    fontSize: { default: null },
    fontFamily: { default: null },
    fontWeight: { default: null },
    fontStyle: { default: null },
    fills: { default: null },
    letterSpacing: { default: null },
    textDecoration: { default: null },
    textTransform: { default: null },
  } satisfies Record<keyof RunAttrs, AttributeSpec>,
  toDOM(mark) {
    return [
      "span",
      { style: runStyle(attrsToRunStyle(mark.attrs as RunAttrs)) },
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

export function nodeToDoc(node: TextNode): PMNode {
  if (!node.content.length) {
    throw new Error(
      `Text node ${node.id} - ${node.name} must have at least one paragraph to convert to ProseMirror document!`,
    );
  }

  // Materialize each run against the node base so PM renders
  // every span with full styling (no reliance on CSS inheritance).
  const pmParagraphs = node.content.map((p) => {
    const inlineContent = p.content.map((run) => {
      const attrs = runStyleToAttrs(effectiveRun(run, node));
      return schema.text(run.text, [schema.marks.textStyle.create(attrs)]);
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
    if (child.type !== schema.nodes.paragraph) {
      return;
    }

    const paragraph: Paragraph = {
      ...attrsToParagraphStyle(child.attrs as ParagraphAttrs),
      content: [],
    };

    child.forEach((inline) => {
      if (!inline.isText || !inline.text) {
        return;
      }
      paragraph.content.push({
        text: inline.text,
        ...marksToRunStyle(inline.marks),
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
    fills: base.fills,
    letterSpacing: base.letterSpacing,
  });
}

function commonTypographyStyle(
  state: PMEditorState,
  base: TextNode,
): CommonTypographyStyle {
  const { $from: anchor, from, to, empty } = state.selection;

  if (empty) {
    const marks = state.storedMarks || anchor.marks();
    return {
      ...commonRunStyle([marksToRunStyle(marks)], base),
      ...commonParagraphStyle(
        [attrsToParagraphStyle(anchor.parent.attrs as ParagraphAttrs)],
        base,
      ),
    };
  }

  const runStyles: RunStyle[] = [];
  const paragraphStyles: ParagraphStyle[] = [];

  state.doc.nodesBetween(from, to, (node) => {
    if (node.type === schema.nodes.paragraph) {
      paragraphStyles.push(attrsToParagraphStyle(node.attrs as ParagraphAttrs));
    }
    if (node.isText) {
      runStyles.push(marksToRunStyle(node.marks));
    }
  });

  return {
    ...commonRunStyle(runStyles, base),
    ...commonParagraphStyle(paragraphStyles, base),
  };
}

function applyTypographyStyle(
  view: EditorView,
  style: Partial<TypographyStyle>,
) {
  const { state } = view;
  const { $from: anchor, from, to, empty } = state.selection;
  const markType = schema.marks.textStyle;
  let tr = state.tr;

  if (hasParagraphStyleOverrides(style)) {
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type !== schema.nodes.paragraph) {
        return;
      }
      const existing = attrsToParagraphStyle(node.attrs as ParagraphAttrs);
      tr = tr.setNodeMarkup(
        pos,
        undefined,
        paragraphStyleToAttrs({ ...existing, ...style }),
      );
    });
  }

  if (!hasRunStyleOverrides(style)) {
    if (tr.docChanged) {
      view.dispatch(tr);
    }
    return;
  }

  if (empty) {
    const existing = marksToRunStyle(state.storedMarks || anchor.marks());
    const merged: RunStyle = { ...existing, ...style };

    if (hasRunStyleOverrides(merged)) {
      tr = tr.addStoredMark(markType.create(runStyleToAttrs(merged)));
    } else {
      tr = tr.removeStoredMark(markType);
    }

    view.dispatch(tr);
    return;
  }

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) {
      return;
    }

    const nodeFrom = Math.max(from, pos);
    const nodeTo = Math.min(to, pos + node.nodeSize);
    const existing = marksToRunStyle(node.marks);
    const merged: RunStyle = { ...existing, ...style };

    if (hasRunStyleOverrides(merged)) {
      tr = tr.addMark(
        nodeFrom,
        nodeTo,
        markType.create(runStyleToAttrs(merged)),
      );
    } else {
      tr = tr.removeMark(nodeFrom, nodeTo, markType);
    }
  });

  view.dispatch(tr);
}
