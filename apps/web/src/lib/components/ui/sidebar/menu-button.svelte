<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  type Props = HTMLButtonAttributes & {
    active?: boolean;
  };

  let { class: className, children, active, ...others }: Props = $props();
</script>

<button
  class={cn(
    "w-full flex gap-1.5 items-center text-sm h-7 px-2 [&_svg]:size-4 text-neutral-400 [&_svg]:text-neutral-400 hover:bg-neutral-700/50 rounded-md cursor-pointer transition-colors duration-150 ease-out",
    active && "bg-neutral-700/50 text-neutral-50",
    className,
  )}
  {...others}
>
  {@render children?.()}
</button>
