<script>
  import { tokenStore } from "../TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../middleware";
  import AddAuctionModal from "../lib/AddAuctionModal.svelte";
  import { onMount } from "svelte";
  import AuctionContainer from "../lib/AuctionContainer.svelte";
  import Filter from "../lib/Filter.svelte";
  import { fetchAuctionsAPI, fetchCardsAPI } from '../api.js';

    let token;
  let isLoggedIn = false;
  let isAdmin = false;

  let showAuctionModal = false; // Modal visibility
  let auctions = [];
  let cards = [];
  let alertMessage = "";
  let alertType = "";
  let isAlertVisible = false;
  let searchQuery = "";
  let selectedType = "All";
  let selectedRarity = "All";
  let maxPrice = ""; // New variable for maximum price

    tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  });

  async function fetchAuctions() {
    try {
      auctions = await fetchAuctionsAPI(selectedRarity, selectedType, maxPrice, searchQuery);
      console.log("Received auctions:", auctions);
    } catch (error) {
      alertMessage = "An error occurred while retrieving auctions.";
      alertType = "error";
      isAlertVisible = true;
      auctions = [];
    }
  }

  onMount(async () => {
    await fetchCards();
    await fetchAuctions();
  });

  async function fetchCards() {
    try {
      cards = await fetchCardsAPI();
      console.log("Received cards:", cards);
    } catch (error) {
      alertMessage = "An error occurred while retrieving cards.";
      alertType = "error";
      isAlertVisible = true;
    }
  }

  function getCardById(cardId) {
    const matchedCard = cards.find((card) => card.id === cardId);

    if (matchedCard) {
      console.log("Matched card:", matchedCard);
    } else {
      console.log("No card found for cardId:", cardId);
    }

    return (
      matchedCard ?? {
        imageUrl: "placeholder-image-url",
        name: "No card available",
      }
    );
  }

  async function handleSearch() {
    await fetchAuctions();
    await fetchCards();
  }

  function handleKeydown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  async function handleApplyFilters(event) {
    selectedRarity = event.detail.selectedRarity;
    selectedType = event.detail.selectedType;
    maxPrice = event.detail.maxPrice; // Add this line to capture max price
    await fetchAuctions();
    await fetchCards();
  }

  onMount(async () => {
    await fetchCards();
    await fetchAuctions();
  });

  function closeAuctionModal() {
    showAuctionModal = false;
  }

  async function handleAuctionAdded() {
    await fetchCards();
    await fetchAuctions();
  }

  function handleSearchChange() {
    console.log("search query:", searchQuery);

    fetchAuctions();

    // Filter cards based on the search query
    let filteredCards = cards.filter((card) =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log("Found cards with name:", filteredCards);

    // Filter auctions based on the filtered cards
    auctions = auctions.filter((auction) =>
      filteredCards.some((card) => card.auctionId === auction.id)
    );

    // Log the filtered auctions
    console.log("Filtered auctions:", auctions);
  }
</script>

<!-- Page Layout -->
<div class="flex flex-col lg:flex-row justify-between">
  <div class="lg:w-1/4 w-full lg:relative">
    <Filter
      bind:selectedType
      bind:selectedRarity
      bind:maxPrice
      on:applyFilters={handleApplyFilters}
    />
  </div>

  <div class="lg:w-3/4 w-full">
    <!-- Search Bar -->
    <div class="px-4">
      <input
        type="text"
        placeholder="Search by card name..."
        bind:value={searchQuery}
        on:input={handleSearchChange}
        class="border rounded p-2 mb-4 w-full"
      />
    </div>

    <!-- Auctions List -->
    {#if auctions.length > 0}
      <p class="px-4">
        Found {auctions.length} auction{auctions.length !== 1 ? "s" : ""}.
      </p>
      <!-- Button to trigger modal -->
      <div class="text-center md:text-left mt-6">
        {#if isAdmin}
        <button
          on:click={() => (showAuctionModal = true)}
          class="px-6 py-3 bg-tertiary text-white rounded hover:bg-blue-600 transition-colors"
        >
          Add auction
        </button>
        {/if}
      </div>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6 px-4"
      >
        {#each auctions as auction}
          <AuctionContainer {auction} card={getCardById(auction.cardId)} />
        {/each}
      </div>
    {:else}
      <p class="px-4">No auctions found.</p>
    {/if}
  </div>
</div>

<AddAuctionModal
  bind:isVisible={showAuctionModal}
  on:close={closeAuctionModal}
  on:auctionAdded={handleAuctionAdded}
  isFromAuctionsPage={true}
/>