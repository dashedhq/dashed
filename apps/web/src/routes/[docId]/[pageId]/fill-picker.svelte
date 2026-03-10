<script lang="ts">
  import {
    type Fill,
    fillStyle,
    colorToHex,
  } from "@opendesigner/core";
  import { Popover } from "bits-ui";

  import {
    TabsContent,
    TabsList,
    TabsRoot,
    TabsTrigger,
  } from "$lib/components/ui/tabs";
  import { cn } from "$lib/utils";

  import ColorPicker from "./color-picker.svelte";

  type Props = Omit<Popover.TriggerProps, "value"> & {
    value: Fill;
  };

  let { value = $bindable(), class: className, ...others }: Props = $props();
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
      <span class="absolute inset-0 z-10" style={fillStyle(value)}>
      </span>
    </span>
    {#if value.type === "solid"}
      {colorToHex(value.color)}
    {:else if value.type === "gradient"}
      Gradient
    {:else if value.type === "image"}
      Image
    {/if}
  </Popover.Trigger>

  <Popover.Content
    align="start"
    side="left"
    sideOffset={8}
    alignOffset={-4}
    class="bg-neutral-800 border border-neutral-700 shadow-md rounded-lg p-4 w-60"
  >
    <TabsRoot value={value.type}>
      <TabsList>
        <TabsTrigger value="solid">Solid</TabsTrigger>
        <TabsTrigger value="gradient">Gradient</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
      </TabsList>
      <TabsContent value="solid">
        {#if value.type === "solid"}
          <ColorPicker bind:value={value.color} />
        {/if}
      </TabsContent>
      <TabsContent value="gradient">Gradient content</TabsContent>
      <TabsContent value="image">Image content</TabsContent>
    </TabsRoot>
  </Popover.Content>
</Popover.Root>
