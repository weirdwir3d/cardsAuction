<script>
  import { onMount } from "svelte";
  import AuctionContainer from "../lib/AuctionContainer.svelte";
  import Filter from "../lib/Filter.svelte"; 

  let auctions = [];
  let searchQuery = "";
  let selectedType = "All";
  let selectedRarity = "All";

  // Update the query parameters dynamically
  function updateQueryParams() {
    let queryParams = [];

    if (selectedRarity !== "All") {
      queryParams.push(`rarity=${selectedRarity.toLowerCase()}`);
    }

    if (selectedType !== "All") {
      queryParams.push(`type=${selectedType.toLowerCase()}`);
    }

    return queryParams.length > 0 ? '?' + queryParams.join('&') : '';
  }

  async function retrieveAuctions() {
    const queryString = updateQueryParams();
    let url = `http://localhost:3000/auctions${queryString}`;

    console.log('Fetching auctions with URL:', url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        auctions = data.auctions || [];
        console.log("Received auctions:", auctions);
    } catch (error) {
        console.error("Error retrieving auctions:", error);
    }
  }

  // Handle filter updates from child component
  function handleApplyFilters(event) {
    selectedRarity = event.detail.selectedRarity;
    selectedType = event.detail.selectedType;
    retrieveAuctions();
  }

  onMount(async () => {
    await retrieveAuctions();
  });
</script>

<!-- Page Layout -->
<div class="flex flex-col lg:flex-row justify-between">
  <div class="lg:w-1/4 w-full lg:relative">
    <Filter 
      bind:selectedType={selectedType} 
      bind:selectedRarity={selectedRarity} 
      on:applyFilters={handleApplyFilters} 
    />
  </div>

  <div class="lg:w-3/4 w-full">
    <!-- Auctions List -->
    {#if auctions.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6 px-4">
        {#each auctions as auction}
          <AuctionContainer {auction} />
        {/each}
      </div>
    {:else}
      <p class="px-4">No auctions found.</p>
    {/if}
  </div>
</div>
