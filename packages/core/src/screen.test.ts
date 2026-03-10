import { describe, expect, test } from "vitest";

import { createScreen, screenStyle } from "./screen";

describe("createScreen", () => {
  test("sets type to screen", () => {
    const screen = createScreen({ id: "s1" });
    expect(screen.type).toBe("screen");
  });

  test("applies defaults", () => {
    const screen = createScreen({ id: "s1" });
    expect(screen.name).toBe("Screen");
    expect(screen.children).toEqual([]);
    expect(screen.x).toBe(0);
    expect(screen.y).toBe(0);
    expect(screen.fill).toEqual({
      type: "solid",
      color: { r: 255, g: 255, b: 255, a: 1 },
    });
    expect(screen.width).toBe(390);
    expect(screen.height).toBe(844);
  });

  test("overrides defaults", () => {
    const screen = createScreen({
      id: "s1",
      name: "Desktop",
      width: 1440,
      height: 900,
    });
    expect(screen.name).toBe("Desktop");
    expect(screen.width).toBe(1440);
    expect(screen.height).toBe(900);
  });
});

describe("screenStyle", () => {
  test("default screen style", () => {
    const screen = createScreen({ id: "s1" });
    const style = screenStyle(screen);
    expect(style).toContain("background-color: rgba(255,255,255,1)");
    expect(style).toContain("width: 390px");
    expect(style).toContain("height: 844px");
  });

  test("custom dimensions", () => {
    const screen = createScreen({ id: "s1", width: 1920, height: 1080 });
    const style = screenStyle(screen);
    expect(style).toContain("width: 1920px");
    expect(style).toContain("height: 1080px");
  });
});
