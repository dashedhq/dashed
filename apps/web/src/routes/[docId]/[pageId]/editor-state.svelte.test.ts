import {
  createFrame,
  createScreen,
  createText,
  type Page,
} from "@dashedhq/core";
import { EditorState as PMEditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { EditorState, nodeToDoc, schema } from "./editor-state.svelte";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

// -- Fixtures --

function makePage(): Page {
  return {
    id: "page-1",
    name: "Test Page",
    nodes: {
      "screen-1": createScreen({
        id: "screen-1",
        fills: [
          {
            id: "sf1",
            fill: { type: "solid", color: { r: 255, g: 255, b: 255, a: 1 } },
          },
        ],
      }),
      "frame-1": createFrame({
        id: "frame-1",
        fills: [
          {
            id: "ff1",
            fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } },
          },
          {
            id: "ff2",
            fill: {
              type: "linear-gradient",
              gradient: {
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
                stops: [
                  { id: "gs1", offset: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
                  {
                    id: "gs2",
                    offset: 1,
                    color: { r: 255, g: 255, b: 255, a: 1 },
                  },
                ],
              },
            },
          },
        ],
      }),
      "text-1": createText({
        id: "text-1",
        content: [{ content: [{ text: "hello" }] }],
      }),
    },
    children: ["screen-1"],
  };
}

function makeDoc() {
  return {
    id: "doc-1",
    name: "Test Doc",
    pages: [{ id: "page-1", name: "Test Page" }],
  };
}

function makeEditor() {
  return new EditorState(makeDoc(), makePage());
}

// -- Node selection --

describe("node selection", () => {
  test("initially nothing is selected", () => {
    const editor = makeEditor();
    expect(editor.selectedNodeId).toBeNull();
    expect(editor.selectedNode).toBeNull();
  });

  test("select a node and read it back", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    expect(editor.selectedNodeId).toBe("frame-1");
    expect(editor.selectedNode).not.toBeNull();
    expect(editor.selectedNode!.type).toBe("frame");
  });

  test("selecting a non-existent node throws", () => {
    const editor = makeEditor();
    expect(() => editor.selectNode("nope")).toThrow();
  });

  test("clear selection", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.clearNodeSelection();
    expect(editor.selectedNodeId).toBeNull();
    expect(editor.selectedNode).toBeNull();
  });

  test("selecting a new node clears gradient edit", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectNode("screen-1");
    expect(editor.gradientEdit).toBeNull();
  });

  test("selecting a new node clears gradient stop selection", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectGradientStop("gs1");
    editor.selectNode("screen-1");
    expect(editor.gradientEdit).toBeNull();
  });

  test("clearing selection cascades to gradient edit and stop", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectGradientStop("gs1");
    editor.clearNodeSelection();
    expect(editor.gradientEdit).toBeNull();
  });

  test("selecting a node clears selectedNodeBounds", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.registerSelectedNodeEl(document.createElement("div"));
    expect(editor.selectedNodeBounds).not.toBeNull();

    editor.selectNode("screen-1");
    expect(editor.selectedNodeBounds).toBeNull();
  });

  test("clearing selection clears selectedNodeBounds", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.registerSelectedNodeEl(document.createElement("div"));

    editor.clearNodeSelection();
    expect(editor.selectedNodeBounds).toBeNull();
  });

  test("registerSelectedNodeEl sets selectedNodeBounds", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    const el = document.createElement("div");
    editor.registerSelectedNodeEl(el);
    expect(editor.selectedNodeBounds).not.toBeNull();
  });
});

// -- Fill editing --

