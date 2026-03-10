import { type Color, colorToCss } from "./color";

export type GradientStop = {
  offset: number;
  color: string;
};

export type Fill =
  | { type: "solid"; color: Color }
  | { type: "gradient"; stops: GradientStop[]; angle: number }
  | { type: "image"; src: string; fit: "cover" | "contain" | "fill" };

export function fillStyle(fill: Fill) {
  if (fill.type === "solid") {
    return `background-color: ${colorToCss(fill.color)}`;
  }

  if (fill.type === "gradient") {
    const stops = fill.stops
      .map((s) => `${s.color} ${s.offset * 100}%`)
      .join(", ");
    return `background: linear-gradient(${fill.angle}deg, ${stops})`;
  }

  return `background-image: url(${fill.src}); background-size: ${fill.fit}`;
}
