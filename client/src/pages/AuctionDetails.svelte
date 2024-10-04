<script>
  import { onMount } from 'svelte';
  import router from 'page';
  import { tokenStore } from '../TokenStore'; // Import the tokenStore
  import Alert from '../lib/Alert.svelte'; // Import Alert component

  let auctionId;
  let auction = null; // Initialize auction as null
  let card;
  let isEditing = false; // State to track if in edit mode
  let updatedAuction = {}; // Object to hold updated auction data
  let token;
  let showAlert = false; // Control alert visibility
  let alertMessage = ''; // Message to display in the alert

  tokenStore.subscribe(value => {
    token = value.token;
    console.log('AUCTIONDETAILS PG Token stored in tokenStore:', token); // Log the token from TokenStore
  })();

  async function fetchAuctionDetails() {
    try {
      const response = await fetch(`http://localhost:3000/auctions/${auctionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      auction = await response.json(); 
      console.log("Fetched auction details:", auction); // Log the auction data

      updatedAuction = { ...auction };

    } catch (error) {
      console.error("Error retrieving auction details:", error);
    }
  }

    async function fetchCardDetails() {
    try {
      const response = await fetch(`http://localhost:3000/cards/${auction.cardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      card = data.foundCard;
      updatedCard = { ...card }; // Initialize updatedCard with the fetched data
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

  onMount(() => {
    auctionId = window.location.pathname.split('/').pop(); // Get auction ID from URL
    console.log('auctionId', auctionId)
    fetchAuctionDetails();
    fetchCardDetails();
  });
</script>

<Alert message={alertMessage} type="success" isVisible={showAlert} />

<!-- Conditional rendering -->
 <!-- TODO: also display card image, after making sure the card has been retrieved -->
{#if auction}
  <div class="p-4 max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold mb-4 text-center md:text-left">{auction.id}</h1>
  </div>
{:else}
  <p>Loading auction details...</p>
{/if}
