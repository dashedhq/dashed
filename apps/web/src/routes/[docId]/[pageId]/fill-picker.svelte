<script lang="ts">
  import { colorToHex, type Fill, fillStyle } from "@dashedhq/core";
  import { Popover } from "bits-ui";

  import {
    TabsContent,
    TabsList,
    TabsRoot,
    TabsTrigger,
  } from "$lib/components/ui/tabs";
  import { cn } from "$lib/utils";

  import ColorPicker from "./color-picker.svelte";
  import { generateStopId } from "./editor-state.svelte";
  import GradientPicker from "./gradient-picker.svelte";

  type Props = Omit<Popover.TriggerProps, "value"> & {
    value: Fill;
    onValueChange: (v: Fill) => void;
    onChangeStart: () => void;
    onChangeEnd: () => void;
  };

  let {
    value,
    class: className,
    onValueChange,
    onChangeStart,
    onChangeEnd,
    ...others
  }: Props = $props();

  function toSolidFill(fill: Fill): Fill {
    switch (fill.type) {
      case "solid":
        return fill;
      case "linear-gradient":
        return { type: "solid", color: { ...fill.gradient.stops[0].color } };
      case "image":
        return { type: "solid", color: { r: 0, g: 0, b: 0, a: 1 } };
    }
  }

  function toLinearGradientFill(fill: Fill): Fill {
    switch (fill.type) {
      case "linear-gradient":
        return fill;
      case "solid":
        return {
          type: "linear-gradient",
          gradient: {
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
            stops: [
              { id: generateStopId(), offset: 0, color: fill.color },
              {
                id: generateStopId(),
                offset: 1,
                color: { r: 0, g: 0, b: 0, a: 1 },
              },
            ],
          },
        };
      case "image":
        return {
          type: "linear-gradient",
          gradient: {
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
            stops: [
              {
                id: generateStopId(),
                offset: 0,
                color: { r: 0, g: 0, b: 0, a: 1 },
              },
              {
                id: generateStopId(),
                offset: 1,
                color: { r: 255, g: 255, b: 255, a: 1 },
              },
            ],
          },
        };
    }
  }
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
      <span class="absolute inset-0 z-10" style={fillStyle(value)}> </span>
    </span>
    {#if value.type === "solid"}
      {colorToHex(value.color)}
    {:else if value.type === "linear-gradient"}
      Linear
    {:else if value.type === "image"}
      Image
    {/if}
  </Popover.Trigger>

  <Popover.Content
    align="start"
    side="left"
    sideOffset={8}
    alignOffset={-4}
    class="bg-neutral-800 border border-neutral-700 shadow-md rounded-lg p-4 w-70 z-10"
  >
    <TabsRoot
      value={value.type}
      onValueChange={(v) => {
        const type = v as Fill["type"];
        if (type === value.type) {
          return;
        }

        if (type === "solid") {
          onValueChange(toSolidFill(value));
        } else if (type === "linear-gradient") {
          onValueChange(toLinearGradientFill(value));
        }
      }}
    >
      <TabsList>
        <TabsTrigger value="solid">Solid</TabsTrigger>
        <TabsTrigger value="linear-gradient">Gradient</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
      </TabsList>
      <TabsContent value="solid">
        {#if value.type === "solid"}
          <ColorPicker
            value={value.color}
            onValueChange={(v) => onValueChange({ type: "solid", color: v })}
            {onChangeStart}
            {onChangeEnd}
          />
        {/if}
      </TabsContent>
      <TabsContent value="linear-gradient">
        {#if value.type === "linear-gradient"}
          <GradientPicker
            value={value.gradient}
            onValueChange={(v) =>
              onValueChange({ type: "linear-gradient", gradient: v })}
            {onChangeStart}
            {onChangeEnd}
          />
        {/if}
      </TabsContent>
      <TabsContent value="image">Image content</TabsContent>
    </TabsRoot>
  </Popover.Content>
</Popover.Root>