describe("gradient editing", () => {
  test("start and stop editing a gradient", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    expect(editor.gradientEdit?.fillId).toBe("ff2");

    editor.stopGradientEdit();
    expect(editor.gradientEdit).toBeNull();
  });

  test("starting gradient edit without a selected node throws", () => {
    const editor = makeEditor();
    expect(() => editor.startGradientEdit("ff2")).toThrow();
  });

  test("starting gradient edit with a non-existent fill throws", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    expect(() => editor.startGradientEdit("nope")).toThrow();
  });

  test("starting gradient edit on a solid fill throws", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    expect(() => editor.startGradientEdit("ff1")).toThrow();
  });

  test("no gradient being edited returns null", () => {
    const editor = makeEditor();
    expect(editor.gradientEdit).toBeNull();
    editor.selectNode("frame-1");
    expect(editor.gradientEdit).toBeNull();
  });

  test("stopping gradient edit clears stop selection", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectGradientStop("gs1");
    editor.stopGradientEdit();
    expect(editor.gradientEdit).toBeNull();
  });

  test("starting gradient edit stops text edit", () => {
    const editor = makeEditor();
    const mountEl = document.createElement("div");
    document.body.appendChild(mountEl);
    const pmState = PMEditorState.create({ schema });
    const pmView = new EditorView(mountEl, { state: pmState });

    editor.selectNode("text-1");
    editor.startTextEdit(pmView, pmState);

    // selectNode triggers stopTextEdit (converts PM doc back)
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    expect(editor.gradientEdit?.fillId).toBe("ff2");
    // stopTextEdit created an undo entry
    expect(editor.canUndo).toBe(true);

    pmView.destroy();
    mountEl.remove();
  });
});

// -- Gradient stop selection --

describe("gradient stop selection", () => {
  test("select and read a gradient stop", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectGradientStop("gs1");
    expect(editor.gradientEdit?.selectedStopId).toBe("gs1");
    expect(editor.selectedGradientStop).not.toBeNull();
    expect(editor.selectedGradientStop!.offset).toBe(0);
  });

  test("no stop selected returns null", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    expect(editor.selectedGradientStop).toBeNull();
  });

  test("selecting stop without gradient edit throws", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    expect(() => editor.selectGradientStop("gs1")).toThrow();
  });

  test("selecting a non-existent stop throws", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    expect(() => editor.selectGradientStop("nope")).toThrow();
  });

  test("clear gradient stop selection", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectGradientStop("gs1");
    editor.clearGradientStopSelection();
    expect(editor.gradientEdit?.selectedStopId).toBeNull();
  });
});

// -- Text editing --

describe("text editing", () => {
  let pmState: PMEditorState;
  let pmView: EditorView;
  let mountEl: HTMLDivElement;

  function createPMEditor() {
    const state = PMEditorState.create({ schema });
    const el = document.createElement("div");
    document.body.appendChild(el);
    const view = new EditorView(el, { state });
    return { view, state, el };
  }

  beforeEach(() => {
    const pm = createPMEditor();
    pmState = pm.state;
    pmView = pm.view;
    mountEl = pm.el;
    return () => {
      pmView.destroy();
      mountEl.remove();
    };
  });

  test("start and stop text edit", () => {
    const editor = makeEditor();
    editor.selectNode("text-1");
    editor.startTextEdit(pmView, pmState);

    editor.stopTextEdit();
    // stopTextEdit converts PM doc back to node — should not throw
    expect(editor.canUndo).toBe(true);
  });

  test("startTextEdit requires a selected node", () => {
    const editor = makeEditor();
    expect(() => editor.startTextEdit(pmView, pmState)).toThrow();
  });

  test("starting text edit stops gradient edit", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");

    editor.selectNode("text-1");
    editor.startTextEdit(pmView, pmState);
    expect(editor.gradientEdit).toBeNull();
  });

  test("updateTextEditorState requires active text edit", () => {
    const editor = makeEditor();
    expect(() => editor.updateTextEditorState(pmState)).toThrow();
  });

  test("update text editor state", () => {
    const editor = makeEditor();
    editor.selectNode("text-1");
    editor.startTextEdit(pmView, pmState);

    const newState = PMEditorState.create({ schema });
    editor.updateTextEditorState(newState);
    // No public getter to verify, but should not throw
  });

  test("stopTextEdit is a no-op without active text edit", () => {
    const editor = makeEditor();
    editor.stopTextEdit(); // should not throw
    expect(editor.canUndo).toBe(false);
  });

  test("stopTextEdit is a no-op when called after already stopped", () => {
    const editor = makeEditor();
    editor.selectNode("text-1");
    editor.startTextEdit(pmView, pmState);
    editor.stopTextEdit();
    editor.stopTextEdit(); // second call is a no-op
    expect(editor.canUndo).toBe(true);
  });

  test("stopTextEdit creates an undo entry", () => {
    const editor = makeEditor();
    editor.selectNode("text-1");
    editor.startTextEdit(pmView, pmState);
    editor.stopTextEdit();
    expect(editor.canUndo).toBe(true);
  });

  test("stopTextEdit undo restores original text node", () => {
    const editor = makeEditor();
    const originalNode = editor.getText("text-1");
    editor.selectNode("text-1");
    editor.startTextEdit(pmView, pmState);
    editor.stopTextEdit();

    editor.undo();
    const restored = editor.getText("text-1");
    expect(restored.id).toBe(originalNode.id);
  });
});

