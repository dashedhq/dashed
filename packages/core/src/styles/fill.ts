import { type Color, colorEquals, colorToCss } from "./color";

import { round } from "../utils/math";

export type GradientStop = {
  id: string;
  offset: number;
  color: Color;
};

export type LinearGradient = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  stops: GradientStop[];
};

export function normalizeLinearGradient(
  gradient: LinearGradient,
): LinearGradient {
  const stops = gradient.stops
    .map((stop) => ({
      ...stop,
      offset: round(Math.max(0, Math.min(1, stop.offset)), 4),
    }))
    .sort((a, b) => a.offset - b.offset);

  if (stops.length < 2) {
    throw new Error(
      "normalizeLinearGradient: gradient must have at least 2 stops",
    );
  }

  return {
    ...gradient,
    start: {
      x: round(gradient.start.x, 4),
      y: round(gradient.start.y, 4),
    },
    end: {
      x: round(gradient.end.x, 4),
      y: round(gradient.end.y, 4),
    },
    stops,
  };
}

export function linearGradientEquals(a: LinearGradient, b: LinearGradient) {
  if (
    a.start.x !== b.start.x ||
    a.start.y !== b.start.y ||
    a.end.x !== b.end.x ||
    a.end.y !== b.end.y ||
    a.stops.length !== b.stops.length
  ) {
    return false;
  }

  return a.stops.every((s, i) => {
    const other = b.stops[i];
    return (
      s.id === other.id &&
      s.offset === other.offset &&
      colorEquals(s.color, other.color)
    );
  });
}

export function addGradientStop(
  gradient: LinearGradient,
  id: string,
  offset: number,
): LinearGradient {
  const left = [...gradient.stops].reverse().find((s) => s.offset <= offset);
  const right = gradient.stops.find((s) => s.offset >= offset);
  let color: Color = { r: 0, g: 0, b: 0, a: 1 };
  if (left && right && left !== right) {
    const t = (offset - left.offset) / (right.offset - left.offset);
    color = {
      r: Math.round(left.color.r + (right.color.r - left.color.r) * t),
      g: Math.round(left.color.g + (right.color.g - left.color.g) * t),
      b: Math.round(left.color.b + (right.color.b - left.color.b) * t),
      a: left.color.a + (right.color.a - left.color.a) * t,
    };
  } else if (left) {
    color = { ...left.color };
  } else if (right) {
    color = { ...right.color };
  }
  return normalizeLinearGradient({
    ...gradient,
    stops: [...gradient.stops, { id, offset, color }],
  });
}

export function removeGradientStop(
  gradient: LinearGradient,
  id: string,
): LinearGradient {
  const stops = gradient.stops.filter((s) => s.id !== id);
  if (stops.length < 2) {
    throw new Error("removeGradientStop: gradient must have at least 2 stops");
  }
  return { ...gradient, stops };
}

export function updateGradientStop(
  gradient: LinearGradient,
  id: string,
  patch: Partial<Omit<GradientStop, "id">>,
): LinearGradient {
  const updated = {
    ...gradient,
    stops: gradient.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  };
  return patch.offset !== undefined
    ? normalizeLinearGradient(updated)
    : updated;
}

export function gradientStopPosition(
  gradient: LinearGradient,
  offset: number,
): { x: number; y: number } {
  return {
    x: round(
      gradient.start.x + (gradient.end.x - gradient.start.x) * offset,
      4,
    ),
    y: round(
      gradient.start.y + (gradient.end.y - gradient.start.y) * offset,
      4,
    ),
  };
}

// Derive CSS angle (0deg = bottom-to-top, 90deg = left-to-right) from two points.
function pointsToCssAngle(
  start: { x: number; y: number },
  end: { x: number; y: number },
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    return 0;
  }
  return ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
}

// Project a point onto the CSS gradient line for a unit square,
// returning its position as a percentage (0% at line start, 100% at line end).
function projectToCssPercent(
  point: { x: number; y: number },
  angleDeg: number,
): number {
  const rad = (angleDeg * Math.PI) / 180;
  const halfLen = (Math.abs(Math.sin(rad)) + Math.abs(Math.cos(rad))) / 2;
  const dirX = Math.sin(rad);
  const dirY = -Math.cos(rad);
  const proj = (point.x - 0.5) * dirX + (point.y - 0.5) * dirY;
  return (proj / halfLen) * 50 + 50;
}

export function linearGradientToCss(gradient: LinearGradient) {
  const { start, end, stops } = gradient;
  const angle = pointsToCssAngle(start, end);
  const startPct = projectToCssPercent(start, angle);
  const endPct = projectToCssPercent(end, angle);

  const s = stops
    .map((s) => {
      const pct = startPct + (endPct - startPct) * s.offset;
      return `${colorToCss(s.color)} ${round(pct, 1)}%`;
    })
    .join(", ");

  return `linear-gradient(${round(angle, 1)}deg, ${s})`;
}

export type Image = {
  src: string;
  fit: "cover" | "contain" | "fill";
};

export function imageEquals(a: Image, b: Image) {
  return a.src === b.src && a.fit === b.fit;
}

export function imageToCss(image: Image) {
  return `url(${image.src}) center/${image.fit}`;
}

export type SolidFill = { type: "solid"; color: Color };
export type LinearGradientFill = {
  type: "linear-gradient";
  gradient: LinearGradient;
};
export type ImageFill = { type: "image"; image: Image };

export type Fill = SolidFill | LinearGradientFill | ImageFill;

export type FillLayer = {
  id: string;
  fill: Fill;
};

function fillAsImage(fill: Fill) {
  if (fill.type === "solid") {
    const c = colorToCss(fill.color);
    return `linear-gradient(${c}, ${c})`;
  }

  if (fill.type === "linear-gradient") {
    return linearGradientToCss(fill.gradient);
  }

  return imageToCss(fill.image);
}

export function fillStyle(fill: Fill) {
  if (fill.type === "solid") {
    return `background: ${colorToCss(fill.color)}`;
  }
  return `background: ${fillAsImage(fill)}`;
}

export function fillsStyle(fills: Fill[]) {
  if (fills.length === 0) {
    return "";
  }
  if (fills.length === 1) {
    return fillStyle(fills[0]);
  }
  return `background: ${fills.map(fillAsImage).join(", ")}`;
}

export function fillEquals(a: Fill, b: Fill) {
  if (a.type !== b.type) {
    return false;
  }
  if (a.type === "solid" && b.type === "solid") {
    return colorEquals(a.color, b.color);
  }
  if (a.type === "image" && b.type === "image") {
    return imageEquals(a.image, b.image);
  }
  if (a.type === "linear-gradient" && b.type === "linear-gradient") {
    return linearGradientEquals(a.gradient, b.gradient);
  }
  return false;
}

export function fillsEquals(a: Fill[], b: Fill[]) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((f, i) => fillEquals(f, b[i]));
}

export function fillLayersStyle(layers: FillLayer[]) {
  return fillsStyle(layers.map((l) => l.fill));
}

export function fillLayersEquals(a: FillLayer[], b: FillLayer[]) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((layer, i) => fillEquals(layer.fill, b[i].fill));
}
