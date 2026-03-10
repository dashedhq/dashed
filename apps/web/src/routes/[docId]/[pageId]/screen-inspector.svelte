<script lang="ts">
  import type { ScreenNode } from "@opendesigner/core";

  import FillPicker from "./fill-picker.svelte";

  type Props = {
    node: ScreenNode;
  };

  let { node = $bindable() }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Background</div>
  <FillPicker bind:value={node.fill} />
</div>
