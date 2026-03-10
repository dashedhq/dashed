<script lang="ts">
  import type { TextNode } from "@opendesigner/core";
  import { baseKeymap } from "prosemirror-commands";
  import { history, redo, undo } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";
  import { EditorState } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";

  import { nodeToDoc, selectionHighlightPlugin } from "./prosemirror";

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
        if (view.isDestroyed) return;
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
