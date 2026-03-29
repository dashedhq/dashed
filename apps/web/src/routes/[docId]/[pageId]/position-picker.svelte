<script lang="ts">
  import type { Position } from "@dashedhq/core";
  import { ToggleGroup } from "bits-ui";

  type Props = {
    value: Position;
    onValueChange: (v: Position) => void;
  };

  let { value, onValueChange }: Props = $props();
</script>

<ToggleGroup.Root
  type="single"
  value={value.type}
  onValueChange={(v) => {
    if (v === "auto") {
      onValueChange({ type: "auto" });
    } else if (v === "absolute") {
      onValueChange({
        type: "absolute",
        insets: { top: "auto", right: "auto", bottom: "auto", left: "auto" },
      });
    }
  }}
  class="grid grid-cols-2 bg-neutral-800 h-7 rounded-md text-sm"
>
  <ToggleGroup.Item
    value="auto"
    class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 px-2 flex justify-center items-center gap-2 text-neutral-400 data-[state=on]:text-neutral-50 data-[state=on]:bg-neutral-900"
  >
    Auto
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="absolute"
    class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 px-2 flex justify-center items-center gap-2 text-neutral-400 data-[state=on]:text-neutral-50 data-[state=on]:bg-neutral-900"
  >
    Absolute
  </ToggleGroup.Item>
</ToggleGroup.Root>
