<script lang="ts">
  import type { Document, Page } from "@dashedhq/core";
  import type { EditorState } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";

  import Canvas from "./canvas.svelte";
  import Inspector from "./inspector.svelte";
  import Sidebar from "./sidebar.svelte";

  type Props = {
    document: Document;
    page: Page;
  };

  let { document, page = $bindable() }: Props = $props();

  let selection = $state<string | null>(null);
  let textEditorState = $state.raw<EditorState | null>(null);
  let textEditorView = $state.raw<EditorView | null>(null);
</script>

<div class="flex bg-neutral-900 p-4 gap-4 h-svh">
  <Sidebar {document} {page} bind:selection />
  <Canvas
    bind:page
    bind:selection
    onTextEditEnd={() => {
      textEditorState = null;
      textEditorView = null;
    }}
    onTextEditStateChange={(s) => (textEditorState = s)}
    onTextEditStart={(v, s) => {
      textEditorState = s;
      textEditorView = v;
    }}
  />
  {#if selection && page.nodes[selection]}
    <Inspector
      bind:node={page.nodes[selection]}
      {textEditorState}
      {textEditorView}
    />
  {/if}
</div>