// -- Typography style --

describe("typography style", () => {
  function startEditing(editor: EditorState) {
    const textNode = editor.getText("text-1");
    const doc = nodeToDoc(textNode);
    const state = PMEditorState.create({ schema, doc });
    const el = document.createElement("div");
    document.body.appendChild(el);
    const view = new EditorView(el, { state });

    editor.selectNode("text-1");
    editor.startTextEdit(view, state);

    return {
      view,
      cleanup: () => {
        view.destroy();
        el.remove();
      },
      selectAll: () => {
        const tr = view.state.tr.setSelection(
          TextSelection.create(
            view.state.doc,
            1,
            view.state.doc.content.size - 1,
          ),
        );
        view.dispatch(tr);
        editor.updateTextEditorState(view.state);
      },
      cursorAtStart: () => {
        const tr = view.state.tr.setSelection(
          TextSelection.create(view.state.doc, 1),
        );
        view.dispatch(tr);
        editor.updateTextEditorState(view.state);
      },
    };
  }

  // -- resolveTypographyStyle --

  test("returns node defaults when not text editing", () => {
    const editor = makeEditor();
    const style = editor.resolveTypographyStyle("text-1");
    expect(style.fontSize).toBe(16);
    expect(style.fontFamily).toBe("Inter, sans-serif");
    expect(style.fontWeight).toBe(400);
    expect(style.textAlign).toBe("start");
    expect(style.lineHeight).toBe(1.5);
    expect(style.letterSpacing).toBe(0);
  });

  test("throws for non-text node", () => {
    const editor = makeEditor();
    expect(() => editor.resolveTypographyStyle("frame-1")).toThrow();
  });

  test("resolves defaults from PM state at cursor with no marks", () => {
    const editor = makeEditor();
    const { cleanup, cursorAtStart } = startEditing(editor);
    cursorAtStart();

    const style = editor.resolveTypographyStyle("text-1");
    expect(style.fontSize).toBe(16);
    expect(style.fontWeight).toBe(400);

    cleanup();
  });

  test("resolves stored marks at collapsed cursor after applying style", () => {
    const editor = makeEditor();
    const { view, cleanup, cursorAtStart } = startEditing(editor);
    cursorAtStart();

    editor.applyTypographyStyle("text-1", { fontSize: 24 });
    editor.updateTextEditorState(view.state);

    const style = editor.resolveTypographyStyle("text-1");
    expect(style.fontSize).toBe(24);

    cleanup();
  });

  test("resolves uniform style across selection", () => {
    const editor = makeEditor();
    const { view, cleanup, selectAll } = startEditing(editor);
    selectAll();

    editor.applyTypographyStyle("text-1", { fontWeight: 700 });
    editor.updateTextEditorState(view.state);
    selectAll();

    const style = editor.resolveTypographyStyle("text-1");
    expect(style.fontWeight).toBe(700);

    cleanup();
  });

  // -- applyTypographyStyle without PM --

  test("applies uniform style to node when not text editing", () => {
    const editor = makeEditor();
    editor.applyTypographyStyle("text-1", { fontSize: 24 });
    expect(editor.getText("text-1").fontSize).toBe(24);
  });

  test("applies multiple properties when not text editing", () => {
    const editor = makeEditor();
    editor.applyTypographyStyle("text-1", {
      fontSize: 32,
      fontWeight: 700,
      textAlign: "center",
    });
    const node = editor.getText("text-1");
    expect(node.fontSize).toBe(32);
    expect(node.fontWeight).toBe(700);
    expect(node.textAlign).toBe("center");
  });

  test("throws for non-text node when not text editing", () => {
    const editor = makeEditor();
    expect(() =>
      editor.applyTypographyStyle("frame-1", { fontSize: 24 }),
    ).toThrow();
  });

  test("apply without editing creates undo entry", () => {
    const editor = makeEditor();
    editor.applyTypographyStyle("text-1", { fontSize: 24 });
    expect(editor.canUndo).toBe(true);

    editor.undo();
    expect(editor.getText("text-1").fontSize).toBe(16);
  });

  // -- applyTypographyStyle with PM --

  test("does not modify node directly when text editing", () => {
    const editor = makeEditor();
    const { cleanup, selectAll } = startEditing(editor);
    selectAll();

    editor.applyTypographyStyle("text-1", { fontSize: 24 });
    expect(editor.getText("text-1").fontSize).toBe(16);

    cleanup();
  });

  test("applied PM fontWeight persists after stopTextEdit", () => {
    const editor = makeEditor();
    const { view, cleanup, selectAll } = startEditing(editor);
    selectAll();

    editor.applyTypographyStyle("text-1", { fontWeight: 700 });
    editor.updateTextEditorState(view.state);
    editor.stopTextEdit();

    // normalizeTextNode promotes uniform run style to node level
    const node = editor.getText("text-1");
    expect(node.fontWeight).toBe(700);

    cleanup();
  });

  test("applied PM fontSize persists after stopTextEdit", () => {
    const editor = makeEditor();
    const { view, cleanup, selectAll } = startEditing(editor);
    selectAll();

    editor.applyTypographyStyle("text-1", { fontSize: 32 });
    editor.updateTextEditorState(view.state);
    editor.stopTextEdit();

    // normalizeTextNode promotes uniform run style to node level
    const node = editor.getText("text-1");
    expect(node.fontSize).toBe(32);

    cleanup();
  });

  test("undo after stopTextEdit restores original node", () => {
    const editor = makeEditor();
    const original = editor.getText("text-1");
    const { view, cleanup, selectAll } = startEditing(editor);
    selectAll();

    editor.applyTypographyStyle("text-1", { fontSize: 48 });
    editor.updateTextEditorState(view.state);
    editor.stopTextEdit();

    editor.undo();
    const restored = editor.getText("text-1");
    expect(restored.fontSize).toBe(original.fontSize);
    expect(restored.content[0].content[0].text).toBe("hello");

    cleanup();
  });

  // -- paragraph style --

  test("applies textAlign via PM and persists after stop", () => {
    const editor = makeEditor();
    const { view, cleanup, cursorAtStart } = startEditing(editor);
    cursorAtStart();

    editor.applyTypographyStyle("text-1", { textAlign: "center" });
    editor.updateTextEditorState(view.state);
    editor.stopTextEdit();

    const node = editor.getText("text-1");
    // Paragraph-level style should be promoted to node level by normalizeTextNode
    expect(node.textAlign).toBe("center");

    cleanup();
  });
});

