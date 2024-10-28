<script>
  import { onMount } from "svelte";
  import CardContainer from "../components/CardContainer.svelte";
  import ModalAddCard from "../components/ModalAddCard.svelte";
  import { fetchCardsAPI } from "../lib/api";

  let cards = [];
  let showModal = false; // Modal visibility
  let alertMessage = "";
  let alertType = "";
  let isAlertVisible = false;

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

  onMount(() => {
    fetchCards();
  });
</script>

<h1 class="text-3xl font-bold">Cards</h1>

<!-- Button to trigger modal -->
<div class="text-center md:text-left mt-6">
  <button
    on:click={() => (showModal = true)}
    class="px-6 py-3 bg-accent text-white rounded hover:bg-blue-600 transition-colors"
  >
    Add card
  </button>
</div>

<!-- Alert for errors -->
{#if isAlertVisible}
  <div
    class={`alert ${alertType === "error" ? "bg-red-500 text-white" : ""} p-4 rounded`}
  >
    {alertMessage}
  </div>
{/if}

<!-- Cards grid -->
<div
  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6"
>
  {#each cards as card}
    <CardContainer {card} />
  {/each}
</div>

<!-- Modal for adding a card -->
{#if showModal}
  <ModalAddCard
    on:close={() => (showModal = false)}
    on:cardAdded={fetchCards}
  />
  <!-- Use fetchCards here -->
{/if}
