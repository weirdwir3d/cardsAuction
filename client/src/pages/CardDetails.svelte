<script>
  import router from "page";
  import { onMount } from "svelte";
  import { tokenStore } from "../lib/TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../lib/middleware";
  import AddAuctionModal from "../components/modals/AddAuctionModal.svelte";
  import EditCardModal from "../components/modals/EditCardModal.svelte";
  import ConfirmationModal from "../components/modals/ConfirmationModal.svelte";
  import Alert from "../components/Alert.svelte";
  import Button from "../components/buttons/Button.svelte";
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

  onMount(async () => {
    console.log("hi");
    cardId = window.location.pathname.split("/").pop();
    await fetchCardDetails();
  });

  async function fetchCardDetails() {
    const response = await API.fetchCardDetailsAPI(cardId);
    const data = await response.json();

    console.log("response:", data);

    if (response.ok) {
      card = data.card;
      updatedCard = { ...card };
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  function handleDelete() {
    if (card.auctionId !== -1) {
      auctionWarningMessage =
        "This card is associated with an auction. Deleting the card will also delete the auction. Do you want to proceed?";
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
    const response = await API.deleteCardAPI(cardId, token);
    const data = await response.json();

    if (response.ok) {
      alertMessage = "Card deleted successfully!";
      alertType = "success";
      showAlert = true;
      setTimeout(() => {
        router.redirect("/cards");
      }, 3000);
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  async function saveChanges(updatedCardData) {
    // console.log('updated Data: ', updatedCardData.detail)
    const response = await API.saveCardChangesAPI(
      cardId,
      updatedCardData.detail,
      token
    );
    const data = await response.json();

    console.log("data:", data);

    if (response.ok) {
      alertMessage = "Card edited successfully!";
      alertType = "success";
      showAlert = true;
      isEditing = false;
      fetchCardDetails();
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
    setTimeout(() => {
      showAlert = false;
    }, 4000);
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
          <Button
            label="View Auction"
            color="business"
            onClick={() => router.redirect(`/auctions/${card.auctionId}`)}
          />
        {:else if isAdmin && auctionId === -1}
          <Button
            label="Put Up for Auction"
            color="confirmation"
            onClick={() => (showAuctionModal = true)}
          />
        {/if}
      </div>
    </div>

    <div class="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
      {#if isAdmin}
        <div class="text-center md:text-left mt-6 space-x-4">
          <Button label="Edit" color="warning" onClick={openEditModal} />
          <Button label="Delete card" color="accent" onClick={handleDelete} />
        </div>
      {/if}
    </div>

    <Button
      label="Back to Cards"
      color="gray"
      onClick={() => router.redirect("/cards")}
    />
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