// -- Fill layer CRUD --

describe("fill layer operations", () => {
  test("add a fill layer and get it back", () => {
    const editor = makeEditor();
    const added = editor.addFillLayer("frame-1", {
      type: "solid",
      color: { r: 0, g: 0, b: 0, a: 1 },
    });
    expect(added.id).toBeDefined();
    expect(added.fill.type).toBe("solid");

    const frame = editor.getFrame("frame-1");
    expect(frame.fills.find((l) => l.id === added.id)).toBeDefined();
  });

  test("add generates unique ids", () => {
    const editor = makeEditor();
    const a = editor.addFillLayer("frame-1", {
      type: "solid",
      color: { r: 0, g: 0, b: 0, a: 1 },
    });
    const b = editor.addFillLayer("frame-1", {
      type: "solid",
      color: { r: 0, g: 0, b: 0, a: 1 },
    });
    expect(a.id).not.toBe(b.id);
  });

  test("add to non-existent node throws", () => {
    const editor = makeEditor();
    expect(() =>
      editor.addFillLayer("nope", {
        type: "solid",
        color: { r: 0, g: 0, b: 0, a: 1 },
      }),
    ).toThrow();
  });

  test("remove a fill layer", () => {
    const editor = makeEditor();
    editor.removeFillLayer("frame-1", "ff1");
    const frame = editor.getFrame("frame-1");
    expect(frame.fills.find((l) => l.id === "ff1")).toBeUndefined();
  });

  test("removing the editing gradient fill clears gradient edit", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.removeFillLayer("frame-1", "ff2");
    expect(editor.gradientEdit).toBeNull();
  });

  test("removing a different fill does not clear gradient edit", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.removeFillLayer("frame-1", "ff1");
    expect(editor.gradientEdit?.fillId).toBe("ff2");
  });

  test("removing the editing gradient fill clears stop selection", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectGradientStop("gs1");
    editor.removeFillLayer("frame-1", "ff2");
    expect(editor.gradientEdit).toBeNull();
  });

  test("update a fill layer", () => {
    const editor = makeEditor();
    const blue = {
      type: "solid" as const,
      color: { r: 0, g: 0, b: 255, a: 1 },
    };
    editor.updateFillLayer("frame-1", "ff1", blue);
    const frame = editor.getFrame("frame-1");
    expect(frame.fills.find((l) => l.id === "ff1")!.fill).toEqual(blue);
  });

  test("update non-existent fill throws", () => {
    const editor = makeEditor();
    expect(() =>
      editor.updateFillLayer("frame-1", "nope", {
        type: "solid",
        color: { r: 0, g: 0, b: 0, a: 1 },
      }),
    ).toThrow();
  });

  test("reorder fill layers", () => {
    const editor = makeEditor();
    editor.reorderFillLayers("frame-1", ["ff2", "ff1"]);
    const frame = editor.getFrame("frame-1");
    expect(frame.fills[0].id).toBe("ff2");
    expect(frame.fills[1].id).toBe("ff1");
  });

  test("reorder with wrong length throws", () => {
    const editor = makeEditor();
    expect(() => editor.reorderFillLayers("frame-1", ["ff1"])).toThrow();
  });

  test("reorder with duplicates throws", () => {
    const editor = makeEditor();
    expect(() => editor.reorderFillLayers("frame-1", ["ff1", "ff1"])).toThrow();
  });
});

