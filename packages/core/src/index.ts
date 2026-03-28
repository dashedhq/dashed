import { type FrameNode, frameStyle } from "./frame";
import { type ScreenNode, screenStyle } from "./screen";
import { type TextNode, textStyle } from "./text";

export type Node = FrameNode | TextNode | ScreenNode;

export function nodeStyle(node: Node) {
  if (node.type === "frame") {
    return frameStyle(node);
  }
  if (node.type === "screen") {
    return screenStyle(node);
  }
  return textStyle(node);
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

export {
  type FrameNode,
  type FrameStyle,
  frameStyle,
  createFrame,
} from "./frame";
export {
  type TextNode,
  type TextRun,
  type RunStyle,
  type Paragraph,
  type ParagraphStyle,
  type TypographyStyle,
  type TextStyle,
  type TextAlign,
  type TextDecoration,
  type TextTransform,
  type FontStyle,
  type CommonRunStyle,
  type CommonParagraphStyle,
  type CommonTypographyStyle,
  runStyle,
  paragraphStyle,
  textStyle,
  createText,
  effectiveRun,
  effectiveParagraph,
  applyUniformTypographyStyle,
  normalizeTextNode,
  commonRunStyle,
  commonParagraphStyle,
  hasRunStyleOverrides,
  hasParagraphStyleOverrides,
} from "./text";
export {
  type Fill,
  type FillLayer,
  type GradientStop,
  type ImageFill,
  type SolidFill,
  type LinearGradient,
  type LinearGradientFill,
  type Image,
  normalizeLinearGradient,
  linearGradientEquals,
  addGradientStop,
  removeGradientStop,
  updateGradientStop,
  imageEquals,
  fillStyle,
  fillsStyle,
  fillsEquals,
  fillLayersStyle,
  fillLayersEquals,
  linearGradientToCss,
  imageToCss,
  fillEquals,
  gradientStopPosition,
} from "./styles/fill";
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
export {
  type Shadow,
  type ShadowLayer,
  type TextShadow,
  type TextShadowLayer,
  type BlendMode,
  shadowStyle,
  shadowsStyle,
  shadowLayersStyle,
  opacityStyle,
  blendModeStyle,
  blurStyle,
  backdropBlurStyle,
  rotationStyle,
  textShadowStyle,
  textShadowsStyle,
  textShadowLayersStyle,
} from "./styles/effect";
export {
  type StackLayout,
  type StackAlignment,
  type StackDistribution,
  type StackDirection,
  type Layout,
  type FixedSize,
  type HugSize,
  type FillSize,
  type Size,
  type Dimensions,
  type Padding,
  type AutoPosition,
  type AbsolutePosition,
  type Position,
  type Insets,
  type InsetValue,
  layoutStyle,
  dimensionsStyle,
  paddingStyle,
  type Overflow,
  overflowStyle,
  positionStyle,
} from "./styles/layout";
export {
  type ScreenNode,
  type ScreenStyle,
  screenStyle,
  createScreen,
} from "./screen";
