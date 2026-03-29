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
            visible: true,
          },
        ],
      }),
      "frame-1": createFrame({
        id: "frame-1",
        fills: [
          {
            id: "ff1",
            fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } },
            visible: true,
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
            visible: true,
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
    editor.startTextEdit();
    editor.registerTextEditor(pmView, pmState);

    editor.stopTextEdit();
    expect(editor.canUndo).toBe(true);
  });

  test("startTextEdit requires a selected node", () => {
    const editor = makeEditor();
    expect(() => editor.startTextEdit()).toThrow();
  });

  test("startTextEdit requires a text node", () => {
    const editor = makeEditor();
    editor.selectNode("frame-1");
    expect(() => editor.startTextEdit()).toThrow();
  });

  test("updateTextEditorState requires active text edit", () => {
    const editor = makeEditor();
    expect(() => editor.updateTextEditorState(pmState)).toThrow();
  });

  test("update text editor state", () => {
    const editor = makeEditor();
    editor.selectNode("text-1");
    editor.startTextEdit();
    editor.registerTextEditor(pmView, pmState);

    const newState = PMEditorState.create({ schema });
    editor.updateTextEditorState(newState);
  });

  test("stopTextEdit is a no-op without active text edit", () => {
    const editor = makeEditor();
    editor.stopTextEdit();
    expect(editor.canUndo).toBe(false);
  });

  test("stopTextEdit is a no-op when called after already stopped", () => {
    const editor = makeEditor();
    editor.selectNode("text-1");
    editor.startTextEdit();
    editor.registerTextEditor(pmView, pmState);
    editor.stopTextEdit();
    editor.stopTextEdit();
    expect(editor.canUndo).toBe(true);
  });

  test("stopTextEdit creates an undo entry", () => {
    const editor = makeEditor();
    editor.selectNode("text-1");
    editor.startTextEdit();
    editor.registerTextEditor(pmView, pmState);
    editor.stopTextEdit();
    expect(editor.canUndo).toBe(true);
  });

  test("stopTextEdit undo restores original text node", () => {
    const editor = makeEditor();
    const originalNode = editor.getText("text-1");
    editor.selectNode("text-1");
    editor.startTextEdit();
    editor.registerTextEditor(pmView, pmState);
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
    editor.startTextEdit();
    editor.registerTextEditor(view, state);

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

  // -- commonTypographyStyle --

  test("returns node defaults when not text editing", () => {
    const editor = makeEditor();
    const style = editor.commonTypographyStyle("text-1");
    expect(style.fontSize).toBe(16);
    expect(style.fontFamily).toBe("Inter, sans-serif");
    expect(style.fontWeight).toBe(400);
    expect(style.textAlign).toBe("start");
    expect(style.lineHeight).toBe(1.5);
    expect(style.letterSpacing).toBe(0);
  });

  test("throws for non-text node", () => {
    const editor = makeEditor();
    expect(() => editor.commonTypographyStyle("frame-1")).toThrow();
  });

  test("resolves defaults from PM state at cursor with no marks", () => {
    const editor = makeEditor();
    const { cleanup, cursorAtStart } = startEditing(editor);
    cursorAtStart();

    const style = editor.commonTypographyStyle("text-1");
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

    const style = editor.commonTypographyStyle("text-1");
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

    const style = editor.commonTypographyStyle("text-1");
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
    expect(node.textAlign).toBe("center");

    cleanup();
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

  test("no-op update does not create an undo entry", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.opacity = 1; // same as default
    });
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
      n.effects = [
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: true },
      ];
    });
    editor.commitPatch();

    expect(editor.getFrame("frame-1").opacity).toBe(0.5);
    expect(editor.getFrame("frame-1").effects).toHaveLength(1);
    expect(editor.getFrame("frame-1").effects[0].effect.type).toBe("blur");

    editor.undo();
    expect(editor.getFrame("frame-1").opacity).toBe(1);
    expect(editor.getFrame("frame-1").effects).toHaveLength(0);
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

// -- Resize --

describe("resizeNode", () => {
  test("resize frame width", () => {
    const editor = makeEditor();
    editor.resizeNode("frame-1", { width: { type: "fixed", value: 200 } });
    const frame = editor.getFrame("frame-1");
    expect(frame.dimensions.width).toEqual({ type: "fixed", value: 200 });
  });

  test("resize frame height", () => {
    const editor = makeEditor();
    editor.resizeNode("frame-1", { height: { type: "fixed", value: 300 } });
    const frame = editor.getFrame("frame-1");
    expect(frame.dimensions.height).toEqual({ type: "fixed", value: 300 });
  });

  test("resize clamps to minWidth", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.dimensions.minWidth = 100;
    });
    editor.resizeNode("frame-1", { width: { type: "fixed", value: 50 } });
    const frame = editor.getFrame("frame-1");
    expect(frame.dimensions.width).toEqual({ type: "fixed", value: 100 });
  });

  test("resize clamps to maxWidth", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.dimensions.maxWidth = 500;
    });
    editor.resizeNode("frame-1", { width: { type: "fixed", value: 600 } });
    const frame = editor.getFrame("frame-1");
    expect(frame.dimensions.width).toEqual({ type: "fixed", value: 500 });
  });

  test("resize to fill mode", () => {
    const editor = makeEditor();
    editor.resizeNode("frame-1", { width: { type: "fill" } });
    const frame = editor.getFrame("frame-1");
    expect(frame.dimensions.width).toEqual({ type: "fill" });
  });

  test("resize non-frame/text throws", () => {
    const editor = makeEditor();
    expect(() =>
      editor.resizeNode("screen-1", { width: { type: "fixed", value: 200 } }),
    ).toThrow();
  });
});

// -- Effects --

describe("frame effects", () => {
  test("frame starts with empty effects", () => {
    const editor = makeEditor();
    const frame = editor.getFrame("frame-1");
    expect(frame.effects).toEqual([]);
  });

  test("add a blur effect", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.effects = [
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: true },
      ];
    });
    const frame = editor.getFrame("frame-1");
    expect(frame.effects).toHaveLength(1);
    expect(frame.effects[0].effect).toEqual({ type: "blur", blur: 4 });
  });

  test("add a drop shadow effect", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.effects = [
        {
          id: "e1",
          effect: {
            type: "drop-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.5 },
              x: 0,
              y: 2,
              blur: 8,
              spread: 0,
            },
          },
          visible: true,
        },
      ];
    });
    const frame = editor.getFrame("frame-1");
    expect(frame.effects[0].effect.type).toBe("drop-shadow");
  });

  test("undo reverts effect changes", () => {
    const editor = makeEditor();
    editor.updateFrame("frame-1", (n) => {
      n.effects = [
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: true },
      ];
    });
    expect(editor.getFrame("frame-1").effects).toHaveLength(1);

    editor.undo();
    expect(editor.getFrame("frame-1").effects).toHaveLength(0);
  });
});
