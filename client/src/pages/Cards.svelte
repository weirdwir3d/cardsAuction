<h1 class="text-3xl font-bold">Cards</h1>
<!-- TODO: make button work -->
    <div class="text-center md:text-left mt-6">
      <button 
        on:click={() => router.redirect('/cards')} 
        class="px-6 py-3 bg-tertiary text-white rounded hover:bg-blue-600 transition-colors"
      >
        Add card
      </button>
    </div>

<script>
  import router from 'page';
  import { onMount } from "svelte";
  import CardContainer from "../lib/CardContainer.svelte";
  import { tokenStore } from '../TokenStore'; // Import the tokenStore
            tokenStore.subscribe(value => {
            console.log('CARDS PG Token stored in tokenStore:', value.token); // Log the token from TokenStore
        })();

  let cards = [];
  let alertMessage = "";
  let alertType = "";
  let isAlertVisible = false;

  async function retrieveCards() {
    console.log("Retrieving cards...");

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
      console.log("Received response from server:", data);

      cards = data.cardsData; // Assuming the API returns an array of cards
    } catch (error) {
      console.error("Error retrieving cards:", error);
      alertMessage = "An error occurred while retrieving cards. Please try again later.";
      alertType = "error";
      isAlertVisible = true;
    }
  }

  // Run the function on component mount
  onMount(() => {
    retrieveCards();
  });
</script>

{#if isAlertVisible}
  <div class={`alert ${alertType === 'error' ? 'bg-red-500 text-white' : ''} p-4 rounded`}>
    {alertMessage}
  </div>
{/if}

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
  {#each cards as card}
  <CardContainer {card} />
  {/each}
</div>