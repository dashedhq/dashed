import { describe, expect, test } from "vitest";

import type { FillLayer } from "./styles/fill";
import {
  applyUniformTypographyStyle,
  createText,
  hasParagraphStyleOverrides,
  hasRunStyleOverrides,
  normalizeTextNode,
  paragraphStyle,
  commonParagraphStyle,
  commonRunStyle,
  runStyle,
  type TextNode,
  textStyle,
} from "./text";

describe("createText", () => {
  test("sets type to text", () => {
    const node = createText({
      id: "t1",
      content: [{ content: [{ text: "x" }] }],
    });
    expect(node.type).toBe("text");
  });

  test("applies defaults", () => {
    const node = createText({
      id: "t1",
      content: [{ content: [{ text: "x" }] }],
    });
    expect(node.name).toBe("Text");
    expect(node.fontSize).toBe(16);
    expect(node.fontFamily).toBe("Inter, sans-serif");
    expect(node.fontWeight).toBe(400);
    expect(node.lineHeight).toBe(1.5);
    expect(node.letterSpacing).toBe(0);
    expect(node.textAlign).toBe("start");
  });

  test("overrides defaults", () => {
    const node = createText({
      id: "t1",
      name: "Title",
      fontSize: 32,
      content: [{ content: [{ text: "hi" }] }],
    });
    expect(node.name).toBe("Title");
    expect(node.fontSize).toBe(32);
  });
});

describe("runStyle", () => {
  test("empty style returns empty string", () => {
    expect(runStyle({})).toBe("");
  });

  test("fontSize", () => {
    expect(runStyle({ fontSize: 24 })).toBe("font-size: 24px");
  });

  test("all properties with solid fill", () => {
    const result = runStyle({
      fontSize: 14,
      fontFamily: "Arial",
      fontWeight: 700,
      fills: [
        { id: "r", fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } } },
      ],
      letterSpacing: 2,
    });
    expect(result).toContain("font-size: 14px");
    expect(result).toContain("font-family: Arial");
    expect(result).toContain("font-weight: 700");
    expect(result).toContain("color: rgba(255,0,0,1)");
    expect(result).not.toContain("background-clip");
    expect(result).toContain("letter-spacing: 2px");
  });

  test("gradient fill uses background-clip: text", () => {
    const result = runStyle({
      fills: [
        {
          id: "g",
          fill: {
            type: "linear-gradient",
            gradient: {
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
              stops: [
                { id: "a", offset: 0, color: { r: 255, g: 0, b: 0, a: 1 } },
                { id: "b", offset: 1, color: { r: 0, g: 0, b: 255, a: 1 } },
              ],
            },
          },
        },
      ],
    });
    expect(result).toContain("background-clip: text");
    expect(result).toContain("color: transparent");
  });

  test("resolves from base when run has no override", () => {
    const result = runStyle({}, { fontSize: 20, fontWeight: 600 });
    expect(result).toContain("font-size: 20px");
    expect(result).toContain("font-weight: 600");
  });

  test("empty fills emits transparent without background", () => {
    const result = runStyle({ fills: [] });
    expect(result).toBe("color: transparent");
    expect(result).not.toContain("background");
  });

  test("undefined fills emits nothing", () => {
    expect(runStyle({})).toBe("");
  });

  test("letterSpacing 0 is included", () => {
    expect(runStyle({ letterSpacing: 0 })).toBe("letter-spacing: 0px");
  });
});

describe("paragraphStyle", () => {
  test("empty style returns empty string", () => {
    expect(paragraphStyle({})).toBe("");
  });

  test("textAlign", () => {
    expect(paragraphStyle({ textAlign: "center" })).toBe("text-align: center");
  });

  test("lineHeight", () => {
    expect(paragraphStyle({ lineHeight: 1.8 })).toBe("line-height: 1.8");
  });
});

describe("textStyle", () => {
  test("outputs container styles only, no run or paragraph styles", () => {
    const node = createText({
      id: "t1",
      content: [{ content: [{ text: "x" }] }],
    });
    const result = textStyle(node);
    expect(result).toContain("fit-content");
    expect(result).not.toContain("font-size");
    expect(result).not.toContain("text-align");
    expect(result).not.toContain("line-height");
  });
});

