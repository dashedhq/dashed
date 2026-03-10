import { describe, expect, test } from "vitest";

import { fillStyle } from "./fill";

describe("fillStyle", () => {
  test("solid fill", () => {
    expect(
      fillStyle({ type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } }),
    ).toBe("background-color: rgba(255,0,0,1)");
  });

  test("solid fill with alpha", () => {
    expect(
      fillStyle({ type: "solid", color: { r: 0, g: 0, b: 0, a: 0.5 } }),
    ).toBe("background-color: rgba(0,0,0,0.5)");
  });

  test("gradient fill", () => {
    expect(
      fillStyle({
        type: "gradient",
        angle: 90,
        stops: [
          { color: "red", offset: 0 },
          { color: "blue", offset: 1 },
        ],
      }),
    ).toBe("background: linear-gradient(90deg, red 0%, blue 100%)");
  });

  test("gradient fill with mid stop", () => {
    expect(
      fillStyle({
        type: "gradient",
        angle: 45,
        stops: [
          { color: "#000", offset: 0 },
          { color: "#888", offset: 0.5 },
          { color: "#fff", offset: 1 },
        ],
      }),
    ).toBe("background: linear-gradient(45deg, #000 0%, #888 50%, #fff 100%)");
  });

  test("image fill with cover", () => {
    expect(fillStyle({ type: "image", src: "test.png", fit: "cover" })).toBe(
      "background-image: url(test.png); background-size: cover",
    );
  });

  test("image fill with contain", () => {
    expect(fillStyle({ type: "image", src: "photo.jpg", fit: "contain" })).toBe(
      "background-image: url(photo.jpg); background-size: contain",
    );
  });

  test("image fill with fill", () => {
    expect(fillStyle({ type: "image", src: "bg.svg", fit: "fill" })).toBe(
      "background-image: url(bg.svg); background-size: fill",
    );
  });
});
