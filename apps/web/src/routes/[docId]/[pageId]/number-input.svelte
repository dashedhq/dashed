<script lang="ts">
  import type { Snippet } from "svelte";

  import { cn } from "$lib/utils";

  type Props = {
    startDecorator?: Snippet;
    value: number | null;
    onValueChange: (v: number) => void;
    placeholder?: string;
    class?: string;
  };

  let {
    value,
    onValueChange,
    startDecorator,
    placeholder,
    class: className,
  }: Props = $props();

  let draftValue = $derived.by(() => {
    return value?.toString() || "";
  });
</script>

<div
  class={cn(
    "text-neutral-50 text-sm border border-neutral-700 rounded-md px-2 h-8 flex items-center gap-2 focus-within:border-blue-500",
    className,
  )}
>
  <div class="text-neutral-400 [&_svg]:size-4">
    {@render startDecorator?.()}
  </div>
  <input
    class="min-w-0 flex-1 outline-none"
    {placeholder}
    bind:value={draftValue}
    onblur={() => {
      const parsed = draftValue.trim() === "" ? null : parseFloat(draftValue);
      if (parsed !== null && !Number.isNaN(parsed) && parsed >= 0) {
        onValueChange(parsed);
      }
      // Sync display back to model — needed when the parent normalizes
      // the value back to the same number (e.g. rounding), since the
      // derived won't re-run if value didn't change.
      draftValue = value?.toString() || "";
    }}
  />
</div>