describe("normalizeTextNode", () => {
  function makeNode(
    overrides: Partial<TextNode> & { content: TextNode["content"] },
  ): TextNode {
    return {
      ...createText({ id: "t1", content: [{ content: [{ text: "x" }] }] }),
      ...overrides,
    };
  }

  test("merges adjacent runs with same style", () => {
    const node = makeNode({
      content: [{ content: [{ text: "hello " }, { text: "world" }] }],
    });
    const result = normalizeTextNode(node);
    expect(result.content[0].content).toHaveLength(1);
    expect(result.content[0].content[0].text).toBe("hello world");
  });

  test("does not merge runs with different styles", () => {
    const node = makeNode({
      content: [
        { content: [{ text: "hello ", fontWeight: 700 }, { text: "world" }] },
      ],
    });
    const result = normalizeTextNode(node);
    expect(result.content[0].content).toHaveLength(2);
  });

  test("drops empty runs", () => {
    const node = makeNode({
      content: [{ content: [{ text: "" }, { text: "hello" }] }],
    });
    const result = normalizeTextNode(node);
    expect(result.content[0].content).toHaveLength(1);
    expect(result.content[0].content[0].text).toBe("hello");
  });

  test("promotes run style to node when all runs agree", () => {
    const node = makeNode({
      content: [
        {
          content: [
            { text: "a", fontSize: 24 },
            { text: "b", fontSize: 24 },
          ],
        },
      ],
    });
    const result = normalizeTextNode(node);
    expect(result.fontSize).toBe(24);
    expect(result.content[0].content[0].fontSize).toBeUndefined();
  });

  test("strips redundant run overrides matching node defaults", () => {
    const node = makeNode({
      fontSize: 20,
      content: [{ content: [{ text: "hello", fontSize: 20 }] }],
    });
    const result = normalizeTextNode(node);
    expect(result.content[0].content[0].fontSize).toBeUndefined();
  });

  test("strips redundant paragraph overrides matching node defaults", () => {
    const node = makeNode({
      textAlign: "center",
      content: [{ textAlign: "center", content: [{ text: "hello" }] }],
    });
    const result = normalizeTextNode(node);
    expect(result.content[0].textAlign).toBeUndefined();
  });

  test("promotes paragraph style to node when all paragraphs agree", () => {
    const node = makeNode({
      content: [
        { textAlign: "center", content: [{ text: "a" }] },
        { textAlign: "center", content: [{ text: "b" }] },
      ],
    });
    const result = normalizeTextNode(node);
    expect(result.textAlign).toBe("center");
    expect(result.content[0].textAlign).toBeUndefined();
    expect(result.content[1].textAlign).toBeUndefined();
  });
});

describe("commonRunStyle", () => {
  const defaults = createText({
    id: "t1",
    content: [{ content: [{ text: "x" }] }],
  });

  test("empty runs returns defaults", () => {
    const result = commonRunStyle([], defaults);
    expect(result.fontSize).toBe(16);
    expect(result.fontFamily).toBe("Inter, sans-serif");
    expect(result.fontWeight).toBe(400);
    expect(result.letterSpacing).toBe(0);
  });

  test("single style returns its effective values", () => {
    const result = commonRunStyle([{ fontSize: 24 }], defaults);
    expect(result.fontSize).toBe(24);
    expect(result.fontFamily).toBe("Inter, sans-serif");
  });

  test("same style across entries", () => {
    const result = commonRunStyle(
      [{ fontSize: 24 }, { fontSize: 24 }],
      defaults,
    );
    expect(result.fontSize).toBe(24);
  });

  test("mixed fontSize", () => {
    const result = commonRunStyle(
      [{ fontSize: 24 }, { fontSize: 16 }],
      defaults,
    );
    expect(result.fontSize).toBe("mixed");
  });

  test("mixed fills", () => {
    const result = commonRunStyle(
      [
        {
          fills: [
            { id: "a", fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } } },
          ],
        },
        {
          fills: [
            { id: "b", fill: { type: "solid", color: { r: 0, g: 255, b: 0, a: 1 } } },
          ],
        },
      ],
      defaults,
    );
    expect(result.fills).toBe("mixed");
  });

  test("same fills across entries", () => {
    const fills: FillLayer[] = [
      { id: "a", fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } } },
    ];
    const result = commonRunStyle([{ fills }, { fills }], defaults);
    expect(result.fills).toEqual(fills);
  });
});

describe("commonParagraphStyle", () => {
  const defaults = createText({
    id: "t1",
    content: [{ content: [{ text: "x" }] }],
  });

  test("empty paragraphs returns defaults", () => {
    const result = commonParagraphStyle([], defaults);
    expect(result.textAlign).toBe("start");
    expect(result.lineHeight).toBe(1.5);
  });

  test("single style returns its effective values", () => {
    const result = commonParagraphStyle([{ textAlign: "center" }], defaults);
    expect(result.textAlign).toBe("center");
    expect(result.lineHeight).toBe(1.5);
  });

  test("same style across entries", () => {
    const result = commonParagraphStyle(
      [{ textAlign: "center" }, { textAlign: "center" }],
      defaults,
    );
    expect(result.textAlign).toBe("center");
  });

  test("mixed textAlign", () => {
    const result = commonParagraphStyle(
      [{ textAlign: "center" }, { textAlign: "end" }],
      defaults,
    );
    expect(result.textAlign).toBe("mixed");
  });

  test("mixed lineHeight", () => {
    const result = commonParagraphStyle(
      [{ lineHeight: 1.2 }, { lineHeight: 2.0 }],
      defaults,
    );
    expect(result.lineHeight).toBe("mixed");
  });

  test("falls back to defaults when no overrides", () => {
    const result = commonParagraphStyle([{}, {}], defaults);
    expect(result.textAlign).toBe("start");
    expect(result.lineHeight).toBe(1.5);
  });
});

