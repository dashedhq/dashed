<script lang="ts">
  import {
    CaseSensitiveIcon,
    MoveVerticalIcon,
    TextAlignCenterIcon,
    TextAlignEndIcon,
    TextAlignStartIcon,
    TypeIcon,
  } from "@lucide/svelte";
  import {
    applyUniformTextStyle,
    type Color,
    type ResolvedTextStyle,
    type TextNode,
    type TextStyle,
  } from "@opendesigner/core";
  import { ToggleGroup } from "bits-ui";
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";

  import ColorInput from "./color-input.svelte";
  import NumberInput from "./number-input.svelte";
  import { getActiveTextStyle, setTextStyle } from "./prosemirror";

  type Props = {
    node: TextNode;
    textEditorView: EditorView | null;
    textEditorState: EditorState | null;
  };

  let { node = $bindable(), textEditorView, textEditorState }: Props = $props();

  let activeStyle: ResolvedTextStyle = $derived.by(() => {
    if (textEditorState) {
      return getActiveTextStyle(textEditorState, node);
    }

    return {
      textAlign: node.textAlign,
      fontSize: node.fontSize,
      fontFamily: node.fontFamily,
      fontWeight: node.fontWeight,
      color: node.color,
      lineHeight: node.lineHeight,
      letterSpacing: node.letterSpacing,
    };
  });

  function changeTextStyle(style: Partial<TextStyle>) {
    if (textEditorView) {
      setTextStyle(textEditorView, style);
      return;
    }

    node = applyUniformTextStyle(node, style);
  }
</script>

{#if activeStyle}
  <div class="flex flex-col gap-2">
    <div class="text-neutral-50 text-sm">Typography</div>
    <div class="grid grid-cols-2 gap-2">
      <NumberInput
        placeholder={activeStyle.fontSize === "mixed" ? "Mixed" : undefined}
        bind:value={
          () =>
            activeStyle.fontSize === "mixed" ? null : activeStyle.fontSize,
          (v) => v != null && changeTextStyle({ fontSize: v })
        }
      >
        {#snippet startDecorator()}<TypeIcon />{/snippet}
      </NumberInput>
      <NumberInput
        placeholder={activeStyle.fontWeight === "mixed" ? "Mixed" : undefined}
        bind:value={
          () =>
            activeStyle.fontWeight === "mixed" ? null : activeStyle.fontWeight,
          (v) => v != null && changeTextStyle({ fontWeight: v })
        }
      >
        {#snippet startDecorator()}<span class="text-xs font-bold">W</span
          >{/snippet}
      </NumberInput>
      <NumberInput
        placeholder={activeStyle.lineHeight === "mixed" ? "Mixed" : undefined}
        bind:value={
          () =>
            activeStyle.lineHeight === "mixed" ? null : activeStyle.lineHeight,
          (v) => v != null && changeTextStyle({ lineHeight: v })
        }
      >
        {#snippet startDecorator()}<MoveVerticalIcon />{/snippet}
      </NumberInput>
      <NumberInput
        placeholder={activeStyle.letterSpacing === "mixed"
          ? "Mixed"
          : undefined}
        bind:value={
          () =>
            activeStyle.letterSpacing === "mixed"
              ? null
              : activeStyle.letterSpacing,
          (v) => v != null && changeTextStyle({ letterSpacing: v })
        }
      >
        {#snippet startDecorator()}<CaseSensitiveIcon />{/snippet}
      </NumberInput>
    </div>
    {#if activeStyle.color !== "mixed"}
      <ColorInput
        bind:value={
          () => activeStyle.color as Color, (c) => changeTextStyle({ color: c })
        }
      />
    {/if}
    <ToggleGroup.Root
      type="single"
      bind:value={
        () =>
          activeStyle.textAlign === "mixed" ? undefined : activeStyle.textAlign,
        (v) => changeTextStyle({ textAlign: v })
      }
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
{/if}
