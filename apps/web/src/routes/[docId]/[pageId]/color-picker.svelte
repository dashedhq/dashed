<script lang="ts">
  import {
    type Color,
    colorEquals,
    colorToHex,
    colorToHsva,
    hexToColor,
    hsvaToColor,
    tryHexToColor,
  } from "@dashedhq/core";
  import { PipetteIcon } from "@lucide/svelte";
  import { untrack } from "svelte";

  import { Button } from "$lib/components/ui/button";
  import { clamp } from "$lib/utils";

  import NumberInput from "./number-input.svelte";

  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  async function handlePickColor() {
    // @ts-expect-error EyeDropper API not in all TS libs
    const dropper = new EyeDropper();
    try {
      const { sRGBHex } = await dropper.open();
      const color = hexToColor(sRGBHex);
      onValueChange({ ...color, a: value.a });
    } catch {
      // user cancelled
    }
  }

  type Props = {
    value: Color;
    onValueChange: (v: Color) => void;
    onChangeStart: () => void;
    onChangeEnd: () => void;
  };

  let { value, onValueChange, onChangeStart, onChangeEnd }: Props = $props();

  // hsva is state (not derived) because the RGB to HSVA conversion is lossy:
  // multiple HSVA values map to the same RGB (e.g. any hue at s=0 is grey).
  // A derived would recompute on every external update, discarding the user's
  // hue/saturation during drag. Instead we sync from the prop only when the
  // resulting RGB actually differs.
  // svelte-ignore state_referenced_locally
  let hsva = $state(colorToHsva(value));

  $effect(() => {
    const incoming = value;

    // Avoid tracking hsva so this effect only re-runs when the prop changes,
    // not on every hsva update.
    untrack(() => {
      if (colorEquals(incoming, hsvaToColor(hsva))) {
        return;
      }

      hsva = colorToHsva(incoming);
    });
  });

  const HUE_MAX = 359;
  const ALPHA_MAX = 100;

  function getSliderValue(e: PointerEvent, max: number) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    return Math.round((x / rect.width) * max);
  }

  function updateSV(e: PointerEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);
    hsva.s = Math.round((x / rect.width) * 100);
    hsva.v = Math.round(100 - (y / rect.height) * 100);
    onValueChange(hsvaToColor(hsva));
  }

  function updateHue(e: PointerEvent) {
    hsva.h = getSliderValue(e, HUE_MAX);
    onValueChange(hsvaToColor(hsva));
  }

  function updateAlpha(e: PointerEvent) {
    hsva.a = getSliderValue(e, ALPHA_MAX) / ALPHA_MAX;
    onValueChange(hsvaToColor(hsva));
  }

  let draftColor = $derived(colorToHex(value));
</script>

<div class="flex flex-col gap-4">
  <!--svelte-ignore a11y_role_has_required_aria_props-->
  <div
    role="slider"
    tabindex="0"
    aria-valuetext="{Math.round(hsva.s)}% saturation, {Math.round(
      hsva.v,
    )}% brightness"
    class="relative aspect-square rounded select-none touch-none"
    style="background:
      linear-gradient(to top, black, transparent),
      linear-gradient(to right, white, transparent),
      hsl({hsva.h}, 100%, 50%)"
    onpointerdown={(e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      onChangeStart();
      updateSV(e);
    }}
    onpointermove={(e) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
        return;
      }
      updateSV(e);
    }}
    onpointerup={onChangeEnd}
  >
    <div
      class="absolute inset-0 rounded bg-linear-to-r from-white to-transparent"
    ></div>
    <div
      class="absolute inset-0 rounded bg-linear-to-t from-black to-transparent"
    ></div>
    <div
      class="absolute rounded-full size-4 border-4 -translate-x-1/2 -translate-y-1/2 border-neutral-50 shadow-xl"
      style="
        left: {hsva.s}%;
        top: {100 - hsva.v}%;
        background-color: {colorToHex(value)}"
    ></div>
  </div>
  <div class="flex gap-4 items-center">
    {#if hasEyeDropper}
      <Button size="icon-md" onclick={handlePickColor}>
        <PipetteIcon />
      </Button>
    {/if}
    <div class="flex flex-1 flex-col gap-4">
      <div
        role="slider"
        tabindex="0"
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={HUE_MAX}
        aria-valuenow={hsva.h}
        class="w-full h-3 rounded-full relative select-none touch-none"
        style="
      background: linear-gradient(to right,
        hsl(0, 100%, 50%),
        hsl(60, 100%, 50%),
        hsl(120, 100%, 50%),
        hsl(180, 100%, 50%),
        hsl(240, 100%, 50%),
        hsl(300, 100%, 50%),
        hsl(360, 100%, 50%)
      )"
        onpointerdown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onChangeStart();
          updateHue(e);
        }}
        onpointermove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
            return;
          }
          updateHue(e);
        }}
        onpointerup={onChangeEnd}
      >
        <div
          class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full border-4 border-neutral-50 shadow-xl"
          style="left: {(hsva.h / HUE_MAX) *
            100}%; background-color: hsl({hsva.h}, 100%, 50%)"
        ></div>
      </div>
      <div
        role="slider"
        tabindex="0"
        aria-label="Opacity"
        aria-valuemin={0}
        aria-valuemax={ALPHA_MAX}
        aria-valuenow={Math.round(hsva.a * ALPHA_MAX)}
        class="w-full h-3 rounded-full relative select-none touch-none bg-size-[auto,8px_8px]"
        style="
      background-image:
        linear-gradient(to right, transparent, {colorToHex(hsvaToColor(hsva))}),
        repeating-conic-gradient(var(--color-neutral-600) 0% 25%, transparent 0% 50%);"
        onpointerdown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onChangeStart();
          updateAlpha(e);
        }}
        onpointermove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
            return;
          }
          updateAlpha(e);
        }}
        onpointerup={onChangeEnd}
      >
        <div
          class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full bg-neutral-50 shadow-xl"
          style="left: {hsva.a * ALPHA_MAX}%"
        ></div>
      </div>
    </div>
  </div>

  <div class="flex gap-2">
    <input
      class="min-w-0 flex-1 outline-none text-neutral-50 text-sm border border-neutral-700 rounded-md px-2 h-7 flex items-center gap-2 focus:border-blue-500"
      bind:value={draftColor}
      onblur={() => {
        const color = tryHexToColor(draftColor);
        if (color) {
          onValueChange({ ...color, a: value.a });
        }
        draftColor = colorToHex(value);
      }}
    />

    <NumberInput
      class="w-24"
      value={Math.round(value.a * 100)}
      onValueChange={(v) => {
        if (v === null) {
          return;
        }
        onValueChange({ ...value, a: Math.round(v) / 100 });
      }}
    >
      {#snippet startDecorator()}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 3l0 18" />
          <path d="M12 9l4.65 -4.65" />
          <path d="M12 14.3l7.37 -7.37" />
          <path d="M12 19.6l8.85 -8.85" />
        </svg>
      {/snippet}
    </NumberInput>
  </div>
</div>
