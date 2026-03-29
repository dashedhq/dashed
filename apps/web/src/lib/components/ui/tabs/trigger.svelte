<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";

  import { cn } from "$lib/utils.js";

  let { class: className, ...others }: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
  class={cn(
    "cursor-pointer text-neutral-400 px-2 h-7 inline-flex items-center justify-center text-sm data-[state=active]:bg-neutral-700/50 data-[state=active]:text-neutral-50 rounded-md transition-colors ease-out duration-150",
    className,
  )}
  {...others}
/>
