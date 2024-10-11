<script>
  import { onMount } from "svelte";
  import AuctionContainer from "../lib/AuctionContainer.svelte";
  import { tokenStore } from '../TokenStore';

  let auctions = [];
  let cards = [];
  let searchQuery = "";
  let alertMessage = "";
  let alertType = "";
  let isAlertVisible = false;
  let filtersOpen = false; // For handling filter section visibility on small screens

  let selectedType = ""; // Example filter for type
  let selectedRarity = ""; // Example filter for rarity

  async function retrieveAuctions(query = "", type = "", rarity = "") {
    const typeQuery = type ? `&type=${type}` : "";
    const rarityQuery = rarity ? `&rarity=${rarity}` : "";
    try {
      const response = await fetch(`http://localhost:3000/auctions?search=${query}${typeQuery}${rarityQuery}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      auctions = data.auctions;
      console.log("Received auctions:", auctions);
    } catch (error) {
      console.error("Error retrieving auctions:", error);
      alertMessage = "An error occurred while retrieving auctions.";
      alertType = "error";
      isAlertVisible = true;
    }
  }

  async function retrieveCards() {
    try {
      const response = await fetch("http://localhost:3000/cards", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      cards = data.cardsData;
      console.log("Received cards:", cards);
    } catch (error) {
      console.error("Error retrieving cards:", error);
      alertMessage = "An error occurred while retrieving cards.";
      alertType = "error";
      isAlertVisible = true;
    }
  }

  function getCardById(auctionId) {
    const matchedCard = cards.find(card => card.auctionId === auctionId);
    return matchedCard ?? { imageUrl: "placeholder-image-url", name: "No card available" };
  }

  function handleSearch() {
    retrieveAuctions(searchQuery, selectedType, selectedRarity);
  }

  function handleKeydown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  onMount(async () => {
    await retrieveAuctions();
    await retrieveCards();
  });

  function toggleFilters() {
    filtersOpen = !filtersOpen;
  }
</script>

<!-- Page Layout -->
<div class="flex flex-col lg:flex-row justify-between">

  <!-- Filters Section -->
  <div class="lg:w-1/4 w-full lg:relative">
    <!-- Sidebar for large screens -->
    <div class="hidden lg:block lg:fixed lg:w-1/4 p-4 border rounded-lg bg-gray-100">
      <h2 class="text-lg font-bold mb-4">Filters</h2>
      <div>
        <label class="block mb-2">Type</label>
        <select bind:value={selectedType} class="w-full mb-4 border p-2">
          <option value="">All Types</option>
          <option value="type1">Type 1</option>
          <option value="type2">Type 2</option>
        </select>

        <label class="block mb-2">Rarity</label>
        <select bind:value={selectedRarity} class="w-full mb-4 border p-2">
          <option value="">All Rarities</option>
          <option value="common">Common</option>
          <option value="rare">Rare</option>
        </select>

        <button on:click={handleSearch} class="w-full bg-blue-500 text-white p-2 rounded-lg">
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Collapsible Filter Modal for small screens -->
    <div class="lg:hidden w-full">
      <button class="bg-blue-500 text-white p-2 rounded-lg w-full mb-4" on:click={toggleFilters}>
        {filtersOpen ? "Hide Filters" : "Show Filters"}
      </button>

      {#if filtersOpen}
        <div class="p-4 border rounded-lg bg-gray-100">
          <h2 class="text-lg font-bold mb-4">Filters</h2>
          <div>
            <label class="block mb-2">Type</label>
            <select bind:value={selectedType} class="w-full mb-4 border p-2">
              <option value="">All Types</option>
              <option value="type1">Type 1</option>
              <option value="type2">Type 2</option>
            </select>

            <label class="block mb-2">Rarity</label>
            <select bind:value={selectedRarity} class="w-full mb-4 border p-2">
              <option value="">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
            </select>

            <button on:click={handleSearch} class="w-full bg-blue-500 text-white p-2 rounded-lg">
              Apply Filters
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Auctions Section -->
  <div class="lg:w-3/4 w-full">

    <!-- Search Bar -->
    <div class="flex justify-center mt-6 px-4">
      <input
        bind:value={searchQuery}
        type="text"
        class="w-full max-w-lg px-4 py-2 border rounded-lg"
        placeholder="Search auctions by card name..."
        on:keydown={handleKeydown}
      />
      <button on:click={handleSearch} class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
        Search
      </button>
    </div>

    <!-- Alert Message -->
    {#if isAlertVisible}
      <div class={`alert ${alertType === 'error' ? 'bg-red-500 text-white' : ''} p-4 rounded mt-4`}>
        {alertMessage}
      </div>
    {/if}

    <!-- Auctions List -->
    {#if auctions.length > 0 && cards.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6 px-4">
        {#each auctions as auction}
          <AuctionContainer 
            {auction} 
            card={getCardById(auction.id)} 
          />
        {/each}
      </div>
    {:else}
      <p class="px-4">Loading auctions...</p>
    {/if}
  </div>
</div>

<style>
  input {
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
  }
</style>