// -- Gradient stop CRUD --

describe("gradient stop operations", () => {
  test("add a gradient stop", () => {
    const editor = makeEditor();
    const added = editor.addGradientStop("frame-1", "ff2", {
      offset: 0.5,
      color: { r: 128, g: 128, b: 128, a: 1 },
    });
    expect(added.id).toBeDefined();

    const frame = editor.getFrame("frame-1");
    const layer = frame.fills.find((l) => l.id === "ff2")!;
    expect(layer.fill.type).toBe("linear-gradient");
    if (layer.fill.type === "linear-gradient") {
      expect(
        layer.fill.gradient.stops.find((s) => s.id === added.id),
      ).toBeDefined();
    }
  });

  test("add to a non-gradient fill throws", () => {
    const editor = makeEditor();
    expect(() =>
      editor.addGradientStop("frame-1", "ff1", {
        offset: 0.5,
        color: { r: 0, g: 0, b: 0, a: 1 },
      }),
    ).toThrow();
  });

  test("remove a gradient stop", () => {
    const editor = makeEditor();
    const added = editor.addGradientStop("frame-1", "ff2", {
      offset: 0.5,
      color: { r: 128, g: 128, b: 128, a: 1 },
    });
    editor.removeGradientStop("frame-1", "ff2", added.id);

    const frame = editor.getFrame("frame-1");
    const layer = frame.fills.find((l) => l.id === "ff2")!;
    if (layer.fill.type === "linear-gradient") {
      expect(
        layer.fill.gradient.stops.find((s) => s.id === added.id),
      ).toBeUndefined();
    }
  });

  test("removing the selected stop clears gradient stop selection", () => {
    const editor = makeEditor();
    const added = editor.addGradientStop("frame-1", "ff2", {
      offset: 0.5,
      color: { r: 128, g: 128, b: 128, a: 1 },
    });
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectGradientStop(added.id);

    editor.removeGradientStop("frame-1", "ff2", added.id);
    expect(editor.gradientEdit?.selectedStopId).toBeNull();
  });

  test("removing a different stop does not clear gradient stop selection", () => {
    const editor = makeEditor();
    const added = editor.addGradientStop("frame-1", "ff2", {
      offset: 0.5,
      color: { r: 128, g: 128, b: 128, a: 1 },
    });
    editor.selectNode("frame-1");
    editor.startGradientEdit("ff2");
    editor.selectGradientStop("gs1");

    editor.removeGradientStop("frame-1", "ff2", added.id);
    expect(editor.gradientEdit?.selectedStopId).toBe("gs1");
  });

  test("update stop color", () => {
    const editor = makeEditor();
    editor.updateGradientStop("frame-1", "ff2", "gs1", {
      color: { r: 255, g: 0, b: 0, a: 1 },
    });
    const frame = editor.getFrame("frame-1");
    const layer = frame.fills.find((l) => l.id === "ff2")!;
    if (layer.fill.type === "linear-gradient") {
      const stop = layer.fill.gradient.stops.find((s) => s.id === "gs1")!;
      expect(stop.color).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    }
  });

  test("update stop offset", () => {
    const editor = makeEditor();
    editor.updateGradientStop("frame-1", "ff2", "gs1", { offset: 0.3 });
    const frame = editor.getFrame("frame-1");
    const layer = frame.fills.find((l) => l.id === "ff2")!;
    if (layer.fill.type === "linear-gradient") {
      const stop = layer.fill.gradient.stops.find((s) => s.id === "gs1")!;
      expect(stop.offset).toBe(0.3);
    }
  });
});

