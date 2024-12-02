<script>
  import { tokenStore } from "../../lib/TokenStore";
  import { createEventDispatcher, onMount } from "svelte";
  import Button from "../buttons/Button.svelte";
  import Alert from "../Alert.svelte";
  import * as helper from "../../lib/helper";
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
  let alertMessage;
  let showAlert = false;
  let alertType = "";

  tokenStore.subscribe((value) => {
    token = value.token;
  });

  onMount(() => {
    fetchCards();
  });

  async function fetchCards() {
    const response = await API.fetchCardsAPI();
    const data = await response.json();

    if (response.ok) {
      cards = data.cards;
      cardsWithoutAuctions = cards.filter((card) => card.auctionId == -1);
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  async function addAuction() {
    showAlert = false;

    const parsedBasePrice = Number(basePrice);

    if (parsedBasePrice <= 0) {
      alertMessage = "Base price cannot be zero or less";
      alertType = "error";
      showAlert = true;
      return;
    }

    //problem is when a user picks a date with the calendar, endDate is in this format: yyy-mm-dd
    // reformat to dd-mm-yyyy
  const [year, month, day] = endDate.split("-");
  const formattedEndDate = `${day}-${month}-${year}`;
  const reformattedEndDateTime = `${formattedEndDate} ${endTime}:00`;

    if (!helper.isValidDateTime(reformattedEndDateTime)) {
      alertMessage = "Select end date and time";
      alertType = "error";
      showAlert = true;
      return;
    }

    const endDateTimeString = `${endDate}T${endTime}`;
    const endDateTime = new Date(endDateTimeString);
    const formattedEndDateTime = helper.formatDate(endDateTime);
    const currentDateTime = helper.formatDate(new Date());

    const auctionData = {
      cardId: selectedCardId,
      basePrice: parsedBasePrice,
      publishedDateTime: currentDateTime,
      endDateTime: formattedEndDateTime,
      token,
    };

    const response = await API.addAuctionAPI(auctionData);
    const data = await response.json();

    if (response.ok) {
      alertMessage = "Auction added successfully!";
      alertType = "success";
      showAlert = true;

      setTimeout(() => {
        dispatch("auctionAdded");
        showAlert = false;
        close();
      }, 2000);
    } else {
      alertMessage = data.error;
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
        <Button label="Add auction" color="confirmation" onClick={addAuction} />

        <Button label="Cancel" color="gray" onClick={close} />
      </div>
    </div>
  </div>

  <!-- Add new card modal -->
  {#if showAddCardModal}
    <AddCardModal
      on:close={() => (showAddCardModal = false)}
      on:cardAdded={() => fetchCards()}
    />
  {/if}
{/if}
