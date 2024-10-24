<script>
  import AddAuctionModal from "../lib/AddAuctionModal.svelte";
  import { onMount, onDestroy } from "svelte";
  import router from "page";
  import { tokenStore } from "../TokenStore";
  import Alert from "../lib/Alert.svelte";
  import ModalConfirmation from "../lib/ModalConfirmation.svelte";
  import { checkLoggedIn, checkIsAdmin } from "../middleware";
  import { fetchCardAPI, deleteCardAPI, saveCardChangesAPI } from "../api";

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
  let showModal = false; // To track if the modal should be shown
  let auctionWarningMessage = ""; // Warning message for the modal
  let showAuctionModal = false;

  function openAuctionModal() {
    console.log("Opening auction modal with cardId:", cardId); // Set the selectedCardId to the current cardId
    showAuctionModal = true; // Then show the modal
  }

  function closeAuctionModal() {
    showAuctionModal = false;
  }

  const unsubscribe = tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
    console.log("isAdmin:", isAdmin);
  });

  // Unsubscribe when the component is destroyed
  onDestroy(() => {
    unsubscribe();
  });

  // Show confirmation modal if the card is associated with an auction
  function handleDelete() {
    if (card.auctionId !== -1) {
      auctionWarningMessage = `This card is associated with an auction. Deleting the card will also delete the auction. Do you want to proceed?`;
      showModal = true; // Show the modal
    } else {
      deleteCard(); // Proceed with delete if no auction is associated
    }
  }

  function confirmDelete() {
    showModal = false;
    deleteCard(); // Delete confirmed by user
  }

  function cancelDelete() {
    showModal = false; // Cancel the delete operation
  }

  async function fetchCardDetails() {
    try {
      card = await fetchCardAPI(cardId);
      updatedCard = { ...card };
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

  // Listen for the auctionAdded event
  async function handleAuctionAdded(event) {
    const { cardId } = event.detail;
    console.log("cardId and card.id:", cardId + " " + card.id);

    if (cardId == card.id) {
      console.log("updating card page...");
      // If the auction is linked to this card, update the card details
      await fetchCardDetails();
    }
  }

  onMount(() => {
    cardId = window.location.pathname.split("/").pop();
    fetchCardDetails();
  });

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

  function toggleEdit() {
    isEditing = !isEditing;
  }

  async function saveChanges() {
    try {
      card = await saveCardChangesAPI(cardId, updatedCard, token);
      isEditing = false;
      alertMessage = "Card edited successfully!";
      alertType = "success"; // Set alert type to success
      showAlert = true;
      await fetchCardDetails();
      setTimeout(() => {
        showAlert = false;
      }, 4000);
    } catch (error) {
      // Set the alert message and type to display the error
      alertMessage = `Error updating card: ${error.message}`;
      alertType = "error"; // Set alert type to error
      showAlert = true;
      setTimeout(() => {
        showAlert = false;
      }, 4000);
      console.error("Error updating card details:", error);
    }
  }
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
        {#if isEditing}
          <div>
            <label><strong>Description: </strong></label>
            <textarea
              bind:value={updatedCard.description}
              class="border rounded p-1 w-full"
            />
          </div>
          <div>
            <label><strong>Type:</strong></label>
            <select
              bind:value={updatedCard.type}
              class="border rounded p-1 w-full"
            >
              <option value="monster">Monster</option>
              <option value="trap">Trap</option>
              <option value="spell">Spell</option>
            </select>
          </div>
          <div>
            <label><strong>Rarity:</strong></label>
            <select
              bind:value={updatedCard.rarity}
              class="border rounded p-1 w-full"
            >
              <option value="rare">Rare</option>
              <option value="super rare">Super Rare</option>
              <option value="ultra rare">Ultra Rare</option>
              <option value="unique">Unique</option>
            </select>
          </div>
        {:else}
          <p><strong>Description: </strong>{card.description}</p>
          <p><strong>Type:</strong> {card.type}</p>
          <p><strong>Rarity:</strong> {card.rarity}</p>
        {/if}

        {#if card.auctionId !== -1}
          <!-- <p><strong>Auction ID:</strong> {card.auctionId}</p> -->
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

    {#if isAdmin}
      <div class="text-center md:text-left mt-6 space-x-4">
        {#if isEditing}
          <button
            on:click={saveChanges}
            class="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Save Changes
          </button>
          <button
            on:click={toggleEdit}
            class="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        {:else}
          <button
            on:click={toggleEdit}
            class="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Edit
          </button>
        {/if}

        <button
          on:click={handleDelete}
          class="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete Card
        </button>
      </div>
    {/if}

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
  on:auctionAdded={handleAuctionAdded}
  {cardId}
/>