// -- Change fill type --

describe("change fill type", () => {
  test("solid to linear-gradient", () => {
    const editor = makeEditor();
    editor.changeFillType("frame-1", "ff1", "linear-gradient");
    const frame = editor.getFrame("frame-1");
    const layer = frame.fills.find((l) => l.id === "ff1")!;
    expect(layer.fill.type).toBe("linear-gradient");
    if (layer.fill.type === "linear-gradient") {
      expect(layer.fill.gradient.stops.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("linear-gradient to solid uses first stop color", () => {
    const editor = makeEditor();
    editor.changeFillType("frame-1", "ff2", "solid");
    const frame = editor.getFrame("frame-1");
    const layer = frame.fills.find((l) => l.id === "ff2")!;
    expect(layer.fill.type).toBe("solid");
    if (layer.fill.type === "solid") {
      expect(layer.fill.color).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    }
  });

  test("same type is a no-op", () => {
    const editor = makeEditor();
    editor.changeFillType("frame-1", "ff1", "solid");
    expect(editor.canUndo).toBe(false);
  });

  test("non-existent fill throws", () => {
    const editor = makeEditor();
    expect(() => editor.changeFillType("frame-1", "nope", "solid")).toThrow();
  });
});

// -- Typed node updates --

describe("typed node updates", () => {
  test("updateFrame changes a frame property", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.opacity = 0.5;
    });
    expect(editor.getFrame("frame-1").opacity).toBe(0.5);
  });

  test("updateFrame on a non-frame throws", () => {
    const editor = makeEditor();
    expect(() => editor.updateFrame("text-1", () => {})).toThrow();
  });

  test("updateText changes a text property", () => {
    const editor = makeEditor();
    editor.updateText("text-1", (n) => {
      n.fontSize = 24;
    });
    expect(editor.getText("text-1").fontSize).toBe(24);
  });

  test("updateScreen changes a screen property", () => {
    const editor = makeEditor();
    editor.updateScreen("screen-1", (n) => {
      n.width = 1440;
    });
    expect(editor.getScreen("screen-1").width).toBe(1440);
  });

  test("updateScreen on a non-screen throws", () => {
    const editor = makeEditor();
    expect(() => editor.updateScreen("frame-1", () => {})).toThrow();
  });

  test("non-existent node throws", () => {
    const editor = makeEditor();
    expect(() => editor.updateFrame("nope", () => {})).toThrow();
  });
});

// -- Typed node getters --

describe("typed node getters", () => {
  test("getFrame returns a frame node", () => {
    const editor = makeEditor();
    const frame = editor.getFrame("frame-1");
    expect(frame.type).toBe("frame");
    expect(frame.opacity).toBe(1);
  });

  test("getFrame on a non-frame throws", () => {
    const editor = makeEditor();
    expect(() => editor.getFrame("text-1")).toThrow();
  });

  test("getText returns a text node", () => {
    const editor = makeEditor();
    const text = editor.getText("text-1");
    expect(text.type).toBe("text");
    expect(text.fontSize).toBe(16);
  });

  test("getText on a non-text throws", () => {
    const editor = makeEditor();
    expect(() => editor.getText("frame-1")).toThrow();
  });

  test("getScreen returns a screen node", () => {
    const editor = makeEditor();
    const screen = editor.getScreen("screen-1");
    expect(screen.type).toBe("screen");
    expect(screen.width).toBe(390);
  });

  test("getScreen on a non-screen throws", () => {
    const editor = makeEditor();
    expect(() => editor.getScreen("frame-1")).toThrow();
  });

  test("getNode throws for non-existent id", () => {
    const editor = makeEditor();
    expect(() => editor.getNode("nope")).toThrow();
  });
});

// -- Undo / redo --

describe("undo and redo", () => {
  test("initially cannot undo or redo", () => {
    const editor = makeEditor();
    expect(editor.canUndo).toBe(false);
    expect(editor.canRedo).toBe(false);
  });

  test("undo reverts a change", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.opacity = 0.5;
    });
    expect(editor.getFrame("frame-1").opacity).toBe(0.5);

    editor.undo();
    expect(editor.getFrame("frame-1").opacity).toBe(1);
  });

  test("redo re-applies an undone change", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.opacity = 0.5;
    });
    editor.undo();
    editor.redo();
    expect(editor.getFrame("frame-1").opacity).toBe(0.5);
  });

  test("new mutation clears redo stack", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.opacity = 0.5;
    });
    editor.undo();
    expect(editor.canRedo).toBe(true);

    editor.updateFrame("frame-1", (n) => {
      n.opacity = 0.75;
    });
    expect(editor.canRedo).toBe(false);
  });

  test("multiple undo and redo", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.opacity = 0.5;
    });
    editor.updateFrame("frame-1", (n) => {
      n.opacity = 0.25;
    });

    editor.undo();
    expect(editor.getFrame("frame-1").opacity).toBe(0.5);

    editor.undo();
    expect(editor.getFrame("frame-1").opacity).toBe(1);

    editor.redo();
    expect(editor.getFrame("frame-1").opacity).toBe(0.5);

    editor.redo();
    expect(editor.getFrame("frame-1").opacity).toBe(0.25);
  });

  test("undo with empty stack is a no-op", () => {
    const editor = makeEditor();
    editor.undo();
    expect(editor.canUndo).toBe(false);
  });

  test("redo with empty stack is a no-op", () => {
    const editor = makeEditor();
    editor.redo();
    expect(editor.canRedo).toBe(false);
  });

  test("undo reverts fill layer addition", () => {
    const editor = makeEditor();
    const before = editor.getFrame("frame-1").fills.length;
    editor.addFillLayer("frame-1", {
      type: "solid",
      color: { r: 0, g: 0, b: 0, a: 1 },
    });
    expect(editor.getFrame("frame-1").fills.length).toBe(before + 1);

    editor.undo();
    expect(editor.getFrame("frame-1").fills.length).toBe(before);
  });

  test("no-op update does not create an undo entry", () => {
    const editor = makeEditor();
    editor.changeFillType("frame-1", "ff1", "solid");
    expect(editor.canUndo).toBe(false);
  });
});

// -- Patch batching --

describe("patch batching", () => {
  test("batches multiple mutations into one undo step", () => {
    const editor = makeEditor();
    editor.beginPatch();
    editor.updateFrame("frame-1", (n) => {
      n.opacity = 0.5;
    });
    editor.updateFrame("frame-1", (n) => {
      n.blur = 4;
    });
    editor.commitPatch();

    expect(editor.getFrame("frame-1").opacity).toBe(0.5);
    expect(editor.getFrame("frame-1").blur).toBe(4);

    editor.undo();
    expect(editor.getFrame("frame-1").opacity).toBe(1);
    expect(editor.getFrame("frame-1").blur).toBe(0);
  });

  test("commitPatch without beginPatch throws", () => {
    const editor = makeEditor();
    expect(() => editor.commitPatch()).toThrow();
  });
});

// -- Node access --

describe("resolveChildren", () => {
  test("resolves child ids to nodes", () => {
    const editor = makeEditor();
    const nodes = editor.resolveChildren(["screen-1", "frame-1"]);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).toBe("screen-1");
    expect(nodes[1].id).toBe("frame-1");
  });
});
