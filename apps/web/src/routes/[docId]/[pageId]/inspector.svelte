<script lang="ts">
  import { FrameIcon, SmartphoneIcon, TypeIcon } from "@lucide/svelte";
  import type { Node } from "@dashedhq/core";
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";

  import FrameInspector from "./frame-inspector.svelte";
  import ScreenInspector from "./screen-inspector.svelte";
  import TextInspector from "./text-inspector.svelte";

  type Props = {
    node: Node;
    textEditorView: EditorView | null;
    textEditorState: EditorState | null;
  };

  let { node = $bindable(), textEditorState, textEditorView }: Props = $props();
</script>

<div class="w-64 flex flex-col gap-6 overflow-y-auto">
  <div class="flex gap-2 items-center text-neutral-50">
    {#if node.type === "screen"}
      <SmartphoneIcon class="size-4 text-neutral-400" />
    {:else if node.type === "frame"}
      <FrameIcon class="size-4 text-neutral-400" />
    {:else}
      <TypeIcon class="size-4 text-neutral-400" />
    {/if}
    {node.name}
  </div>
  {#if node.type === "frame"}
    <FrameInspector bind:node />
  {:else if node.type === "screen"}
    <ScreenInspector bind:node />
  {:else if node.type === "text"}
    <TextInspector bind:node {textEditorView} {textEditorState} />
  {/if}
</div>
