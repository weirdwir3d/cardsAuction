<script>
  import { onMount } from "svelte";
  import AuctionContainer from "../lib/AuctionContainer.svelte";
  import { tokenStore } from '../TokenStore';

  let auctions = [];
  let cards = [];
  let alertMessage = "";
  let alertType = "";
  let isAlertVisible = false;

  // Fetch auctions from the server
  async function retrieveAuctions() {
    try {
      const response = await fetch("http://localhost:3000/auctions", {
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

  // Fetch cards from the server
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

  // Function to find a card by auctionId
  function getCardById(auctionId) {
    return cards.find(card => card.id === auctionId);
  }

  // Run the functions on component mount
  onMount(async () => {
    await retrieveAuctions();
    await retrieveCards();
  });
</script>

{#if isAlertVisible}
  <div class={`alert ${alertType === 'error' ? 'bg-red-500 text-white' : ''} p-4 rounded`}>
    {alertMessage}
  </div>
{/if}

<!-- Render auctions only when both auctions and cards are available -->
{#if auctions.length > 0 && cards.length > 0}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
    {#each auctions as auction}
      <AuctionContainer 
        {auction} 
        card={getCardById(auction.id) ?? { imageUrl: "placeholder-image-url", name: "No card available" }} 
      />
    {/each}
  </div>
{:else}
  <p>Loading auctions...</p>
{/if}
