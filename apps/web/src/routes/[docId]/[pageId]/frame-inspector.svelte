<script lang="ts">
  import type { FrameNode } from "@dashedhq/core";
  import {
    BetweenHorizontalStartIcon,
    EyeIcon,
    PanelBottomDashedIcon,
    PanelLeftDashedIcon,
    PanelRightDashedIcon,
    PanelTopDashedIcon,
    PlusIcon,
    SquareDashedTopSolidIcon,
    SquareRoundCornerIcon,
  } from "@lucide/svelte";

  import { Button } from "$lib/components/ui/button";

  import BorderStylePicker from "./border-style-picker.svelte";
  import ColorInput from "./color-input.svelte";
  import { generateFillId, getEditorState } from "./editor-state.svelte";
  import FillLayerList from "./fill-layer-list.svelte";
  import LayoutAlignmentPicker from "./layout-alignment-picker.svelte";
  import LayoutPicker from "./layout-picker.svelte";
  import NumberInput from "./number-input.svelte";
  import SizeInput from "./size-input.svelte";

  type Props = {
    frame: FrameNode;
  };

  let { frame }: Props = $props();
  const editor = getEditorState();
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
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.dimensions.width = v))}
    />
    <SizeInput
      notation="H"
      value={frame.dimensions.height}
      resolvedValue={editor.nodeMeasurements?.offsetHeight}
      onValueChange={(v) =>
        editor.updateFrame(frame.id, (n) => (n.dimensions.height = v))}
    />
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
  </div>
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Appearance</div>
  <NumberInput
    value={Math.round(frame.opacity * 100)}
    onValueChange={(v) =>
      editor.updateFrame(frame.id, (n) => (n.opacity = Math.round(v) / 100))}
  >
    {#snippet startDecorator()}
      <EyeIcon />
    {/snippet}
  </NumberInput>
  <div class="grid grid-cols-2 gap-2">
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
