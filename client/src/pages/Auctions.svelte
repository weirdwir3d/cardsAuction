<script>
  import { onMount } from "svelte";
  import { tokenStore } from "../lib/TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../lib/middleware";
  import Button from "../components/buttons/Button.svelte";
  import Alert from "../components/Alert.svelte";
  import { fetchAuctionsAPI, fetchCardsAPI } from "../lib/api.js";
  import Filter from "../components/Filter.svelte";
  import SearchBar from "../components/SearchBar.svelte";
  import AddAuctionModal from "../components/modals/AddAuctionModal.svelte";
  import AuctionContainer from "../components/containers/AuctionContainer.svelte";

  let isLoggedIn = false;
  let isAdmin = false;

  let auctions = [];
  let cards = [];
  let showNewAuctionModal = false;
  //filters
  let searchQuery = "";
  let selectedType = "All";
  let selectedRarity = "All";
  let maxPrice = "";
  //alert
  let alertMessage = "";
  let showAlert = false;
  let alertType = "";

  //first things first: fetch all cards and auctions
  onMount(async () => {
    await fetchCards();
    await fetchAuctions();
  });

  tokenStore.subscribe((value) => {
    let token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  });

  async function fetchAuctions() {
      let response = await fetchAuctionsAPI(
        selectedRarity,
        selectedType,
        maxPrice,
        searchQuery
      );
      let data = await response.json();

      if (response.ok) {
        auctions = data.auctions;
      } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    } 
  }

  async function fetchCards() {
      let response = await fetchCardsAPI();
      let data = await response.json();

      if (response.ok) {
        cards = data.cards;
      } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    } 
  }

  //auctions (cards) have to be retrieved dynamically at any searchbar change
  function handleSearchChange(query) {
    searchQuery = query;
    fetchAuctions();

    let filteredCards = cards.filter((card) =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    auctions = auctions.filter((auction) =>
      filteredCards.some((card) => card.auctionId === auction.id)
    );
  }

  async function handleApplyFilters(event) {
    selectedRarity = event.detail.selectedRarity;
    selectedType = event.detail.selectedType;
    maxPrice = event.detail.maxPrice;
    await fetchAuctions();
    await fetchCards();
  }

  function getCardById(cardId) {
    let matchedCard = cards.find((card) => card.id === cardId);

    // if no card matching auction is found, return placeholder
    return (
      matchedCard ?? {
        imageUrl:
          "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg",
        name: "No card available",
      }
    );
  }

  async function reload() {
    await fetchCards();
    await fetchAuctions();
  }
</script>

<div
  class="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4 px-4"
>
  <!-- Alert -->
  <Alert message={alertMessage} type={alertType} isVisible={showAlert} />

  <!-- Page title (mobile) -->
  <h1 class="text-2xl lg:hidden p-4 md:text-3xl font-bold text-center">
    Auctions
  </h1>

  <!-- Filter -->
  <div class="lg:w-1/4 w-full lg:relative mb-4 lg:mb-0">
    <Filter
      bind:selectedType
      bind:selectedRarity
      bind:maxPrice
      on:applyFilters={handleApplyFilters}
    />

    <!-- Add auction btn (only visible to admin) -->
    <div class="text-center mt-6 hidden lg:block">
      {#if isAdmin}
      <Button label="Add auction" color="warning" onClick={() => (showNewAuctionModal = true)} />
      {/if}
    </div>
  </div>

  <div class="lg:w-3/4 w-full">
    <!-- Page title (larger screens) -->
    <h1
      class="text-2xl hidden lg:block p-4 md:text-3xl lg:text-4xl font-bold text-center"
    >
      Auctions
    </h1>

    <!-- Searchbar -->
    <div class="mb-4">
      <SearchBar bind:searchQuery onSearchChange={handleSearchChange} />
    </div>

    <!-- Auctions grid -->
    {#if auctions.length > 0}
      <p class="px-4">
        Found {auctions.length} auction{auctions.length !== 1 ? "s" : ""}.
      </p>
      <div class="text-center mt-6 lg:hidden">
        {#if isAdmin}
        <Button label="Add auction" color="warning" onClick={() => (showNewAuctionModal = true)} />
        {/if}
      </div>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6"
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

<!-- Modal to add new auction -->
<AddAuctionModal
  bind:isVisible={showNewAuctionModal}
  on:close={() => (showNewAuctionModal = false)}
  on:auctionAdded={reload}
  isFromAuctionsPage={true}
/>
