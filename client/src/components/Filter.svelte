<script>
  import { createEventDispatcher } from "svelte";

  export let selectedType = "All";
  export let selectedRarity = "All";
  let maxPrice = "";
  let showFilters = true;

  const dispatch = createEventDispatcher();

  //send filters to parent (Auctions page)
  function handleFilterChange() {
    dispatch('applyFilters', {
      selectedType,
      selectedRarity,
      maxPrice
    });
  }
</script>

<div class="p-4 lg:mt-6 border rounded-lg bg-background">
  <h2 class="text-lg text-white font-bold flex justify-between items-center">
    Filters
    <button on:click={() => (showFilters = !showFilters)} class="px-4 py-2 text-sm bg-background text-white rounded-lg">
      {#if showFilters} Hide Filters {/if}
      {#if !showFilters} Show Filters {/if}
    </button>
  </h2>

  {#if showFilters}
    <div>
      <label class="block mb-2">Type</label>
      <select bind:value={selectedType} class="w-full mb-4 border p-2" on:change={handleFilterChange}>
        {#each ["All", "Monster", "Trap", "Spell"] as type}
          <option value={type}>{type}</option>
        {/each}
      </select>

      <label class="block mb-2">Rarity</label>
      <select bind:value={selectedRarity} class="w-full mb-4 border p-2" on:change={handleFilterChange}>
        {#each ["All", "Rare", "Super Rare", "Ultra Rare", "Unique"] as rarity}
          <option value={rarity}>{rarity}</option>
        {/each}
      </select>

      <label class="block mb-2">Max Price</label>
      <input type="number" bind:value={maxPrice} placeholder="Max Price" class="border p-2 mb-4 w-full" on:input={handleFilterChange} />
    </div>
  {/if}
</div>
