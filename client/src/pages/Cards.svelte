<script>
  import { onMount } from "svelte";
  import CardContainer from "../components/CardContainer.svelte";
  import AddCardModal from "../components/modals/AddCardModal.svelte";
  import { fetchCardsAPI } from "../lib/api";
  import Alert from "../components/Alert.svelte";
  import Button from "../components/Button.svelte";

  let cards = [];
  let showNewCardModal = false;
  //alert
  let alertMessage = "";
  let alertType = "";
  let showAlert = false;

  onMount(() => {
    fetchCards();
  });

  async function fetchCards() {
    try {
      cards = await fetchCardsAPI();
      // console.log("received cards:  ", cards);
    } catch (error) {
      alertMessage = "An error occurred while retrieving cards :(";
      alertType = "error";
      showAlert = true;
    }
  }
</script>

<div class="flex flex-col justify-between space-y-4 px-4">
  <!-- Alert -->
  <Alert message={alertMessage} type={alertType} isVisible={showAlert} />

  <!-- Page title -->
  <h1 class="text-2xl p-4 md:text-3xl lg:text-4xl font-bold text-center">
    Cards
  </h1>

  <!-- Add card btn -->
  <div class="text-center mt-6">
    <Button label="Add card" color="accent" onClick={() => (showNewCardModal = true)} />
  </div>

  <!-- Cards grid -->
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6"
  >
    {#each cards as card}
      <CardContainer {card} />
    {/each}
  </div>

  <!-- Modal for adding new card -->
{#if showNewCardModal}
  <AddCardModal
    bind:isVisible={showNewCardModal}
    on:close={() => (showNewCardModal = false)}
    on:cardAdded={fetchCards}
  />
{/if}
</div>
