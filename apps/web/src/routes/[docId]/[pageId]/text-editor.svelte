<script lang="ts">
  import type { TextNode } from "@dashedhq/core";
  import { baseKeymap } from "prosemirror-commands";
  import { history, redo, undo } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";
  import { EditorState, Plugin } from "prosemirror-state";
  import { Decoration, DecorationSet, EditorView } from "prosemirror-view";

  import { nodeToDoc } from "./editor-state.svelte";

  const selectionHighlightPlugin = new Plugin({
    props: {
      decorations(state) {
        const { from, to, empty } = state.selection;
        if (empty) {
          return DecorationSet.empty;
        }
        return DecorationSet.create(state.doc, [
          Decoration.inline(from, to, {
            style:
              "background-color: color-mix(in oklch, var(--color-blue-500) 30%, transparent)",
          }),
        ]);
      },
    },
  });

  type Props = {
    node: TextNode;
    onExit: () => void;
    onStateChange: (s: EditorState) => void;
    onReady: (v: EditorView, s: EditorState) => void;
  };

  let { node, onExit, onStateChange, onReady }: Props = $props();

  let containerEl: HTMLDivElement;

  $effect(() => {
    const state = EditorState.create({
      doc: nodeToDoc(node),
      plugins: [
        history(),
        keymap({
          "Mod-z": undo,
          "Mod-Shift-z": redo,
          "Mod-y": redo,
          Escape: () => {
            onExit();
            return true;
          },
        }),
        keymap(baseKeymap),
        selectionHighlightPlugin,
      ],
    });

    const view = new EditorView(containerEl, {
      state,
      dispatchTransaction(tr) {
        if (view.isDestroyed) {
          return;
        }
        const newState = view.state.apply(tr);
        view.updateState(newState);
        onStateChange(newState);
      },
    });

    view.focus();
    onReady(view, state);
    return () => {
      view.destroy();
    };
  });
</script>

<div
  bind:this={containerEl}
  class="select-text [&_.ProseMirror]:relative [&_.ProseMirror]:wrap-break-word [&_.ProseMirror]:break-spaces [&_.ProseMirror]:outline-none [&_*::selection]:bg-transparent"
></div>
