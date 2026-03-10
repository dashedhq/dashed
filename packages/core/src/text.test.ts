import { describe, expect, test } from "vitest";

import {
  applyUniformTextStyle,
  createText,
  hasParagraphStyleOverrides,
  hasTextRunStyleOverrides,
  normalizeTextNode,
  paragraphStyle,
  resolveParagraphStyle,
  resolveTextRunStyle,
  type TextNode,
  textRunStyle,
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

describe("textRunStyle", () => {
  test("empty style returns empty string", () => {
    expect(textRunStyle({})).toBe("");
  });

  test("fontSize", () => {
    expect(textRunStyle({ fontSize: 24 })).toBe("font-size: 24px");
  });

  test("all properties", () => {
    const result = textRunStyle({
      fontSize: 14,
      fontFamily: "Arial",
      fontWeight: 700,
      color: { r: 255, g: 0, b: 0, a: 1 },
      letterSpacing: 2,
    });
    expect(result).toContain("font-size: 14px");
    expect(result).toContain("font-family: Arial");
    expect(result).toContain("font-weight: 700");
    expect(result).toContain("color: rgba(255,0,0,1)");
    expect(result).toContain("letter-spacing: 2px");
  });

  test("letterSpacing 0 is included", () => {
    expect(textRunStyle({ letterSpacing: 0 })).toBe("letter-spacing: 0px");
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
  test("combines run and paragraph styles", () => {
    const node = createText({
      id: "t1",
      content: [{ content: [{ text: "x" }] }],
    });
    const result = textStyle(node);
    expect(result).toContain("font-size: 16px");
    expect(result).toContain("text-align: start");
    expect(result).toContain("line-height: 1.5");
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

describe("resolveTextRunStyle", () => {
  const defaults = createText({
    id: "t1",
    content: [{ content: [{ text: "x" }] }],
  });

  test("empty runs returns defaults", () => {
    const result = resolveTextRunStyle([], defaults);
    expect(result.fontSize).toBe(16);
    expect(result.fontFamily).toBe("Inter, sans-serif");
    expect(result.fontWeight).toBe(400);
    expect(result.letterSpacing).toBe(0);
  });

  test("single style returns its effective values", () => {
    const result = resolveTextRunStyle([{ fontSize: 24 }], defaults);
    expect(result.fontSize).toBe(24);
    expect(result.fontFamily).toBe("Inter, sans-serif");
  });

  test("same style across entries", () => {
    const result = resolveTextRunStyle(
      [{ fontSize: 24 }, { fontSize: 24 }],
      defaults,
    );
    expect(result.fontSize).toBe(24);
  });

  test("mixed fontSize", () => {
    const result = resolveTextRunStyle(
      [{ fontSize: 24 }, { fontSize: 16 }],
      defaults,
    );
    expect(result.fontSize).toBe("mixed");
  });

  test("mixed color", () => {
    const result = resolveTextRunStyle(
      [
        { color: { r: 255, g: 0, b: 0, a: 1 } },
        { color: { r: 0, g: 255, b: 0, a: 1 } },
      ],
      defaults,
    );
    expect(result.color).toBe("mixed");
  });

  test("same color across entries", () => {
    const color = { r: 255, g: 0, b: 0, a: 1 };
    const result = resolveTextRunStyle(
      [{ color }, { color: { ...color } }],
      defaults,
    );
    expect(result.color).toEqual(color);
  });
});

describe("resolveParagraphStyle", () => {
  const defaults = createText({
    id: "t1",
    content: [{ content: [{ text: "x" }] }],
  });

  test("empty paragraphs returns defaults", () => {
    const result = resolveParagraphStyle([], defaults);
    expect(result.textAlign).toBe("start");
    expect(result.lineHeight).toBe(1.5);
  });

  test("single style returns its effective values", () => {
    const result = resolveParagraphStyle([{ textAlign: "center" }], defaults);
    expect(result.textAlign).toBe("center");
    expect(result.lineHeight).toBe(1.5);
  });

  test("same style across entries", () => {
    const result = resolveParagraphStyle(
      [{ textAlign: "center" }, { textAlign: "center" }],
      defaults,
    );
    expect(result.textAlign).toBe("center");
  });

  test("mixed textAlign", () => {
    const result = resolveParagraphStyle(
      [{ textAlign: "center" }, { textAlign: "end" }],
      defaults,
    );
    expect(result.textAlign).toBe("mixed");
  });

  test("mixed lineHeight", () => {
    const result = resolveParagraphStyle(
      [{ lineHeight: 1.2 }, { lineHeight: 2.0 }],
      defaults,
    );
    expect(result.lineHeight).toBe("mixed");
  });

  test("falls back to defaults when no overrides", () => {
    const result = resolveParagraphStyle([{}, {}], defaults);
    expect(result.textAlign).toBe("start");
    expect(result.lineHeight).toBe(1.5);
  });
});

describe("applyUniformTextStyle", () => {
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
    const result = applyUniformTextStyle(node, { fontSize: 24 });
    expect(result.fontSize).toBe(24);
  });

  test("strips run overrides for the changed property", () => {
    const node = makeNode({
      content: [{ content: [{ text: "hello", fontSize: 14 }] }],
    });
    const result = applyUniformTextStyle(node, { fontSize: 24 });
    expect(result.content[0].content[0].fontSize).toBeUndefined();
  });

  test("preserves run overrides for unchanged properties", () => {
    const node = makeNode({
      content: [
        { content: [{ text: "hello", fontSize: 14, fontWeight: 700 }] },
      ],
    });
    const result = applyUniformTextStyle(node, { fontSize: 24 });
    expect(result.content[0].content[0].fontWeight).toBe(700);
    expect(result.content[0].content[0].fontSize).toBeUndefined();
  });

  test("strips paragraph overrides for changed paragraph property", () => {
    const node = makeNode({
      content: [{ textAlign: "center", content: [{ text: "hello" }] }],
    });
    const result = applyUniformTextStyle(node, { textAlign: "end" });
    expect(result.textAlign).toBe("end");
    expect(result.content[0].textAlign).toBeUndefined();
  });

  test("preserves paragraph overrides for unchanged properties", () => {
    const node = makeNode({
      content: [
        { textAlign: "center", lineHeight: 2, content: [{ text: "hello" }] },
      ],
    });
    const result = applyUniformTextStyle(node, { textAlign: "end" });
    expect(result.content[0].lineHeight).toBe(2);
    expect(result.content[0].textAlign).toBeUndefined();
  });

  test("strips color overrides from all runs across paragraphs", () => {
    const red = { r: 255, g: 0, b: 0, a: 1 };
    const blue = { r: 0, g: 0, b: 255, a: 1 };
    const node = makeNode({
      content: [
        { content: [{ text: "hello", color: red }] },
        { content: [{ text: "world", color: blue }] },
      ],
    });
    const green = { r: 0, g: 255, b: 0, a: 1 };
    const result = applyUniformTextStyle(node, { color: green });
    expect(result.color).toEqual(green);
    expect(result.content[0].content[0].color).toBeUndefined();
    expect(result.content[1].content[0].color).toBeUndefined();
  });

  test("does not mutate the original node", () => {
    const node = makeNode({
      content: [{ content: [{ text: "hello", fontSize: 14 }] }],
    });
    applyUniformTextStyle(node, { fontSize: 24 });
    expect(node.fontSize).toBe(16);
    expect(node.content[0].content[0].fontSize).toBe(14);
  });
});

describe("hasTextRunStyleOverrides", () => {
  test("no overrides", () => {
    expect(hasTextRunStyleOverrides({})).toBe(false);
  });

  test("fontSize override", () => {
    expect(hasTextRunStyleOverrides({ fontSize: 24 })).toBe(true);
  });

  test("fontFamily override", () => {
    expect(hasTextRunStyleOverrides({ fontFamily: "Arial" })).toBe(true);
  });

  test("fontWeight override", () => {
    expect(hasTextRunStyleOverrides({ fontWeight: 700 })).toBe(true);
  });

  test("color override", () => {
    expect(
      hasTextRunStyleOverrides({ color: { r: 0, g: 0, b: 0, a: 1 } }),
    ).toBe(true);
  });

  test("letterSpacing override", () => {
    expect(hasTextRunStyleOverrides({ letterSpacing: 2 })).toBe(true);
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
