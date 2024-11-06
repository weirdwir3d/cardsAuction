<script>
  import AddAuctionModal from "../components/ModalAddAuction.svelte";
  import ModalEditCard from "../components/ModalEditCard.svelte";
  import { onMount, onDestroy } from "svelte";
  import router from "page";
  import { tokenStore } from "../lib/TokenStore";
  import Alert from "../components/Alert.svelte";
  import ModalConfirmation from "../components/ModalConfirmation.svelte";
  import { checkLoggedIn, checkIsAdmin } from "../lib/middleware";
  import { fetchCardAPI, deleteCardAPI, saveCardChangesAPI } from "../lib/api";

  let cardId;
  let card;
  let auction;
  let auctionId = -1;
  let isEditing = false;
  let updatedCard = {};
  let token;
  let showAlert = false;
  let alertType = "success";
  let alertMessage = "";
  let isLoggedIn = false;
  let isAdmin = false;
  let showModal = false;
  let auctionWarningMessage = "";
  let showAuctionModal = false;

  const unsubscribe = tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  });

  onDestroy(() => {
    unsubscribe();
  });

  async function fetchCardDetails() {
    try {
      card = await fetchCardAPI(cardId);
      updatedCard = { ...card };
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

  function openAuctionModal() {
    showAuctionModal = true;
  }

  function closeAuctionModal() {
    showAuctionModal = false;
  }

  function handleDelete() {
    if (card.auctionId !== -1) {
      auctionWarningMessage = `This card is associated with an auction. Deleting the card will also delete the auction. Do you want to proceed?`;
      showModal = true;
    } else {
      deleteCard();
    }
  }

  function confirmDelete() {
    showModal = false;
    deleteCard();
  }

  function cancelDelete() {
    showModal = false;
  }

  function openEditModal() {
    updatedCard = { ...card }; // Reset updatedCard to the current card details each time editing starts
    isEditing = true;
  }

  function closeEditModal() {
    isEditing = false;
  }

  async function deleteCard() {
    try {
      await deleteCardAPI(cardId, token);
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
    try {
      card = await saveCardChangesAPI(cardId, updatedCardData, token);
      alertMessage = "Card edited successfully!";
      alertType = "success";
      showAlert = true;
      fetchCardDetails(); // Refresh to ensure the card data is up-to-date
      closeEditModal();
    } catch (error) {
      alertMessage = `Error updating card: ${error.message}`;
      alertType = "error";
      showAlert = true;
      console.error("Error updating card details:", error);
    }
  }

  onMount(() => {
    cardId = window.location.pathname.split("/").pop();
    fetchCardDetails();
  });
</script>

<Alert message={alertMessage} type={alertType} isVisible={showAlert} />

{#if card}
  <div class="p-4 max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold mb-4 text-center md:text-left">
      {card.name}
    </h1>

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
            class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            View Auction
          </button>
        {:else if isAdmin && auctionId === -1}
          <button
            on:click={openAuctionModal}
            class="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
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
          class="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Edit
        </button>
        <button
          on:click={handleDelete}
          class="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete Card
        </button>
      </div>
    {/if}
    </div>

    <button
      on:click={() => router.redirect("/cards")}
      class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Back to Cards
    </button>
  </div>
{/if}

{#if showModal}
  <ModalConfirmation
    message={auctionWarningMessage}
    confirmAction={confirmDelete}
    cancelAction={cancelDelete}
  />
{/if}

<AddAuctionModal
  bind:isVisible={showAuctionModal}
  on:close={closeAuctionModal}
  on:auctionAdded={() => fetchCardDetails()}
  {cardId}
/>

{#if isEditing}
  <ModalEditCard
    {updatedCard}
    on:save={saveChanges}
    on:cancel={closeEditModal}
  />
{/if}