<script>
  import { onMount } from "svelte";
  import AuctionContainer from "../lib/AuctionContainer.svelte";
  import Filter from "../lib/Filter.svelte"; 

  let auctions = [];
  let cards = [];
  let alertMessage = "";
  let alertType = "";
  let isAlertVisible = false;
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
        alertMessage = "An error occurred while retrieving auctions.";
        alertType = "error";
        isAlertVisible = true;
        console.error("Error retrieving auctions:", error);
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
      cards = data.cardsData || [];
      console.log("Received cards:", cards);
    } catch (error) {
      console.error("Error retrieving cards:", error);
      alertMessage = "An error occurred while retrieving cards.";
      alertType = "error";
      isAlertVisible = true;
    }
  }

function getCardById(auctionId) {
    console.log("Looking for card with auctionId:", auctionId); // Log the auctionId
    const matchedCard = cards.find(card => card.auctionId === auctionId);
    
    // Log the found card or if no card was found
    if (matchedCard) {
        console.log("Matched card:", matchedCard);
    } else {
        console.log("No card found for auctionId:", auctionId);
    }
    
    return matchedCard ?? { imageUrl: "placeholder-image-url", name: "No card available" };
}


  async function handleSearch() {
    await retrieveAuctions();
    await retrieveCards();
  }

  function handleKeydown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  // Handle filter updates from child component
  async function handleApplyFilters(event) {
    selectedRarity = event.detail.selectedRarity;
    selectedType = event.detail.selectedType;
    await retrieveAuctions(); // Fetch auctions first
    await retrieveCards(); 
  }

  onMount(async () => {
    await retrieveCards();
    await retrieveAuctions();
     // Ensure cards are retrieved on mount
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
    <p class="px-4">Found {auctions.length} auction{auctions.length !== 1 ? 's' : ''}.</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6 px-4">
      {#each auctions as auction}
        <AuctionContainer {auction} card={getCardById(auction.id)} />
      {/each}
    </div>
  {:else}
    <p class="px-4">No auctions found.</p>
  {/if}
</div>

</div>
