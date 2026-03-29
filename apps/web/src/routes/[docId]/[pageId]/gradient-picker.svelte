<script lang="ts">
  import {
    addGradientStop,
    colorToCss,
    type LinearGradient,
    linearGradientToCss,
    removeGradientStop,
    updateGradientStop,
  } from "@dashedhq/core";
  import { MinusIcon, PlusIcon } from "@lucide/svelte";

  import { Button } from "$lib/components/ui/button";
  import { clamp } from "$lib/utils";

  import ColorInput from "./color-input.svelte";
  import { generateStopId } from "./editor-state.svelte";
  import NumberInput from "./number-input.svelte";

  type Props = {
    value: LinearGradient;
    onValueChange: (v: LinearGradient) => void;
    onChangeStart: () => void;
    onChangeEnd: () => void;
  };

  let { value, onValueChange, onChangeStart, onChangeEnd }: Props = $props();

  // -- 2D endpoint scrub area --

  let draggingEndpoint = $state<"start" | "end" | null>(null);

  function getEndpointPos(
    e: PointerEvent & { currentTarget: EventTarget & HTMLDivElement },
  ): { x: number; y: number } {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
    };
  }

  function handleEndpointDown(e: PointerEvent, which: "start" | "end") {
    e.stopPropagation();
    draggingEndpoint = which;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onChangeStart();
  }

  function handleEndpointMove(
    e: PointerEvent & { currentTarget: EventTarget & HTMLDivElement },
  ) {
    if (!draggingEndpoint) {
      return;
    }
    const pos = getEndpointPos(e);
    onValueChange({ ...value, [draggingEndpoint]: pos });
  }

  function handleEndpointUp() {
    if (!draggingEndpoint) {
      return;
    }
    draggingEndpoint = null;
    onChangeEnd();
  }

  // -- Stop bar --

  let barEl: HTMLDivElement;
  let draggingStopId = $state<string | null>(null);

  function barOffset(e: PointerEvent): number {
    const rect = barEl.getBoundingClientRect();
    return clamp((e.clientX - rect.left) / rect.width, 0, 1);
  }

  function handleBarClick(e: PointerEvent) {
    const offset = barOffset(e);

    // Don't add if too close to an existing stop
    if (value.stops.some((s) => Math.abs(s.offset - offset) < 0.05)) {
      return;
    }

    onValueChange(addGradientStop(value, generateStopId(), offset));
  }

  function handleStopDown(e: PointerEvent, id: string) {
    e.stopPropagation();
    draggingStopId = id;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onChangeStart();
  }

  function handleStopMove(e: PointerEvent) {
    if (draggingStopId === null) {
      return;
    }
    onValueChange(
      updateGradientStop(value, draggingStopId, { offset: barOffset(e) }),
    );
  }

  function handleStopUp() {
    if (draggingStopId === null) {
      return;
    }
    draggingStopId = null;
    onChangeEnd();
  }

  const barGradient = $derived(
    `linear-gradient(to right, ${value.stops
      .map((s) => `${colorToCss(s.color)} ${Math.round(s.offset * 100)}%`)
      .join(", ")})`,
  );
</script>

<div class="flex flex-col gap-4">
  <!-- 2D endpoint scrub area -->
  <div
    role="group"
    aria-label="Gradient direction"
    class="relative aspect-square rounded select-none touch-none"
    style="background: {linearGradientToCss(value)}"
    onpointermove={handleEndpointMove}
    onpointerup={handleEndpointUp}
  >
    <svg class="absolute inset-0 w-full h-full pointer-events-none">
      <line
        x1="{value.start.x * 100}%"
        y1="{value.start.y * 100}%"
        x2="{value.end.x * 100}%"
        y2="{value.end.y * 100}%"
        stroke="white"
        stroke-width="1"
        stroke-opacity="0.6"
      />
    </svg>

    <button
      aria-label="Gradient start"
      class="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-neutral-50 shadow-xl cursor-grab active:cursor-grabbing appearance-none p-0"
      style="left: {value.start.x * 100}%; top: {value.start.y *
        100}%; background: {colorToCss(value.stops[0].color)}"
      onpointerdown={(e) => handleEndpointDown(e, "start")}
    ></button>

    <button
      aria-label="Gradient end"
      class="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-neutral-50 shadow-xl cursor-grab active:cursor-grabbing appearance-none p-0"
      style="left: {value.end.x * 100}%; top: {value.end.y *
        100}%; background: {colorToCss(
        value.stops[value.stops.length - 1].color,
      )}"
      onpointerdown={(e) => handleEndpointDown(e, "end")}
    ></button>
  </div>

  <!-- Gradient bar with draggable stop markers -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={barEl}
    class="relative h-3 rounded-full select-none touch-none cursor-crosshair"
    style="background: {barGradient}"
    onpointerdown={handleBarClick}
  >
    {#each value.stops as stop (stop.id)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full shadow-xl cursor-grab active:cursor-grabbing border-4 border-neutral-50"
        style="left: {stop.offset * 100}%; background: {colorToCss(stop.color)}"
        onpointerdown={(e) => handleStopDown(e, stop.id)}
        onpointermove={handleStopMove}
        onpointerup={handleStopUp}
      ></div>
    {/each}
  </div>

  <!-- Stop list -->
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <div class="text-neutral-50 text-sm">Stops</div>
      <Button
        size="icon-md"
        onclick={() =>
          onValueChange(addGradientStop(value, generateStopId(), 0.5))}
        ><PlusIcon /></Button
      >
    </div>
    {#each value.stops as stop (stop.id)}
      <div class="flex items-center gap-2">
        <NumberInput
          class="w-14"
          value={Math.round(stop.offset * 100)}
          onValueChange={(v) =>
            onValueChange(
              updateGradientStop(value, stop.id, { offset: v / 100 }),
            )}
        />
        <ColorInput
          class="flex-1"
          value={stop.color}
          onValueChange={(c) =>
            onValueChange(updateGradientStop(value, stop.id, { color: c }))}
          {onChangeStart}
          {onChangeEnd}
        />
        <Button
          size="icon-md"
          disabled={value.stops.length <= 2}
          onclick={() => onValueChange(removeGradientStop(value, stop.id))}
          ><MinusIcon /></Button
        >
      </div>
    {/each}
  </div>
</div>
