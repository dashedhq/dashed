import { type Color, colorToCss } from "./color";

export type Shadow = {
  color: Color;
  x: number;
  y: number;
  blur: number;
  spread: number;
};

export type ShadowLayer = {
  id: string;
  shadow: Shadow;
};

export type BlurEffect = { type: "blur"; blur: number };
export type BackdropBlurEffect = { type: "backdrop-blur"; blur: number };
export type DropShadowEffect = { type: "drop-shadow"; shadow: Shadow };
export type InnerShadowEffect = { type: "inner-shadow"; shadow: Shadow };

export type Effect =
  | BlurEffect
  | BackdropBlurEffect
  | DropShadowEffect
  | InnerShadowEffect;

export type EffectLayer = {
  id: string;
  effect: Effect;
  visible: boolean;
};

function shadowValue(shadow: Shadow) {
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${colorToCss(shadow.color)}`;
}

export function dropShadowStyle(shadow: Shadow) {
  return `box-shadow: ${shadowValue(shadow)}`;
}

export function innerShadowStyle(shadow: Shadow) {
  return `box-shadow: ${innerShadowValue(shadow)}`;
}

export function shadowsStyle(shadows: Shadow[]) {
  if (shadows.length === 0) {
    return "";
  }
  return `box-shadow: ${shadows.map(shadowValue).join(", ")}`;
}

export function shadowLayersStyle(layers: ShadowLayer[]) {
  return shadowsStyle(layers.map((l) => l.shadow));
}

function innerShadowValue(shadow: Shadow) {
  return `inset ${shadowValue(shadow)}`;
}

export function effectStyle(effect: Effect): string {
  switch (effect.type) {
    case "blur":
      return blurStyle(effect.blur);
    case "backdrop-blur":
      return backdropBlurStyle(effect.blur);
    case "drop-shadow":
      return `box-shadow: ${shadowValue(effect.shadow)}`;
    case "inner-shadow":
      return `box-shadow: ${innerShadowValue(effect.shadow)}`;
  }
}

function effectsStyle(effects: Effect[]): string {
  const parts: string[] = [];
  const boxShadowValues: string[] = [];

  for (const effect of effects) {
    switch (effect.type) {
      case "blur": {
        const s = blurStyle(effect.blur);
        if (s) {
          parts.push(s);
        }
        break;
      }
      case "backdrop-blur": {
        const s = backdropBlurStyle(effect.blur);
        if (s) {
          parts.push(s);
        }
        break;
      }
      case "drop-shadow":
        boxShadowValues.push(shadowValue(effect.shadow));
        break;
      case "inner-shadow":
        boxShadowValues.push(innerShadowValue(effect.shadow));
        break;
    }
  }

  if (boxShadowValues.length > 0) {
    parts.push(`box-shadow: ${boxShadowValues.join(", ")}`);
  }

  return parts.join("; ");
}

export function effectLayersStyle(layers: EffectLayer[]): string {
  return effectsStyle(layers.filter((l) => l.visible).map((l) => l.effect));
}

export function opacityStyle(opacity: number) {
  if (opacity === 1) {
    return "";
  }

  return `opacity: ${opacity}`;
}

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export function blendModeStyle(blendMode: BlendMode) {
  if (blendMode === "normal") {
    return "";
  }
  return `mix-blend-mode: ${blendMode}`;
}

export function blurStyle(blur: number) {
  if (blur === 0) {
    return "";
  }
  return `filter: blur(${blur}px)`;
}

export function backdropBlurStyle(backdropBlur: number) {
  if (backdropBlur === 0) {
    return "";
  }
  return `backdrop-filter: blur(${backdropBlur}px)`;
}

export type TextShadow = {
  color: Color;
  x: number;
  y: number;
  blur: number;
};

export type TextShadowLayer = {
  id: string;
  shadow: TextShadow;
};

function textShadowValue(shadow: TextShadow) {
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${colorToCss(shadow.color)}`;
}

export function textShadowStyle(shadow: TextShadow) {
  return `text-shadow: ${textShadowValue(shadow)}`;
}

export function textShadowsStyle(shadows: TextShadow[]) {
  if (shadows.length === 0) {
    return "";
  }
  return `text-shadow: ${shadows.map(textShadowValue).join(", ")}`;
}

export function textShadowLayersStyle(layers: TextShadowLayer[]) {
  return textShadowsStyle(layers.map((l) => l.shadow));
}

export type TextBlurEffect = { type: "blur"; blur: number };
export type TextBackdropBlurEffect = { type: "backdrop-blur"; blur: number };
export type TextDropShadowEffect = { type: "drop-shadow"; shadow: TextShadow };

export type TextEffect =
  | TextBlurEffect
  | TextBackdropBlurEffect
  | TextDropShadowEffect;

export type TextEffectLayer = {
  id: string;
  effect: TextEffect;
  visible: boolean;
};

export function textEffectStyle(effect: TextEffect): string {
  switch (effect.type) {
    case "blur":
      return blurStyle(effect.blur);
    case "backdrop-blur":
      return backdropBlurStyle(effect.blur);
    case "drop-shadow":
      return textShadowStyle(effect.shadow);
  }
}

function textEffectsStyle(effects: TextEffect[]): string {
  const parts: string[] = [];
  const textShadowValues: string[] = [];

  for (const effect of effects) {
    switch (effect.type) {
      case "blur": {
        const s = blurStyle(effect.blur);
        if (s) {
          parts.push(s);
        }
        break;
      }
      case "backdrop-blur": {
        const s = backdropBlurStyle(effect.blur);
        if (s) {
          parts.push(s);
        }
        break;
      }
      case "drop-shadow":
        textShadowValues.push(textShadowValue(effect.shadow));
        break;
    }
  }

  if (textShadowValues.length > 0) {
    parts.push(`text-shadow: ${textShadowValues.join(", ")}`);
  }

  return parts.join("; ");
}

export function textEffectLayersStyle(layers: TextEffectLayer[]): string {
  return textEffectsStyle(
    layers.filter((l) => l.visible).map((l) => l.effect),
  );
}

export function rotationStyle(rotation: number) {
  if (rotation === 0) {
    return "";
  }
  return `transform: rotate(${rotation}deg)`;
}
