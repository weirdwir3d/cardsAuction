<script>
  import { tokenStore } from "../TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../middleware";
  import { createEventDispatcher, onMount } from "svelte";
  import Alert from "../lib/Alert.svelte";
  import { formatDate } from "../utils";
  import ModalAddCard from "./ModalAddCard.svelte";

  export let isVisible = false;
  export let isFromAuctionsPage = false;
  const dispatch = createEventDispatcher();

  let token;
  let isLoggedIn = false;
  let isAdmin = false;
  let basePrice = "";
  let publishedDateTime = "";
  let endDate = "";
  let endTime = "";
  let alertMessage = "";
  let showAlert = false;
  let alertType = "";
  let cardsWithoutAuctions = [];
  let selectedCardId;
  let showAddCardModal = false;

  tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  });

  async function fetchCards() {
    try {
      const response = await fetch("http://localhost:3000/cards");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      cardsWithoutAuctions = data.cardsData.filter(
        (card) => card.auctionId == -1
      );
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  }

  onMount(() => {
    fetchCards();
  });

  async function handleCardAdded(event) {
    const { name } = event.detail;
    console.log("cardName:", name);
    fetchCards();
  }

  function handleSubmit() {
    showAlert = false;

    const endDateTimeString = `${endDate}T${endTime}`;
    const endDateTime = new Date(endDateTimeString);
    const formattedEndDateTime = formatDate(endDateTime);
    const currentDateTime = formatDate(new Date());

    const auctionData = {
      cardId: selectedCardId,
      basePrice: parseFloat(basePrice),
      publishedDateTime: currentDateTime,
      endDateTime: formattedEndDateTime,
    };

    fetch("http://localhost:3000/auctions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(auctionData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to add auction.");
        }
        return response.json();
      })
      .then(() => {
        alertMessage = "Auction added successfully!";
        alertType = "success";
        showAlert = true;

        setTimeout(() => {
          dispatch("auctionAdded", { cardId: selectedCardId });
          showAlert = false;
          close();
        }, 2000);
      })
      .catch((error) => {
        alertMessage = error.message;
        alertType = "error";
        showAlert = true;
      });
  }

  function close() {
    isVisible = false;
    basePrice = "";
    publishedDateTime = "";
    endDate = "";
    endTime = "";
    showAddCardModal = false;
  }
</script>

{#if isVisible}
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
  >
    <Alert message={alertMessage} type={alertType} isVisible={showAlert} />
    <div class="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
      <h2 class="text-2xl font-bold mb-4">Add Auction</h2>
      <div class="space-y-4">
        <div>
          <label class="block"><strong>Select Card:</strong></label>
          <select bind:value={selectedCardId} class="border rounded p-1 w-full">
            {#each cardsWithoutAuctions as card (card.id)}
              <option value={card.id}>{card.name}</option>
            {/each}
          </select>
          {#if isFromAuctionsPage}
            <a
              href="#"
              on:click|preventDefault={() => (showAddCardModal = true)}
              class="text-blue-500 underline">Add a new card</a
            >
          {/if}
        </div>
        <div>
          <label class="block"><strong>Base Price:</strong></label>
          <div class="flex items-center">
            <input
              type="number"
              bind:value={basePrice}
              min="1"
              class="border rounded p-1 w-full"
              placeholder="Enter base price"
            />
            <span class="ml-2">$</span>
          </div>
        </div>
        <div>
          <label class="block"><strong>End Date:</strong></label>
          <input
            type="date"
            bind:value={endDate}
            class="border rounded p-1 w-full"
          />
        </div>
        <div>
          <label class="block"><strong>End Time:</strong></label>
          <input
            type="time"
            bind:value={endTime}
            class="border rounded p-1 w-full"
          />
        </div>
      </div>
      <div class="mt-4 flex justify-between">
        <button
          on:click={handleSubmit}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >Post Auction</button
        >
        <button
          on:click={close}
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button
        >
      </div>
    </div>
  </div>

  {#if showAddCardModal}
    <ModalAddCard
      on:close={() => (showAddCardModal = false)}
      on:cardAdded={handleCardAdded}
    />
  {/if}
{/if}

<style>
  @media (max-width: 640px) {
    div {
      max-width: 90%;
      padding: 2rem;
    }
  }
</style>
