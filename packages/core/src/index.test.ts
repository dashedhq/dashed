import { describe, expect, test } from "vitest";

import { nodeStyle } from "./index";

import { createFrame } from "./frame";
import { createScreen } from "./screen";
import { createText } from "./text";

describe("nodeStyle", () => {
  test("dispatches to frameStyle for frame nodes", () => {
    const frame = createFrame({ id: "f1" });
    const style = nodeStyle(frame);
    expect(style).toContain("display: flex");
  });

  test("dispatches to screenStyle for screen nodes", () => {
    const screen = createScreen({ id: "s1" });
    const style = nodeStyle(screen);
    expect(style).toContain("width: 390px");
  });

  test("dispatches to textStyle for text nodes", () => {
    const text = createText({
      id: "t1",
      content: [{ content: [{ text: "hello" }] }],
    });
    const style = nodeStyle(text);
    expect(typeof style).toBe("string");
  });
});
