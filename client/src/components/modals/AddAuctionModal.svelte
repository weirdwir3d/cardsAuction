<script>
  import { tokenStore } from "../../lib/TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../../lib/middleware";
  import { createEventDispatcher, onMount } from "svelte";
  import Alert from "../Alert.svelte";
  import { formatDate } from "../../lib/utils";
  import ModalAddCard from "./ModalAddCard.svelte";
  import { fetchCardsAPI } from "../../lib/api.js";

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
      cardsWithoutAuctions = await fetchCardsAPI();
      cardsWithoutAuctions = cardsWithoutAuctions.filter(
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
        if (response.status !== 201) {
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
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
    <Alert message={alertMessage} type={alertType} isVisible={showAlert} />
    <div class="bg-white rounded-lg p-6 md:p-8 max-w-full w-full sm:w-[400px] md:w-[500px] lg:w-[600px] shadow-lg">
      <h2 class="text-2xl font-bold mb-4 text-center">Add Auction</h2>
      <div class="space-y-4">
        <div>
          <label class="block"><strong>Select Card:</strong></label>
          <select bind:value={selectedCardId} class="border rounded p-2 w-full">
            {#each cardsWithoutAuctions as card (card.id)}
              <option value={card.id}>{card.name}</option>
            {/each}
          </select>
          {#if isFromAuctionsPage}
            <a
              href="#"
              on:click|preventDefault={() => (showAddCardModal = true)}
              class="text-blue-500 underline block mt-2 text-sm"
              >Add a new card</a
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
              class="border rounded p-2 w-full"
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
            class="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label class="block"><strong>End Time:</strong></label>
          <input
            type="time"
            bind:value={endTime}
            class="border rounded p-2 w-full"
          />
        </div>
      </div>
      <div class="mt-6 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          on:click={handleSubmit}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full sm:w-auto"
          >Add Auction</button
        >
        <button
          on:click={close}
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 w-full sm:w-auto">Cancel</button
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
