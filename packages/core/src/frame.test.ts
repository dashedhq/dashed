import { describe, expect, test } from "vitest";

import { createFrame, frameStyle } from "./frame";

describe("createFrame", () => {
  test("sets type to frame", () => {
    const frame = createFrame({ id: "f1" });
    expect(frame.type).toBe("frame");
  });

  test("applies defaults", () => {
    const frame = createFrame({ id: "f1" });
    expect(frame.name).toBe("Frame");
    expect(frame.children).toEqual([]);
    expect(frame.fills).toEqual([]);
    expect(frame.opacity).toBe(1);
    expect(frame.padding).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(frame.dimensions).toEqual({
      width: { type: "hug" },
      height: { type: "hug" },
      minWidth: 0,
      maxWidth: "none",
      minHeight: 0,
      maxHeight: "none",
    });
  });

  test("overrides defaults", () => {
    const frame = createFrame({
      id: "f1",
      name: "Custom",
      opacity: 0.5,
      fills: [
        { id: "f", fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } } },
      ],
    });
    expect(frame.name).toBe("Custom");
    expect(frame.opacity).toBe(0.5);
    expect(frame.fills[0].fill.type).toBe("solid");
  });
});

describe("frameStyle", () => {
  test("default frame produces style string", () => {
    const frame = createFrame({ id: "f1" });
    const style = frameStyle(frame);
    expect(style).toContain("display: flex");
    expect(style).toContain("width: fit-content");
    expect(style).toContain("height: fit-content");
  });

  test("omits empty parts", () => {
    const frame = createFrame({ id: "f1" });
    const style = frameStyle(frame);
    // Default has zero padding, borders, shadow, opacity 1 — all return ""
    expect(style).not.toContain("padding:");
    expect(style).not.toContain("border-top:");
    expect(style).not.toContain("box-shadow:");
    expect(style).not.toContain("opacity:");
  });

  test("includes non-zero padding", () => {
    const frame = createFrame({
      id: "f1",
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
    });
    expect(frameStyle(frame)).toContain("padding: 8px 8px 8px 8px");
  });
});
