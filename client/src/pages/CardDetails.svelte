<script>
  import router from "page";
  import { onMount } from "svelte";
  import { tokenStore } from "../lib/TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../lib/middleware";
  import AddAuctionModal from "../components/modals/AddAuctionModal.svelte";
  import EditCardModal from "../components/modals/EditCardModal.svelte";
  import ConfirmationModal from "../components/modals/ConfirmationModal.svelte";
  import Alert from "../components/Alert.svelte";
  import * as API from "../lib/api";

  let token;
  let isLoggedIn = false;
  let isAdmin = false;

  let cardId;
  let card;
  let auctionId = -1; //defaut val, will be reassigned if card is linked to auction
  //editing
  let isEditing = false;
  let updatedCard = {};
  //alert
  let showAlert = false;
  let alertType = "error";
  let alertMessage = "";
  //modals
  let showModal = false;
  let auctionWarningMessage = "";
  let showAuctionModal = false;

    tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  });

  onMount(() => {
    cardId = window.location.pathname.split("/").pop();
    fetchCardDetails();
  });

  async function fetchCardDetails() {
    try {
      card = await API.fetchCardAPI(cardId);
      updatedCard = { ...card };
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

  function handleDelete() {
    if (card.auctionId !== -1) {
      auctionWarningMessage = 'This card is associated with an auction. Deleting the card will also delete the auction. Do you want to proceed?';
      showModal = true;
    } else {
      deleteCard();
    }
  }

  function confirmDelete() {
    showModal = false;
    deleteCard();
  }

  function openEditModal() {
    //reset updatedCard to the current card details everytime editing starts
    updatedCard = { ...card };
    isEditing = true;
  }

  async function deleteCard() {
    try {
      await API.deleteCardAPI(cardId, token);
      alertMessage = "Card deleted successfully!";
      alertType = "success";
      showAlert = true;
      setTimeout(() => {
        router.redirect("/cards");
      }, 3000);
    } catch (error) {
      alertMessage = "Error deleting card";
      alertType = "error";
      showAlert = true;
      console.error("Error deleting card:", error);
    }
  }

  async function saveChanges(updatedCardData) {
    // console.log('updated Data: ', updatedCardData.detail)
    try {
      card = await API.saveCardChangesAPI(cardId, updatedCardData.detail, token);
      alertMessage = "Card edited successfully!";
      alertType = "success";
      showAlert = true;
      isEditing = false;
      fetchCardDetails();
    } catch (error) {
      (alertMessage = "Error updating card:"), error.message;
      alertType = "error";
      showAlert = true;
      console.error("Error updating card details:", error);
    }
  }
</script>

<!-- Alert -->
<Alert message={alertMessage} type={alertType} isVisible={showAlert} />

<!-- Card -->
{#if card}
  <div class="p-4 max-w-7xl mx-auto">
    <!-- Card name -->
    <h1 class="text-4xl font-bold mb-4 text-center md:text-left">
      {card.name}
    </h1>

    <!-- Rest of card details -->
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
      <img
        src={card.imageUrl}
        alt={card.name}
        class="w-full max-w-xs md:max-w-md lg:max-w-lg h-auto object-contain rounded-lg mx-auto"
      />

      <div class="text-lg space-y-4">
        <p><strong>Description: </strong>{card.description}</p>
        <p><strong>Type:</strong> {card.type}</p>
        <p><strong>Rarity:</strong> {card.rarity}</p>

        {#if card.auctionId !== -1}
          <button
            on:click={() => router.redirect(`/auctions/${card.auctionId}`)}
            class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Auction
          </button>
        {:else if isAdmin && auctionId === -1}
          <button
            on:click={() => (showAuctionModal = true)}
            class="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Put Up for Auction
          </button>
        {/if}
      </div>
    </div>

    <div class="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
      {#if isAdmin}
        <div class="text-center md:text-left mt-6 space-x-4">
          <button
            on:click={openEditModal}
            class="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            on:click={handleDelete}
            class="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Card
          </button>
        </div>
      {/if}
    </div>

    <button
      on:click={() => router.redirect("/cards")}
      class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Back to Cards
    </button>
  </div>
{/if}

{#if showModal}
  <ConfirmationModal
    message={auctionWarningMessage}
    confirmAction={confirmDelete}
    cancelAction={() => (showModal = false)}
  />
{/if}

<AddAuctionModal
  bind:isVisible={showAuctionModal}
  on:close={() => (showAuctionModal = false)}
  on:auctionAdded={() => fetchCardDetails()}
  {cardId}
/>

{#if isEditing}
  <EditCardModal
    {updatedCard}
    on:save={saveChanges}
    on:cancel={() => (isEditing = false)}
  />
{/if}