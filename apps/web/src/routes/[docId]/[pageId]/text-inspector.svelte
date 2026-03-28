<script lang="ts">
  import type { TextAlign, TextNode, TypographyStyle } from "@dashedhq/core";
  import {
    CaseSensitiveIcon,
    MoveVerticalIcon,
    PlusIcon,
    TextAlignCenterIcon,
    TextAlignEndIcon,
    TextAlignStartIcon,
    TypeIcon,
  } from "@lucide/svelte";
  import { ToggleGroup } from "bits-ui";

  import { Button } from "$lib/components/ui/button";

  import { generateFillId, getEditorState } from "./editor-state.svelte";
  import FillLayerList from "./fill-layer-list.svelte";
  import NumberInput from "./number-input.svelte";
  import SizeInput from "./size-input.svelte";

  type Props = {
    text: TextNode;
  };

  let { text }: Props = $props();
  const editor = getEditorState();

  const commonStyle = $derived(editor.commonTypographyStyle(text.id));

  function changeTypographyStyle(style: Partial<TypographyStyle>) {
    editor.applyTypographyStyle(text.id, style);
  }
</script>

{#if commonStyle}
  <div class="flex flex-col gap-2">
    <div class="text-neutral-50 text-sm">Size</div>
    <div class="grid grid-cols-2 gap-2">
      <SizeInput
        notation="W"
        value={text.dimensions.width}
        resolvedValue={editor.nodeMeasurements?.offsetWidth}
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.dimensions.width = v))}
      />
      <SizeInput
        notation="H"
        value={text.dimensions.height}
        resolvedValue={editor.nodeMeasurements?.offsetHeight}
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.dimensions.height = v))}
      />
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="text-neutral-50 text-sm">Typography</div>
    <div class="grid grid-cols-2 gap-2">
      <NumberInput
        placeholder={commonStyle.fontSize === "mixed" ? "Mixed" : undefined}
        value={commonStyle.fontSize === "mixed" ? null : commonStyle.fontSize}
        onValueChange={(v) => changeTypographyStyle({ fontSize: v })}
      >
        {#snippet startDecorator()}<TypeIcon />{/snippet}
      </NumberInput>
      <NumberInput
        placeholder={commonStyle.fontWeight === "mixed" ? "Mixed" : undefined}
        value={commonStyle.fontWeight === "mixed"
          ? null
          : commonStyle.fontWeight}
        onValueChange={(v) => changeTypographyStyle({ fontWeight: v })}
      >
        {#snippet startDecorator()}<span class="text-xs font-bold">W</span
          >{/snippet}
      </NumberInput>
      <NumberInput
        placeholder={commonStyle.lineHeight === "mixed" ? "Mixed" : undefined}
        value={commonStyle.lineHeight === "mixed"
          ? null
          : commonStyle.lineHeight}
        onValueChange={(v) => changeTypographyStyle({ lineHeight: v })}
      >
        {#snippet startDecorator()}<MoveVerticalIcon />{/snippet}
      </NumberInput>
      <NumberInput
        placeholder={commonStyle.letterSpacing === "mixed"
          ? "Mixed"
          : undefined}
        value={commonStyle.letterSpacing === "mixed"
          ? null
          : commonStyle.letterSpacing}
        onValueChange={(v) => changeTypographyStyle({ letterSpacing: v })}
      >
        {#snippet startDecorator()}<CaseSensitiveIcon />{/snippet}
      </NumberInput>
    </div>
    <ToggleGroup.Root
      type="single"
      value={commonStyle.textAlign === "mixed"
        ? undefined
        : commonStyle.textAlign}
      onValueChange={(v) =>
        changeTypographyStyle({ textAlign: v as TextAlign })}
      class="grid grid-cols-3 bg-neutral-800 h-8 rounded-md"
    >
      <ToggleGroup.Item
        value="start"
        class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
        ><TextAlignStartIcon /></ToggleGroup.Item
      >
      <ToggleGroup.Item
        value="center"
        class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
        ><TextAlignCenterIcon /></ToggleGroup.Item
      >
      <ToggleGroup.Item
        value="end"
        class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
        ><TextAlignEndIcon /></ToggleGroup.Item
      >
    </ToggleGroup.Root>
  </div>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <div class="text-neutral-50 text-sm">Fills</div>
      <Button
        size="icon-md"
        onclick={() => {
          const newFill = {
            id: generateFillId(),
            fill: { type: "solid" as const, color: { r: 0, g: 0, b: 0, a: 1 } },
          };
          if (commonStyle.fills === "mixed") {
            changeTypographyStyle({ fills: [newFill] });
          } else {
            changeTypographyStyle({ fills: [...commonStyle.fills, newFill] });
          }
        }}><PlusIcon /></Button
      >
    </div>
    {#if commonStyle.fills === "mixed"}
      <p class="text-xs text-neutral-400">
        Mixed fills across selection. Add a fill to apply uniformly.
      </p>
    {:else}
      <FillLayerList
        value={commonStyle.fills}
        onValueChange={(layers) => changeTypographyStyle({ fills: layers })}
        onChangeStart={() => editor.beginPatch()}
        onChangeEnd={() => editor.commitPatch()}
      />
    {/if}
  </div>
{/if}
