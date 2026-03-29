<script lang="ts">
  import type { Effect, FrameNode } from "@dashedhq/core";
  import {
    BetweenHorizontalStartIcon,
    EyeIcon,
    FoldHorizontalIcon,
    FoldVerticalIcon,
    PanelBottomDashedIcon,
    PanelLeftDashedIcon,
    PanelRightDashedIcon,
    PanelTopDashedIcon,
    PlusIcon,
    RotateCwIcon,
    SquareDashedTopSolidIcon,
    SquareRoundCornerIcon,
    UnfoldHorizontalIcon,
    UnfoldVerticalIcon,
  } from "@lucide/svelte";
  import { DropdownMenu } from "bits-ui";

  import { Button } from "$lib/components/ui/button";

  import BlendModePicker from "./blend-mode-picker.svelte";
  import BorderStylePicker from "./border-style-picker.svelte";
  import ColorInput from "./color-input.svelte";
  import {
    generateEffectId,
    generateFillId,
    getEditorState,
  } from "./editor-state.svelte";
  import EffectLayerList from "./effect-layer-list.svelte";
  import FillLayerList from "./fill-layer-list.svelte";
  import LayoutAlignmentPicker from "./layout-alignment-picker.svelte";
  import LayoutPicker from "./layout-picker.svelte";
  import NumberInput from "./number-input.svelte";
  import OverflowPicker from "./overflow-picker.svelte";
  import PositionPicker from "./position-picker.svelte";
  import SizeInput from "./size-input.svelte";

  const effectOptions: { type: Effect["type"]; label: string }[] = [
    { type: "drop-shadow", label: "Drop Shadow" },
    { type: "inner-shadow", label: "Inner Shadow" },
    { type: "blur", label: "Blur" },
    { type: "backdrop-blur", label: "Backdrop Blur" },
  ];

  function defaultEffect(type: Effect["type"]): Effect {
    switch (type) {
      case "blur":
        return { type: "blur", blur: 4 };
      case "backdrop-blur":
        return { type: "backdrop-blur", blur: 4 };
      case "drop-shadow":
        return {
          type: "drop-shadow",
          shadow: {
            color: { r: 0, g: 0, b: 0, a: 0.25 },
            x: 0,
            y: 4,
            blur: 8,
            spread: 0,
          },
        };
      case "inner-shadow":
        return {
          type: "inner-shadow",
          shadow: {
            color: { r: 0, g: 0, b: 0, a: 0.25 },
            x: 0,
            y: 2,
            blur: 4,
            spread: 0,
          },
        };
    }
  }

  type Props = {
    frame: FrameNode;
  };

  let { frame }: Props = $props();
  const editor = getEditorState();

  const hasBlur = $derived(frame.effects.some((l) => l.effect.type === "blur"));
  const hasBackdropBlur = $derived(
    frame.effects.some((l) => l.effect.type === "backdrop-blur"),
  );
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <div class="text-neutral-50 text-sm">Background</div>
    <Button
      size="icon-md"
      onclick={() =>
        editor.updateFrame(frame.id, (n) => {
          n.fills = [
            ...n.fills,
            {
              id: generateFillId(),
              fill: { type: "solid", color: { r: 0, g: 0, b: 0, a: 1 } },
              visible: true,
            },
          ];
        })}><PlusIcon /></Button
    >
  </div>
  <FillLayerList
    value={frame.fills}
    onValueChange={(layers) =>
      editor.updateFrame(frame.id, (n) => (n.fills = layers))}
    onChangeStart={() => editor.beginPatch()}
    onChangeEnd={() => editor.commitPatch()}
  />
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Size</div>
  <div class="grid grid-cols-2 gap-2">
    <SizeInput
      notation="W"
      value={frame.dimensions.width}
      resolvedValue={editor.nodeMeasurements?.offsetWidth}
      onValueChange={(v) => editor.resizeNode(frame.id, { width: v })}
    />
    <SizeInput
      notation="H"
      value={frame.dimensions.height}
      resolvedValue={editor.nodeMeasurements?.offsetHeight}
      onValueChange={(v) => editor.resizeNode(frame.id, { height: v })}
    />
    <NumberInput
      value={frame.dimensions.minWidth}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.dimensions.minWidth = v))}
    >
      {#snippet startDecorator()}<FoldHorizontalIcon />{/snippet}
    </NumberInput>
    <NumberInput
      value={frame.dimensions.minHeight}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.dimensions.minHeight = v))}
    >
      {#snippet startDecorator()}<FoldVerticalIcon />{/snippet}
    </NumberInput>
    <NumberInput
      value={frame.dimensions.maxWidth === "none"
        ? null
        : frame.dimensions.maxWidth}
      placeholder="None"
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.dimensions.maxWidth = v))}
    >
      {#snippet startDecorator()}<UnfoldHorizontalIcon />{/snippet}
    </NumberInput>
    <NumberInput
      value={frame.dimensions.maxHeight === "none"
        ? null
        : frame.dimensions.maxHeight}
      placeholder="None"
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.dimensions.maxHeight = v))}
    >
      {#snippet startDecorator()}<UnfoldVerticalIcon />{/snippet}
    </NumberInput>
  </div>
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Layout</div>
  <LayoutPicker
    value={frame.layout}
    onValueChange={(v) => editor.updateFrame(frame.id, (n) => (n.layout = v))}
  />
  <div class="grid grid-cols-2 gap-2">
    <LayoutAlignmentPicker
      value={frame.layout}
      onValueChange={(v) => editor.updateFrame(frame.id, (n) => (n.layout = v))}
    />
    <NumberInput
      value={frame.layout.gap}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.layout.gap = v))}
    >
      {#snippet startDecorator()}
        <BetweenHorizontalStartIcon />
      {/snippet}
    </NumberInput>
  </div>
  <div class="grid grid-cols-2 gap-2">
    <NumberInput
      value={frame.padding.left}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.padding.left = v))}
    >
      {#snippet startDecorator()}
        <PanelLeftDashedIcon />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.padding.top}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.padding.top = v))}
    >
      {#snippet startDecorator()}
        <PanelTopDashedIcon />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.padding.right}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.padding.right = v))}
    >
      {#snippet startDecorator()}
        <PanelRightDashedIcon />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.padding.bottom}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.padding.bottom = v))}
    >
      {#snippet startDecorator()}
        <PanelBottomDashedIcon />
      {/snippet}
    </NumberInput>
    <OverflowPicker
      value={frame.overflow}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.overflow = v))}
    />
  </div>
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Position</div>
  <PositionPicker
    value={frame.position}
    onValueChange={(v) => editor.updateFrame(frame.id, (n) => (n.position = v))}
  />
  {#if frame.position.type === "absolute"}
    <div class="grid grid-cols-2 gap-2">
      <NumberInput
        value={frame.position.insets.left === "auto"
          ? null
          : frame.position.insets.left}
        placeholder="Auto"
        onValueChange={(v) =>
          editor.updateFrame(frame.id, (n) => {
            if (n.position.type === "absolute") {
              n.position.insets.left = v ?? "auto";
            }
          })}
      >
        {#snippet startDecorator()}
          <PanelLeftDashedIcon />
        {/snippet}
      </NumberInput>
      <NumberInput
        value={frame.position.insets.top === "auto"
          ? null
          : frame.position.insets.top}
        placeholder="Auto"
        onValueChange={(v) =>
          editor.updateFrame(frame.id, (n) => {
            if (n.position.type === "absolute") {
              n.position.insets.top = v ?? "auto";
            }
          })}
      >
        {#snippet startDecorator()}
          <PanelTopDashedIcon />
        {/snippet}
      </NumberInput>
      <NumberInput
        value={frame.position.insets.right === "auto"
          ? null
          : frame.position.insets.right}
        placeholder="Auto"
        onValueChange={(v) =>
          editor.updateFrame(frame.id, (n) => {
            if (n.position.type === "absolute") {
              n.position.insets.right = v ?? "auto";
            }
          })}
      >
        {#snippet startDecorator()}
          <PanelRightDashedIcon />
        {/snippet}
      </NumberInput>
      <NumberInput
        value={frame.position.insets.bottom === "auto"
          ? null
          : frame.position.insets.bottom}
        placeholder="Auto"
        onValueChange={(v) =>
          editor.updateFrame(frame.id, (n) => {
            if (n.position.type === "absolute") {
              n.position.insets.bottom = v ?? "auto";
            }
          })}
      >
        {#snippet startDecorator()}
          <PanelBottomDashedIcon />
        {/snippet}
      </NumberInput>
    </div>
  {/if}
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Appearance</div>
  <div class="grid grid-cols-2 gap-2">
    <NumberInput
      value={Math.round(frame.opacity * 100)}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.opacity = Math.round(v) / 100))}
    >
      {#snippet startDecorator()}
        <EyeIcon />
      {/snippet}
    </NumberInput>
    <BlendModePicker
      value={frame.blendMode}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.blendMode = v))}
    />
    <NumberInput
      value={frame.borderRadius.topLeft}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borderRadius.topLeft = v))}
    >
      {#snippet startDecorator()}
        <SquareRoundCornerIcon class="-rotate-90" />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.borderRadius.topRight}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borderRadius.topRight = v))}
    >
      {#snippet startDecorator()}
        <SquareRoundCornerIcon />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.borderRadius.bottomLeft}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borderRadius.bottomLeft = v))}
    >
      {#snippet startDecorator()}
        <SquareRoundCornerIcon class="rotate-180" />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.borderRadius.bottomRight}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borderRadius.bottomRight = v))}
    >
      {#snippet startDecorator()}
        <SquareRoundCornerIcon class="rotate-90" />
      {/snippet}
    </NumberInput>
  </div>
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Transform</div>
  <div class="grid grid-cols-2 gap-2">
    <NumberInput
      value={frame.rotation}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.rotation = v))}
    >
      {#snippet startDecorator()}
        <RotateCwIcon />
      {/snippet}
    </NumberInput>
  </div>
</div>
<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <div class="text-neutral-50 text-sm">Effects</div>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button size="icon-md" {...props}><PlusIcon /></Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          class="rounded-lg shadow-md bg-neutral-800 border border-neutral-700 p-1 z-10"
          sideOffset={4}
          align="end"
        >
          {#each effectOptions as option (option.type)}
            <DropdownMenu.Item
              disabled={(option.type === "blur" && hasBlur) ||
                (option.type === "backdrop-blur" && hasBackdropBlur)}
              class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-disabled:text-neutral-600 data-disabled:cursor-not-allowed"
              onSelect={() =>
                editor.updateFrame(frame.id, (n) => {
                  n.effects = [
                    ...n.effects,
                    {
                      id: generateEffectId(),
                      effect: defaultEffect(option.type),
                      visible: true,
                    },
                  ];
                })}
            >
              {option.label}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
  <EffectLayerList
    value={frame.effects}
    onValueChange={(layers) =>
      editor.updateFrame(frame.id, (n) => (n.effects = layers))}
    onChangeStart={() => editor.beginPatch()}
    onChangeEnd={() => editor.commitPatch()}
  />
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Borders</div>
  <div class="grid grid-cols-2 gap-2">
    <ColorInput
      value={frame.borders.color}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borders.color = v))}
      onChangeStart={() => editor.beginPatch()}
      onChangeEnd={() => editor.commitPatch()}
    />
    <BorderStylePicker
      value={frame.borders.style}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borders.style = v))}
    />
    <NumberInput
      value={frame.borders.widths.left}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borders.widths.left = v))}
    >
      {#snippet startDecorator()}
        <SquareDashedTopSolidIcon class="-rotate-90" />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.borders.widths.top}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borders.widths.top = v))}
    >
      {#snippet startDecorator()}
        <SquareDashedTopSolidIcon />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.borders.widths.right}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borders.widths.right = v))}
    >
      {#snippet startDecorator()}
        <SquareDashedTopSolidIcon class="rotate-90" />
      {/snippet}
    </NumberInput>
    <NumberInput
      value={frame.borders.widths.bottom}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.borders.widths.bottom = v))}
    >
      {#snippet startDecorator()}
        <SquareDashedTopSolidIcon class="rotate-180" />
      {/snippet}
    </NumberInput>
  </div>
</div>
