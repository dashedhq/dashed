import { describe, expect, test } from "vitest";

import {
  addGradientStop,
  type Fill,
  type FillLayer,
  fillLayersEquals,
  fillLayersStyle,
  fillsEquals,
  fillStyle,
  gradientStopPosition,
  imageEquals,
  imageToCss,
  linearGradientEquals,
  linearGradientToCss,
  normalizeLinearGradient,
  removeGradientStop,
  updateGradientStop,
} from "./fill";

describe("gradientStopPosition", () => {
  const gradient = {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    stops: [
      { id: "a", offset: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
      { id: "b", offset: 1, color: { r: 255, g: 255, b: 255, a: 1 } },
    ],
  };

  test("offset 0 returns start position", () => {
    expect(gradientStopPosition(gradient, 0)).toEqual({ x: 0, y: 0 });
  });

  test("offset 1 returns end position", () => {
    expect(gradientStopPosition(gradient, 1)).toEqual({ x: 1, y: 1 });
  });

  test("offset 0.5 returns midpoint", () => {
    expect(gradientStopPosition(gradient, 0.5)).toEqual({ x: 0.5, y: 0.5 });
  });

  test("works with non-origin start/end", () => {
    const g = {
      ...gradient,
      start: { x: 0.2, y: 0.3 },
      end: { x: 0.8, y: 0.9 },
    };
    expect(gradientStopPosition(g, 0.5)).toEqual({ x: 0.5, y: 0.6 });
  });
});

describe("linearGradientToCss", () => {
  test("two stops left-to-right", () => {
    expect(
      linearGradientToCss({
        start: { x: 0, y: 0.5 },
        end: { x: 1, y: 0.5 },
        stops: [
          { id: "a", color: { r: 255, g: 0, b: 0, a: 1 }, offset: 0 },
          { id: "b", color: { r: 0, g: 0, b: 255, a: 1 }, offset: 1 },
        ],
      }),
    ).toBe("linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)");
  });

  test("three stops diagonal", () => {
    expect(
      linearGradientToCss({
        start: { x: 0, y: 1 },
        end: { x: 1, y: 0 },
        stops: [
          { id: "a", color: { r: 0, g: 0, b: 0, a: 1 }, offset: 0 },
          { id: "b", color: { r: 136, g: 136, b: 136, a: 1 }, offset: 0.5 },
          { id: "c", color: { r: 255, g: 255, b: 255, a: 1 }, offset: 1 },
        ],
      }),
    ).toBe(
      "linear-gradient(45deg, rgba(0,0,0,1) 0%, rgba(136,136,136,1) 50%, rgba(255,255,255,1) 100%)",
    );
  });

  test("partial extent", () => {
    expect(
      linearGradientToCss({
        start: { x: 0.25, y: 0.5 },
        end: { x: 0.75, y: 0.5 },
        stops: [
          { id: "a", color: { r: 255, g: 0, b: 0, a: 1 }, offset: 0 },
          { id: "b", color: { r: 0, g: 0, b: 255, a: 1 }, offset: 1 },
        ],
      }),
    ).toBe("linear-gradient(90deg, rgba(255,0,0,1) 25%, rgba(0,0,255,1) 75%)");
  });
});

describe("addGradientStop", () => {
  const gradient = {
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    stops: [
      { id: "a", offset: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
      { id: "b", offset: 1, color: { r: 255, g: 255, b: 255, a: 1 } },
    ],
  };

  test("inserts and sorts by offset", () => {
    const result = addGradientStop(gradient, "c", 0.5);
    expect(result.stops).toHaveLength(3);
    expect(result.stops[1].id).toBe("c");
    expect(result.stops[1].offset).toBe(0.5);
  });

  test("clamps out-of-range offset", () => {
    const result = addGradientStop(gradient, "c", 1.5);
    expect(result.stops[2].offset).toBe(1);
  });

  test("interpolates color at midpoint", () => {
    const result = addGradientStop(gradient, "c", 0.5);
    const stop = result.stops.find((s) => s.id === "c")!;
    expect(stop.color).toEqual({ r: 128, g: 128, b: 128, a: 1 });
  });

  test("interpolates color at quarter", () => {
    const result = addGradientStop(gradient, "c", 0.25);
    const stop = result.stops.find((s) => s.id === "c")!;
    expect(stop.color).toEqual({ r: 64, g: 64, b: 64, a: 1 });
  });

  test("uses left stop color when at same offset", () => {
    const result = addGradientStop(gradient, "c", 0);
    const stop = result.stops.find((s) => s.id === "c")!;
    expect(stop.color).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
});

describe("removeGradientStop", () => {
  const gradient = {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    stops: [
      { id: "a", offset: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
      { id: "b", offset: 0.5, color: { r: 128, g: 128, b: 128, a: 1 } },
      { id: "c", offset: 1, color: { r: 255, g: 255, b: 255, a: 1 } },
    ],
  };

  test("removes stop by id", () => {
    const result = removeGradientStop(gradient, "b");
    expect(result.stops).toHaveLength(2);
    expect(result.stops.find((s) => s.id === "b")).toBeUndefined();
  });

  test("throws if removal would leave fewer than 2 stops", () => {
    const twoStops = {
      ...gradient,
      stops: gradient.stops.slice(0, 2),
    };
    expect(() => removeGradientStop(twoStops, "a")).toThrow();
  });
});

describe("updateGradientStop", () => {
  const gradient = {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    stops: [
      { id: "a", offset: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
      { id: "b", offset: 1, color: { r: 255, g: 255, b: 255, a: 1 } },
    ],
  };

  test("updates color without re-sorting", () => {
    const newColor = { r: 255, g: 0, b: 0, a: 1 };
    const result = updateGradientStop(gradient, "a", { color: newColor });
    expect(result.stops[0].color).toEqual(newColor);
    expect(result.stops[0].offset).toBe(0);
  });

  test("updates offset and normalizes", () => {
    const threeStops = {
      ...gradient,
      stops: [
        ...gradient.stops,
        { id: "c", offset: 0.5, color: { r: 128, g: 128, b: 128, a: 1 } },
      ],
    };
    const result = updateGradientStop(threeStops, "c", { offset: 0.1 });
    expect(result.stops[0].id).toBe("a");
    expect(result.stops[1].id).toBe("c");
    expect(result.stops[1].offset).toBe(0.1);
    expect(result.stops[2].id).toBe("b");
  });
});

describe("imageToCss", () => {
  test("cover", () => {
    expect(imageToCss({ src: "test.png", fit: "cover" })).toBe(
      "url(test.png) center/cover no-repeat",
    );
  });

  test("contain", () => {
    expect(imageToCss({ src: "photo.jpg", fit: "contain" })).toBe(
      "url(photo.jpg) center/contain no-repeat",
    );
  });

  test("fill", () => {
    expect(imageToCss({ src: "bg.svg", fit: "fill" })).toBe(
      "url(bg.svg) center/100% 100% no-repeat",
    );
  });
});

describe("fillStyle", () => {
  test("solid fill", () => {
    expect(
      fillStyle({ type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } }),
    ).toBe("background: rgba(255,0,0,1)");
  });

  test("solid fill with alpha", () => {
    expect(
      fillStyle({ type: "solid", color: { r: 0, g: 0, b: 0, a: 0.5 } }),
    ).toBe("background: rgba(0,0,0,0.5)");
  });

  test("gradient fill", () => {
    expect(
      fillStyle({
        type: "linear-gradient",
        gradient: {
          start: { x: 0, y: 0.5 },
          end: { x: 1, y: 0.5 },
          stops: [
            { id: "a", color: { r: 255, g: 0, b: 0, a: 1 }, offset: 0 },
            { id: "b", color: { r: 0, g: 0, b: 255, a: 1 }, offset: 1 },
          ],
        },
      }),
    ).toBe(
      "background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)",
    );
  });

  test("image fill", () => {
    expect(
      fillStyle({ type: "image", image: { src: "test.png", fit: "cover" } }),
    ).toBe("background: url(test.png) center/cover no-repeat");
  });
});

describe("normalizeLinearGradient", () => {
  test("clamps offsets to 0-1 and sorts by offset", () => {
    const result = normalizeLinearGradient({
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      stops: [
        { id: "b", offset: 1.5, color: { r: 255, g: 255, b: 255, a: 1 } },
        { id: "a", offset: -0.5, color: { r: 0, g: 0, b: 0, a: 1 } },
      ],
    });
    expect(result.stops[0]).toEqual({
      id: "a",
      offset: 0,
      color: { r: 0, g: 0, b: 0, a: 1 },
    });
    expect(result.stops[1]).toEqual({
      id: "b",
      offset: 1,
      color: { r: 255, g: 255, b: 255, a: 1 },
    });
  });

  test("throws if fewer than 2 stops", () => {
    expect(() =>
      normalizeLinearGradient({
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        stops: [{ id: "a", offset: 0, color: { r: 0, g: 0, b: 0, a: 1 } }],
      }),
    ).toThrow();
  });
});

describe("linearGradientEquals", () => {
  const gradient = {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    stops: [
      { id: "a", offset: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
      { id: "b", offset: 1, color: { r: 255, g: 255, b: 255, a: 1 } },
    ],
  };

  test("equal gradients", () => {
    expect(linearGradientEquals(gradient, { ...gradient })).toBe(true);
  });

  test("different start", () => {
    expect(
      linearGradientEquals(gradient, { ...gradient, start: { x: 0.5, y: 0 } }),
    ).toBe(false);
  });

  test("different stop count", () => {
    expect(
      linearGradientEquals(gradient, {
        ...gradient,
        stops: [gradient.stops[0]],
      }),
    ).toBe(false);
  });

  test("different stop color", () => {
    expect(
      linearGradientEquals(gradient, {
        ...gradient,
        stops: [
          gradient.stops[0],
          { id: "b", offset: 1, color: { r: 0, g: 0, b: 0, a: 1 } },
        ],
      }),
    ).toBe(false);
  });

  test("different stop id", () => {
    expect(
      linearGradientEquals(gradient, {
        ...gradient,
        stops: [
          gradient.stops[0],
          { id: "c", offset: 1, color: { r: 255, g: 255, b: 255, a: 1 } },
        ],
      }),
    ).toBe(false);
  });
});

describe("imageEquals", () => {
  test("equal images", () => {
    expect(
      imageEquals(
        { src: "test.png", fit: "cover" },
        { src: "test.png", fit: "cover" },
      ),
    ).toBe(true);
  });

  test("different src", () => {
    expect(
      imageEquals(
        { src: "a.png", fit: "cover" },
        { src: "b.png", fit: "cover" },
      ),
    ).toBe(false);
  });

  test("different fit", () => {
    expect(
      imageEquals(
        { src: "test.png", fit: "cover" },
        { src: "test.png", fit: "contain" },
      ),
    ).toBe(false);
  });
});

describe("fillsEquals", () => {
  const red: Fill = { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } };
  const blue: Fill = { type: "solid", color: { r: 0, g: 0, b: 255, a: 1 } };

  test("equal fill arrays", () => {
    expect(fillsEquals([red], [red])).toBe(true);
  });

  test("different lengths", () => {
    expect(fillsEquals([red], [red, blue])).toBe(false);
  });

  test("different fills", () => {
    expect(fillsEquals([red], [blue])).toBe(false);
  });

  test("empty arrays are equal", () => {
    expect(fillsEquals([], [])).toBe(true);
  });
});

describe("fillLayersStyle", () => {
  test("generates style from layers", () => {
    const layers: FillLayer[] = [
      { id: "a", fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } }, visible: true },
    ];
    expect(fillLayersStyle(layers)).toBe("background: rgba(255,0,0,1)");
  });

  test("empty layers returns empty string", () => {
    expect(fillLayersStyle([])).toBe("");
  });

  test("multiple visible fills uses image syntax", () => {
    const layers: FillLayer[] = [
      { id: "a", fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } }, visible: true },
      { id: "b", fill: { type: "solid", color: { r: 0, g: 0, b: 255, a: 1 } }, visible: true },
    ];
    expect(fillLayersStyle(layers)).toBe(
      "background: linear-gradient(rgba(255,0,0,1), rgba(255,0,0,1)), linear-gradient(rgba(0,0,255,1), rgba(0,0,255,1))",
    );
  });

  test("hidden layers are excluded", () => {
    const layers: FillLayer[] = [
      { id: "a", fill: { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } }, visible: false },
      { id: "b", fill: { type: "solid", color: { r: 0, g: 0, b: 255, a: 1 } }, visible: true },
    ];
    expect(fillLayersStyle(layers)).toBe("background: rgba(0,0,255,1)");
  });
});

describe("fillLayersEquals", () => {
  const red: Fill = { type: "solid", color: { r: 255, g: 0, b: 0, a: 1 } };
  const blue: Fill = { type: "solid", color: { r: 0, g: 0, b: 255, a: 1 } };

  test("equal layers", () => {
    expect(
      fillLayersEquals([{ id: "a", fill: red, visible: true }], [{ id: "b", fill: red, visible: true }]),
    ).toBe(true);
  });

  test("different fills", () => {
    expect(
      fillLayersEquals([{ id: "a", fill: red, visible: true }], [{ id: "a", fill: blue, visible: true }]),
    ).toBe(false);
  });

  test("different lengths", () => {
    expect(fillLayersEquals([{ id: "a", fill: red, visible: true }], [])).toBe(false);
  });
});
