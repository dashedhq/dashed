<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { cn } from "$lib/utils.js";

  type Props = HTMLButtonAttributes & {
    variant?: "primary" | "secondary" | "tertiary";
    size?: "md" | "icon-md" | "icon-lg";
  };

  let {
    class: className,
    variant = "tertiary",
    size = "md",
    type = "button",
    disabled,
    children,
    ...others
  }: Props = $props();
</script>

<button
  class={cn(
    "cursor-pointer inline-flex items-center justify-center text-neutral-50 rounded-md transition-colors ease-out duration-150",
    size === "md" && "h-8 px-2 min-w-20 text-sm [&_svg]:size-3",
    size === "icon-md" && "size-8 [&_svg]:size-3",
    size === "icon-lg" && "size-9 [&_svg]:size-4",
    variant === "tertiary" && "hover:bg-neutral-700/50",
    className,
  )}
  {type}
  {disabled}
  {...others}
>
  {@render children?.()}
</button>