describe("applyUniformTypographyStyle", () => {
  function makeNode(
    overrides: Partial<TextNode> & { content: TextNode["content"] },
  ): TextNode {
    return {
      ...createText({ id: "t1", content: [{ content: [{ text: "x" }] }] }),
      ...overrides,
    };
  }

  test("sets the node-level default", () => {
    const node = makeNode({
      content: [{ content: [{ text: "hello" }] }],
    });
    const result = applyUniformTypographyStyle(node, { fontSize: 24 });
    expect(result.fontSize).toBe(24);
  });

  test("strips run overrides for the changed property", () => {
    const node = makeNode({
      content: [{ content: [{ text: "hello", fontSize: 14 }] }],
    });
    const result = applyUniformTypographyStyle(node, { fontSize: 24 });
    expect(result.content[0].content[0].fontSize).toBeUndefined();
  });

  test("preserves run overrides for unchanged properties", () => {
    const node = makeNode({
      content: [
        { content: [{ text: "hello", fontSize: 14, fontWeight: 700 }] },
      ],
    });
    const result = applyUniformTypographyStyle(node, { fontSize: 24 });
    expect(result.content[0].content[0].fontWeight).toBe(700);
    expect(result.content[0].content[0].fontSize).toBeUndefined();
  });

  test("strips paragraph overrides for changed paragraph property", () => {
    const node = makeNode({
      content: [{ textAlign: "center", content: [{ text: "hello" }] }],
    });
    const result = applyUniformTypographyStyle(node, { textAlign: "end" });
    expect(result.textAlign).toBe("end");
    expect(result.content[0].textAlign).toBeUndefined();
  });

  test("preserves paragraph overrides for unchanged properties", () => {
    const node = makeNode({
      content: [
        { textAlign: "center", lineHeight: 2, content: [{ text: "hello" }] },
      ],
    });
    const result = applyUniformTypographyStyle(node, { textAlign: "end" });
    expect(result.content[0].lineHeight).toBe(2);
    expect(result.content[0].textAlign).toBeUndefined();
  });

  test("strips fills overrides from all runs across paragraphs", () => {
    const red: FillLayer[] = [
      { id: "r", fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } } },
    ];
    const blue: FillLayer[] = [
      { id: "b", fill: { type: "solid", color: { r: 0, g: 0, b: 255, a: 1 } } },
    ];
    const node = makeNode({
      content: [
        { content: [{ text: "hello", fills: red }] },
        { content: [{ text: "world", fills: blue }] },
      ],
    });
    const green: FillLayer[] = [
      { id: "g", fill: { type: "solid", color: { r: 0, g: 255, b: 0, a: 1 } } },
    ];
    const result = applyUniformTypographyStyle(node, { fills: green });
    expect(result.fills).toEqual(green);
    expect(result.content[0].content[0].fills).toBeUndefined();
    expect(result.content[1].content[0].fills).toBeUndefined();
  });

  test("does not mutate the original node", () => {
    const node = makeNode({
      content: [{ content: [{ text: "hello", fontSize: 14 }] }],
    });
    applyUniformTypographyStyle(node, { fontSize: 24 });
    expect(node.fontSize).toBe(16);
    expect(node.content[0].content[0].fontSize).toBe(14);
  });
});

describe("hasRunStyleOverrides", () => {
  test("no overrides", () => {
    expect(hasRunStyleOverrides({})).toBe(false);
  });

  test("fontSize override", () => {
    expect(hasRunStyleOverrides({ fontSize: 24 })).toBe(true);
  });

  test("fontFamily override", () => {
    expect(hasRunStyleOverrides({ fontFamily: "Arial" })).toBe(true);
  });

  test("fontWeight override", () => {
    expect(hasRunStyleOverrides({ fontWeight: 700 })).toBe(true);
  });

  test("fills override", () => {
    expect(
      hasRunStyleOverrides({
        fills: [
          { id: "a", fill: { type: "solid", color: { r: 0, g: 0, b: 0, a: 1 } } },
        ],
      }),
    ).toBe(true);
  });

  test("letterSpacing override", () => {
    expect(hasRunStyleOverrides({ letterSpacing: 2 })).toBe(true);
  });
});

describe("hasParagraphStyleOverrides", () => {
  test("no overrides", () => {
    expect(hasParagraphStyleOverrides({})).toBe(false);
  });

  test("textAlign override", () => {
    expect(hasParagraphStyleOverrides({ textAlign: "center" })).toBe(true);
  });

  test("lineHeight override", () => {
    expect(hasParagraphStyleOverrides({ lineHeight: 2.0 })).toBe(true);
  });

  test("both overrides", () => {
    expect(
      hasParagraphStyleOverrides({ textAlign: "end", lineHeight: 1.2 }),
    ).toBe(true);
  });
});
