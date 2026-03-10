import { type Fill, fillStyle } from "./styles/fill";

export type ScreenStyle = {
  x: number;
  y: number;
  fill: Fill;
  width: number;
  height: number;
};

export type ScreenNode = {
  id: string;
  name: string;
  type: "screen";
  children: string[];
} & ScreenStyle;

const screenDefaults: Omit<ScreenNode, "id" | "type"> = {
  name: "Screen",
  children: [],
  x: 0,
  y: 0,
  fill: { type: "solid", color: { r: 255, g: 255, b: 255, a: 1 } },
  width: 390,
  height: 844,
};

export function createScreen(
  opts: Pick<ScreenNode, "id"> & Partial<Omit<ScreenNode, "id" | "type">>,
): ScreenNode {
  return { type: "screen", ...screenDefaults, ...opts };
}

export function screenStyle(style: ScreenStyle) {
  return [
    fillStyle(style.fill),
    `width: ${style.width}px`,
    `height: ${style.height}px`,
  ].join("; ");
}
