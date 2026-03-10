<script lang="ts">
  import {
    BetweenHorizontalStartIcon,
    EyeIcon,
    PanelBottomDashedIcon,
    PanelLeftDashedIcon,
    PanelRightDashedIcon,
    PanelTopDashedIcon,
    SquareDashedTopSolidIcon,
    SquareRoundCornerIcon,
  } from "@lucide/svelte";
  import type { FrameNode } from "@opendesigner/core";

  import BorderStylePicker from "./border-style-picker.svelte";
  import ColorInput from "./color-input.svelte";
  import FillPicker from "./fill-picker.svelte";
  import LayoutAlignmentPicker from "./layout-alignment-picker.svelte";
  import LayoutPicker from "./layout-picker.svelte";
  import NumberInput from "./number-input.svelte";
  import SizeInput from "./size-input.svelte";

  type Props = {
    node: FrameNode;
  };

  let { node = $bindable() }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Background</div>
  <FillPicker bind:value={node.fill} />
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Size</div>
  <div class="grid grid-cols-2 gap-2">
    <SizeInput notation="W" bind:value={node.dimensions.width} />
    <SizeInput notation="H" bind:value={node.dimensions.height} />
  </div>
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Layout</div>
  <LayoutPicker bind:value={node.layout} />
  <div class="grid grid-cols-2 gap-2">
    <LayoutAlignmentPicker bind:value={node.layout} />
    <NumberInput bind:value={node.layout.gap}>
      {#snippet startDecorator()}
        <BetweenHorizontalStartIcon />
      {/snippet}
    </NumberInput>
  </div>
  <div class="grid grid-cols-2 gap-2">
    <NumberInput bind:value={node.padding.left}>
      {#snippet startDecorator()}
        <PanelLeftDashedIcon />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.padding.top}>
      {#snippet startDecorator()}
        <PanelTopDashedIcon />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.padding.right}>
      {#snippet startDecorator()}
        <PanelRightDashedIcon />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.padding.bottom}>
      {#snippet startDecorator()}
        <PanelBottomDashedIcon />
      {/snippet}
    </NumberInput>
  </div>
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Appearance</div>
  <NumberInput
    bind:value={() => node.opacity * 100, (v) => (node.opacity = v / 100)}
  >
    {#snippet startDecorator()}
      <EyeIcon />
    {/snippet}
  </NumberInput>
  <div class="grid grid-cols-2 gap-2">
    <NumberInput bind:value={node.borderRadius.topLeft}>
      {#snippet startDecorator()}
        <SquareRoundCornerIcon class="-rotate-90" />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.borderRadius.topRight}>
      {#snippet startDecorator()}
        <SquareRoundCornerIcon />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.borderRadius.bottomLeft}>
      {#snippet startDecorator()}
        <SquareRoundCornerIcon class="rotate-180" />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.borderRadius.bottomRight}>
      {#snippet startDecorator()}
        <SquareRoundCornerIcon class="rotate-90" />
      {/snippet}
    </NumberInput>
  </div>
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Borders</div>
  <div class="grid grid-cols-2 gap-2">
    <ColorInput bind:value={node.borders.color} />
    <BorderStylePicker bind:value={node.borders.style} />
    <NumberInput bind:value={node.borders.widths.left}>
      {#snippet startDecorator()}
        <SquareDashedTopSolidIcon class="-rotate-90" />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.borders.widths.top}>
      {#snippet startDecorator()}
        <SquareDashedTopSolidIcon />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.borders.widths.right}>
      {#snippet startDecorator()}
        <SquareDashedTopSolidIcon class="rotate-90" />
      {/snippet}
    </NumberInput>
    <NumberInput bind:value={node.borders.widths.bottom}>
      {#snippet startDecorator()}
        <SquareDashedTopSolidIcon class="rotate-180" />
      {/snippet}
    </NumberInput>
  </div>
</div>
