<script>
  import { createEventDispatcher } from "svelte";

  export let selectedType = "All";
  export let selectedRarity = "All";

  const dispatch = createEventDispatcher();

  // Dispatch selected filters to parent
  function handleFilterChange() {
    dispatch('applyFilters', {
      selectedType,
      selectedRarity
    });
  }
</script>

<div class="p-4 border rounded-lg bg-gray-100">
  <h2 class="text-lg font-bold mb-4">Filters</h2>
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
  </div>
</div>
