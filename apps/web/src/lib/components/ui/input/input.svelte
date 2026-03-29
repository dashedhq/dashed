<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  import { cn } from "$lib/utils.js";

  let {
    value = $bindable(),
    files = $bindable(),
    class: className,
    ...others
  }: HTMLInputAttributes = $props();
</script>

<input
  class={cn(
    "h-7 px-2 border border-neutral-700 rounded-md text-sm focus:outline-2 focus:outline-neutral-400",
    className,
  )}
  bind:value
  {...others}
/>
