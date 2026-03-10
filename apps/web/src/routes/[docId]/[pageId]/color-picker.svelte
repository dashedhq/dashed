<script lang="ts">
  import {
    type Color,
    colorEquals,
    colorToHex,
    colorToHsva,
    hsvaToColor,
  } from "@dashedhq/core";
  import { Slider } from "bits-ui";
  import { untrack } from "svelte";

  type Props = {
    value: Color;
  };

  let { value = $bindable() }: Props = $props();

  let hsva = $state(colorToHsva(value));

  $effect(() => {
    const incoming = value;

    untrack(() => {
      if (colorEquals(incoming, hsvaToColor(hsva))) {
        return;
      }

      hsva = colorToHsva(incoming);
    });
  });

  const updateFromPointer = (
    e: PointerEvent & {
      currentTarget: EventTarget & HTMLDivElement;
    },
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;
    hsva.s = s;
    hsva.v = v;
    value = hsvaToColor(hsva);
  };
</script>

<div class="flex flex-col gap-4">
  <div
    role="slider"
    tabindex="0"
    aria-valuetext="{Math.round(hsva.s)}% saturation, {Math.round(
      hsva.v,
    )}% brightness"
    class="relative aspect-square rounded select-none touch-none"
    style="background-color: hsl({hsva.h}, 100%, 50%)"
    onpointerdown={(e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      updateFromPointer(e);
    }}
    onpointermove={(e) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      updateFromPointer(e);
    }}
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
  <Slider.Root
    type="single"
    min={0}
    max={359}
    bind:value={
      () => hsva.h,
      (v) => {
        hsva.h = v;
        value = hsvaToColor(hsva);
      }
    }
    class="w-full h-4 rounded-full relative"
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
  >
    <Slider.Thumb
      index={0}
      class="w-4 h-4 rounded-full border-4 border-neutral-50 shadow-xl"
      style="background-color: hsl({hsva.h}, 100%, 50%)"
    />
  </Slider.Root>
  <Slider.Root
    type="single"
    min={0}
    max={100}
    bind:value={
      () => Math.round(hsva.a * 100),
      (v) => {
        hsva.a = v / 100;
        value = hsvaToColor(hsva);
      }
    }
    class="w-full h-4 rounded-full relative"
    style="
      background:
        linear-gradient(to right, transparent, {colorToHex(hsvaToColor(hsva))}),
        repeating-conic-gradient(var(--color-neutral-600) 0% 25%, transparent 0% 50%);
      background-size: auto, 8px 8px;"
  >
    <Slider.Thumb
      index={0}
      class="w-4 h-4 rounded-full border-4 border-neutral-50 shadow-xl"
    />
  </Slider.Root>
</div>
