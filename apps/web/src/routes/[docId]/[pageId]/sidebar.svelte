<script lang="ts">
  import {
    type Document,
    type Node,
    type Page,
    resolveChildren,
  } from "@dashedhq/core";
  import { FrameIcon, SmartphoneIcon, TypeIcon } from "@lucide/svelte";

  import { resolve } from "$app/paths";
  import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuLink,
  } from "$lib/components/ui/sidebar";
  import {
    TabsContent,
    TabsList,
    TabsRoot,
    TabsTrigger,
  } from "$lib/components/ui/tabs";

  type Props = {
    document: Document;
    page: Page;
    selection: string | null;
  };

  let { document, page, selection = $bindable() }: Props = $props();
</script>

{#snippet renderLayer(node: Node, depth: number)}
  <SidebarMenuItem role="treeitem">
    <SidebarMenuButton
      active={selection === node.id}
      onclick={() => {
        selection = node.id;
      }}
      style="padding-left: {depth * 12 + 8}px"
    >
      {#if node.type === "screen"}
        <SmartphoneIcon />
      {:else if node.type === "frame"}
        <FrameIcon />
      {:else}
        <TypeIcon />
      {/if}
      {node.name}
    </SidebarMenuButton>
  </SidebarMenuItem>
  {#if node.type === "screen" || node.type === "frame"}
    {#each resolveChildren(page.nodes, node.children) as child (child.id)}
      {@render renderLayer(child, depth + 1)}
    {/each}
  {/if}
{/snippet}

<div class="w-64 flex flex-col gap-6">
  <div class="flex flex-col gap-1 px-2">
    <div class="text-neutral-50">{document.name}</div>
  </div>
  <TabsRoot value="pages" class="gap-4 flex-1 overflow-hidden">
    <TabsList>
      <TabsTrigger value="pages">Pages</TabsTrigger>
      <TabsTrigger value="layers">Layers</TabsTrigger>
    </TabsList>
    <TabsContent value="pages" class="flex flex-col gap-1 overflow-auto">
      <SidebarMenu role="tablist">
        {#each document.pages as pg (pg.id)}
          <SidebarMenuItem role="presentation">
            <SidebarMenuLink
              active={page.id === pg.id}
              href={resolve(`/${document.id}/${pg.id}`)}
            >
              {pg.name}
            </SidebarMenuLink>
          </SidebarMenuItem>
        {/each}
      </SidebarMenu>
    </TabsContent>
    <TabsContent value="layers" class="flex flex-col gap-1 overflow-auto">
      <SidebarMenu role="tree">
        {#each resolveChildren(page.nodes, page.children) as node (node.id)}
          {@render renderLayer(node, 0)}
        {/each}
      </SidebarMenu>
    </TabsContent>
  </TabsRoot>
</div>
