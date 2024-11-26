<script>
  import { tokenStore } from "../../lib/TokenStore";
  import { createEventDispatcher, onMount } from "svelte";
  import Alert from "../Alert.svelte";
  import { formatDate } from "../../lib/utils";
  import AddCardModal from "./AddCardModal.svelte";
  import * as API from "../../lib/api.js";

  export let isVisible = false;
  export let isFromAuctionsPage = false;
  //needed to reload UI after new auction is added
  const dispatch = createEventDispatcher();

  let token;
  let cards = [];
  let basePrice = "";
  let endDate = "";
  let endTime = "";
  let cardsWithoutAuctions = [];
  let selectedCardId;
  let showAddCardModal = false;
  //alert
  let alertMessage = "";
  let showAlert = false;
  let alertType = "";

  tokenStore.subscribe((value) => {
    token = value.token;
  });

    onMount(() => {
    fetchCards();
  });

  async function fetchCards() {
    try {
      cards = await API.fetchCardsAPI();
      cardsWithoutAuctions = cards.filter((card) => card.auctionId == -1);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  }

  async function addAuction() {
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
      token,
    };

    try {
      let data = await API.addAuctionAPI(auctionData);
      // console.log('new auction being sent:', data)

      alertMessage = "Auction added successfully!";
      alertType = "success";
      showAlert = true;

      setTimeout(() => {
        dispatch("auctionAdded");
        showAlert = false;
        close();
      }, 2000);
    } catch (error) {
      alertMessage = error.message;
      alertType = "error";
      showAlert = true;
    }
  }

  function close() {
    isVisible = false;
    basePrice = "";
    endDate = "";
    endTime = "";
    showAddCardModal = false;
  }
</script>

{#if isVisible}
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
  >
  <!-- Alert -->
    <Alert message={alertMessage} type={alertType} isVisible={showAlert} />

    <div
      class="bg-white rounded-lg p-6 md:p-8 max-w-full w-full sm:w-[400px] md:w-[500px] lg:w-[600px] shadow-lg"
    >
      <h2 class="text-2xl font-bold mb-4 text-center">Add Auction</h2>
      <div class="space-y-4">
        <div>
          <label class="block"><strong>Select Card:</strong></label>
          <select bind:value={selectedCardId} class="border rounded p-2 w-full">
            <!-- auctionless cards list -->
            {#each cardsWithoutAuctions as card (card.id)}
              <option value={card.id}>{card.name}</option>
            {/each}
          </select>
          {#if isFromAuctionsPage}
            <a
              href="#"
              on:click={() => (showAddCardModal = true)}
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
      <div
        class="mt-6 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2"
      >
      <!-- add auction btn -->
        <button
          on:click={addAuction}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full sm:w-auto"
          >Add Auction</button
        >
        <button
          on:click={close}
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 w-full sm:w-auto"
          >Cancel</button
        >
      </div>
    </div>
  </div>

  <!-- Add new card modal -->
  {#if showAddCardModal}
    <AddCardModal
      on:close={() => (showAddCardModal = false)}
      on:cardAdded={() => (fetchCards())}
    />
  {/if}
{/if}