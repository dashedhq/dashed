import { type FillLayer, fillLayersStyle } from "./styles/fill";

export type ScreenStyle = {
  x: number;
  y: number;
  fills: FillLayer[];
  width: number;
  height: number;
};

export type ScreenNode = {
  id: string;
  name: string;
  type: "screen";
  visible: boolean;
  children: string[];
} & ScreenStyle;

const screenDefaults: Omit<ScreenNode, "id" | "type"> = {
  name: "Screen",
  visible: true,
  children: [],
  x: 0,
  y: 0,
  fills: [],
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
    fillLayersStyle(style.fills),
    `width: ${style.width}px`,
    `height: ${style.height}px`,
  ].join("; ");
}
