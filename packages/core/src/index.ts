import { type FrameNode, frameStyle } from "./frame";
import { type ScreenNode, screenStyle } from "./screen";
import { type TextNode, textStyle } from "./text";

export type Node = FrameNode | TextNode | ScreenNode;

export function nodeStyle(node: Node) {
  if (node.type === "frame") return frameStyle(node);
  if (node.type === "screen") return screenStyle(node);
  return textStyle(node);
}

export function resolveChildren(
  nodes: Record<string, Node>,
  children: string[],
) {
  return children.map((id) => nodes[id]);
}

export type Document = {
  id: string;
  name: string;
  pages: PageMetadata[];
};

export type PageMetadata = {
  id: string;
  name: string;
};

export type Page = PageMetadata & {
  nodes: Record<string, Node>;
  children: string[];
};

export { type FrameNode, frameStyle, createFrame } from "./frame";
export {
  type TextNode,
  type TextRun,
  type TextRunStyle,
  type Paragraph,
  type ParagraphStyle,
  type TextStyle,
  type TextAlign,
  type ResolvedTextRunStyle,
  type ResolvedParagraphStyle,
  type ResolvedTextStyle,
  textRunStyle,
  paragraphStyle,
  textStyle,
  createText,
  applyUniformTextStyle,
  normalizeTextNode,
  resolveTextRunStyle,
  resolveParagraphStyle,
  hasTextRunStyleOverrides,
  hasParagraphStyleOverrides,
} from "./text";
export { type Fill, type GradientStop, fillStyle } from "./styles/fill";
export {
  type BorderStyle,
  type BorderWidths,
  type Borders,
  type BorderRadius,
  bordersStyle,
  borderRadiusStyle,
} from "./styles/border";
export {
  type Color,
  type Hsva,
  colorEquals,
  colorToCss,
  colorToHex,
  colorToHsva,
  cssToColor,
  tryCssToColor,
  hexToColor,
  tryHexToColor,
  hsvaToColor,
} from "./styles/color";
export { type Shadow, shadowStyle, opacityStyle } from "./styles/effect";
export {
  type StackLayout,
  type StackAlignment,
  type StackDistribution,
  type StackDirection,
  type Layout,
  type Size,
  type Dimensions,
  type Padding,
  layoutStyle,
  dimensionsStyle,
  paddingStyle,
} from "./styles/layout";
export {
  type ScreenNode,
  type ScreenStyle,
  screenStyle,
  createScreen,
} from "./screen";
