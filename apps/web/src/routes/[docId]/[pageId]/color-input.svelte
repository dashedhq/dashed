<script lang="ts">
  import { type Color, colorToCss, colorToHex } from "@dashedhq/core";
  import { Popover } from "bits-ui";

  import { cn } from "$lib/utils";

  import ColorPicker from "./color-picker.svelte";

  type Props = Omit<Popover.TriggerProps, "value"> & {
    value: Color;
    onValueChange: (v: Color) => void;
    onChangeStart: () => void;
    onChangeEnd: () => void;
  };

  let { value, onValueChange, onChangeStart, onChangeEnd, class: className, ...others }: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger
    class={cn(
      "flex px-2 gap-2 cursor-pointer items-center border border-neutral-700 h-8 rounded-md text-sm text-neutral-50 data-[state=open]:border-blue-500",
      className,
    )}
    {...others}
  >
    <span class="size-4 relative">
      <span
        class="absolute inset-0 bg-[repeating-conic-gradient(var(--color-neutral-600)_0%_25%,transparent_0%_50%)]"
      ></span>
      <span
        class="absolute inset-0 z-10"
        style="background: {colorToCss(value)}"
      ></span>
    </span>
    {colorToHex(value)}
  </Popover.Trigger>

  <Popover.Content
    align="start"
    side="left"
    sideOffset={8}
    alignOffset={-4}
    class="bg-neutral-800 border border-neutral-700 shadow-md rounded-lg p-4 w-60"
  >
    <ColorPicker {value} {onValueChange} {onChangeStart} {onChangeEnd} />
  </Popover.Content>
</Popover.Root>
