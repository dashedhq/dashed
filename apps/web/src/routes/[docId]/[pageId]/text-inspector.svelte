<script lang="ts">
  import type {
    TextAlign,
    TextDecoration,
    TextEffect,
    TextNode,
    TypographyStyle,
  } from "@dashedhq/core";
  import {
    CaseSensitiveIcon,
    EyeIcon,
    FoldHorizontalIcon,
    FoldVerticalIcon,
    MoveVerticalIcon,
    BaselineIcon,
    PlusIcon,
    RotateCwIcon,
    StrikethroughIcon,
    TextAlignCenterIcon,
    TextAlignEndIcon,
    TextAlignStartIcon,
    TypeIcon,
    UnderlineIcon,
    UnfoldHorizontalIcon,
    UnfoldVerticalIcon,
  } from "@lucide/svelte";
  import { DropdownMenu, ToggleGroup } from "bits-ui";

  import { Button } from "$lib/components/ui/button";

  import BlendModePicker from "./blend-mode-picker.svelte";
  import {
    generateEffectId,
    generateFillId,
    getEditorState,
  } from "./editor-state.svelte";
  import FillLayerList from "./fill-layer-list.svelte";
  import NumberInput from "./number-input.svelte";
  import SizeInput from "./size-input.svelte";
  import TextEffectLayerList from "./text-effect-layer-list.svelte";

  const textEffectOptions: { type: TextEffect["type"]; label: string }[] = [
    { type: "drop-shadow", label: "Drop Shadow" },
    { type: "blur", label: "Blur" },
    { type: "backdrop-blur", label: "Backdrop Blur" },
  ];

  function defaultTextEffect(type: TextEffect["type"]): TextEffect {
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
            y: 2,
            blur: 4,
          },
        };
    }
  }

  type Props = {
    text: TextNode;
  };

  let { text }: Props = $props();
  const editor = getEditorState();

  const hasBlur = $derived(text.effects.some((l) => l.effect.type === "blur"));
  const hasBackdropBlur = $derived(
    text.effects.some((l) => l.effect.type === "backdrop-blur"),
  );

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
        onValueChange={(v) => editor.resizeNode(text.id, { width: v })}
      />
      <SizeInput
        notation="H"
        value={text.dimensions.height}
        resolvedValue={editor.nodeMeasurements?.offsetHeight}
        onValueChange={(v) => editor.resizeNode(text.id, { height: v })}
      />
      <NumberInput
        value={text.dimensions.minWidth}
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.dimensions.minWidth = v))}
      >
        {#snippet startDecorator()}<FoldHorizontalIcon />{/snippet}
      </NumberInput>
      <NumberInput
        value={text.dimensions.minHeight}
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.dimensions.minHeight = v))}
      >
        {#snippet startDecorator()}<FoldVerticalIcon />{/snippet}
      </NumberInput>
      <NumberInput
        value={text.dimensions.maxWidth === "none"
          ? null
          : text.dimensions.maxWidth}
        placeholder="None"
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.dimensions.maxWidth = v))}
      >
        {#snippet startDecorator()}<UnfoldHorizontalIcon />{/snippet}
      </NumberInput>
      <NumberInput
        value={text.dimensions.maxHeight === "none"
          ? null
          : text.dimensions.maxHeight}
        placeholder="None"
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.dimensions.maxHeight = v))}
      >
        {#snippet startDecorator()}<UnfoldVerticalIcon />{/snippet}
      </NumberInput>
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
      <ToggleGroup.Root
        type="single"
        value={commonStyle.textAlign === "mixed"
          ? undefined
          : commonStyle.textAlign}
        onValueChange={(v) =>
          changeTypographyStyle({ textAlign: v as TextAlign })}
        class="grid grid-cols-3 bg-neutral-800 h-7 rounded-md"
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
      <ToggleGroup.Root
        type="single"
        value={commonStyle.textDecoration === "mixed"
          ? undefined
          : commonStyle.textDecoration}
        onValueChange={(v) =>
          changeTypographyStyle({ textDecoration: v as TextDecoration })}
        class="grid grid-cols-3 bg-neutral-800 h-7 rounded-md"
      >
        <ToggleGroup.Item
          value="none"
          class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
          ><BaselineIcon /></ToggleGroup.Item
        >
        <ToggleGroup.Item
          value="underline"
          class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
          ><UnderlineIcon /></ToggleGroup.Item
        >
        <ToggleGroup.Item
          value="line-through"
          class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
          ><StrikethroughIcon /></ToggleGroup.Item
        >
      </ToggleGroup.Root>
    </div>
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
            visible: true,
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
  <div class="flex flex-col gap-2">
    <div class="text-neutral-50 text-sm">Appearance</div>
    <div class="grid grid-cols-2 gap-2">
      <NumberInput
        value={Math.round(text.opacity * 100)}
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.opacity = Math.round(v) / 100))}
      >
        {#snippet startDecorator()}
          <EyeIcon />
        {/snippet}
      </NumberInput>
      <BlendModePicker
        value={text.blendMode}
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.blendMode = v))}
      />
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="text-neutral-50 text-sm">Transform</div>
    <div class="grid grid-cols-2 gap-2">
      <NumberInput
        value={text.rotation}
        onValueChange={(v) =>
          editor.updateText(text.id, (n) => (n.rotation = v))}
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
          >
            {#each textEffectOptions as option (option.type)}
              <DropdownMenu.Item
                disabled={(option.type === "blur" && hasBlur) ||
                  (option.type === "backdrop-blur" && hasBackdropBlur)}
                class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-disabled:text-neutral-600 data-disabled:cursor-not-allowed"
                onSelect={() =>
                  editor.updateText(text.id, (n) => {
                    n.effects = [
                      ...n.effects,
                      {
                        id: generateEffectId(),
                        effect: defaultTextEffect(option.type),
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
    <TextEffectLayerList
      value={text.effects}
      onValueChange={(layers) =>
        editor.updateText(text.id, (n) => (n.effects = layers))}
      onChangeStart={() => editor.beginPatch()}
      onChangeEnd={() => editor.commitPatch()}
    />
  </div>
{/if}
