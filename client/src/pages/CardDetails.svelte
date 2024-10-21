<script>
  import AddAuctionModal from "../lib/AddAuctionModal.svelte";
  import { onMount, onDestroy } from "svelte";
  import router from "page";
  import { tokenStore } from "../TokenStore";
  import Alert from "../lib/Alert.svelte";
  import ModalConfirmation from "../lib/ModalConfirmation.svelte";
  import { checkLoggedIn, checkIsAdmin } from "../middleware";

  let cardId;
  let card; 
  let auction;
  let auctionId = -1;
  let isEditing = false;
  let updatedCard = {};
  let token;
  let showAlert = false;
  let alertMessage = "";
  let isLoggedIn = false;
  let isAdmin = false;
  let showModal = false; // To track if the modal should be shown
  let auctionWarningMessage = ""; // Warning message for the modal
  let showAuctionModal = false;

function openAuctionModal() {
    console.log('Opening auction modal with cardId:', cardId); // Set the selectedCardId to the current cardId
    showAuctionModal = true; // Then show the modal
}

  function closeAuctionModal() {
    showAuctionModal = false;
  }

  const unsubscribe = tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
    console.log('isAdmin:', isAdmin)
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
      const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      card = data.foundCard;
      // console.log('CARD:', card)
      updatedCard = { ...card };
      auctionId = card.auctionId;
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

      // Listen for the auctionAdded event
    async function handleAuctionAdded(event) {
        const { cardId } = event.detail;
        console.log('cardId and card.id:', cardId + " " + card.id)

        if (cardId == card.id) {
          console.log('updating card page...')
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
      const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      alertMessage = "Card deleted successfully!";
      showAlert = true;

      setTimeout(() => {
        showAlert = false;
        router.redirect("/cards");
      }, 2000);
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  }

  function toggleEdit() {
    isEditing = !isEditing;
  }

  async function saveChanges() {
    try {
      const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedCard),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      card = data.card;
      isEditing = false;

      alertMessage = "Card edited successfully!";
      showAlert = true;

      setTimeout(() => {
        showAlert = false;
      }, 4000);
    } catch (error) {
      console.error("Error updating card details:", error);
    }
  }
</script>

<Alert message={alertMessage} type="success" isVisible={showAlert} />

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
            <input
              type="text"
              bind:value={updatedCard.type}
              class="border rounded p-1 w-full"
            />
          </div>
          <div>
            <label><strong>Rarity:</strong></label>
            <input
              type="text"
              bind:value={updatedCard.rarity}
              class="border rounded p-1 w-full"
            />
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
{:else}
  {#if isAdmin && auctionId === -1}
    <button
      on:click={openAuctionModal}
      class="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
    >
      Put Up for Auction
    </button>
  {/if}
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
  cardId={cardId}
/>

