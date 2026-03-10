<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    startDecorator?: Snippet;
    value: number | null;
    placeholder?: string;
  };

  let { value = $bindable(), startDecorator, placeholder }: Props = $props();

  let draftValue = $derived.by(() => {
    return value?.toString() || "";
  });
</script>

<div
  class="text-neutral-50 text-sm border border-neutral-700 rounded-md px-2 h-8 flex items-center gap-2 focus-within:border-blue-500"
>
  <div class="text-neutral-400 [&_svg]:size-4">
    {@render startDecorator?.()}
  </div>
  <input
    class="min-w-0 flex-1 outline-none"
    {placeholder}
    bind:value={draftValue}
    onblur={() => {
      if (draftValue.trim() === "") {
        value = null;
        draftValue = "";
        return;
      }

      const parsed = parseFloat(draftValue);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed != value) {
        value = parsed;
      } else {
        draftValue = value?.toString() || "";
      }
    }}
  />
</div>
