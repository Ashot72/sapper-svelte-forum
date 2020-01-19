<script>
  import Breadcrumb from "sveltestrap/src/Breadcrumb.svelte";
  import BreadcrumbItem from "sveltestrap/src/BreadcrumbItem.svelte";

  export let items;
</script>

<Breadcrumb>
  {#if items.every(i => i.title)}
    {#each items as item (item.title)}
      <BreadcrumbItem>
        {#if item.link}
          <a href={item.link}>{item.title}</a>
        {:else}{item.title}{/if}
      </BreadcrumbItem>
    {/each}
  {/if}
</Breadcrumb>
