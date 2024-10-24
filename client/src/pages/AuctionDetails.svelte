<script>
  import { onMount } from "svelte";
  import router from "page";
  import { tokenStore } from "../TokenStore";
  import Alert from "../lib/Alert.svelte";
  import { checkLoggedIn, checkIsAdmin, getUserId } from "../middleware";
  import { formatDate, getCookie } from "../utils";
  import Countdown from "../lib/Countdown.svelte";
  import NewBidModal from "../lib/NewBidModal.svelte";
  import AuctionBidsSection from "../lib/AuctionBidsSection.svelte";
  import {
    fetchAuctionDetailsAPI,
    fetchCardAPI,
    fetchBidsAPI,
    deleteBidAPI,
    fetchUsersAPI,
    saveAuctionChangesAPI,
    deleteAuctionAPI,
    addBidAPI
  } from "../api";

  let auctionId;
  let endDateTimeForCountdown;
  let auction = null;
  let card = null;
  let bids = [];
  let users = [];
  let userId;
  let isEditing = false;
  let updatedAuction = {};
  let token;
  let authToken;
  let isLoggedIn = false;
  let isAdmin = false;
  let showAlert = false;
  let alertMessage = "";
  let alertType = "success";
  let showBidModal = false;

  $: lastBidHasWon = bids.length > 0 && bids[bids.length - 1].hasWon;

  tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
    userId = getUserId();
    console.log("authToken:", authToken);
  })();

  async function fetchAuctionDetails() {
    try {
      auction = await fetchAuctionDetailsAPI(auctionId);
      const parts = auction.endDateTime.split(" ");
      const [day, month, year] = parts[0].split("-");
      endDateTimeForCountdown = `${year}-${month}-${day}T${parts[1]}`;
      updatedAuction = { ...auction };
    } catch (error) {
      console.error("Error retrieving auction details:", error);
    }
  }

  async function fetchCardDetails() {
    try {
      card = await fetchCardAPI(auction.cardId);
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

async function fetchBids() {
    try {
        bids = await fetchBidsAPI({ auctionId });
        console.log('Fetched bids:', bids); // Add this line
    } catch (error) {
        console.error("Error fetching bids:", error);
    }
}

  async function deleteBid(bidId) {
    try {
      await deleteBidAPI(bidId, token);
      bids = bids.filter((bid) => bid.id !== bidId);
      alertMessage = "Bid deleted successfully";
      alertType = "success";
      showAlert = true;
      setTimeout(() => {
        showAlert = false;
      }, 3000);
    } catch (error) {
      alertMessage = "Error deleting bid";
      alertType = "error";
      showAlert = true;
      console.error("Error deleting bid:", error);
    }
  }

  async function fetchUsers() {
    try {
      users = await fetchUsersAPI();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  onMount(() => {
    auctionId = window.location.pathname.split("/").pop();
    authToken = getCookie("authToken");
    fetchAuctionDetails().then(() => {
      fetchCardDetails();
      fetchUsers();
      fetchBids();
    });
  });

  function toggleEdit() {
    isEditing = !isEditing;
  }

  async function saveChanges() {
    try {
      auction = await saveAuctionChangesAPI(auctionId, updatedAuction, token);
      isEditing = false;
      alertMessage = "Auction edited successfully!";
      showAlert = true;
      await fetchAuctionDetails();
      setTimeout(() => {
        showAlert = false;
      }, 4000);
    } catch (error) {
      console.error("Error updating auction details:", error);
    }
  }

  function viewCardDetails() {
    router.redirect(`/cards/${card.id}`);
  }

  function openBidModal() {
    showBidModal = true;
  }

  function closeBidModal() {
    showBidModal = false;
  }

  async function handleConfirmBid(bidAmount) {
    try {
      const currentDateTime = formatDate(new Date());
      let newBid = {
        userId: userId,
        auctionId: parseInt(auctionId),
        bidAmount: parseFloat(bidAmount),
        publishedDateTime: currentDateTime,
      };
      await addBidAPI(newBid);
      await fetchBids();
      alertMessage = "Bid placed successfully!";
      alertType = "success";
      showAlert = true;
      closeBidModal();
      setTimeout(() => {
        showAlert = false;
      }, 4000);
    } catch (error) {
      console.error("Error trying to place a bid:", error);
      alertMessage = error.message || "Error placing bid. Please try again.";
      alertType = "error";
      showAlert = true;
      closeBidModal();
    }
  }

  async function deleteAuction() {
    try {
      await deleteAuctionAPI(auctionId, token);
      alertMessage = "Auction deleted successfully!";
      alertType = "success";
      showAlert = true;
      setTimeout(() => {
        router.redirect("/auctions");
      }, 3000);
    } catch (error) {
      alertMessage = "Error deleting auction";
      alertType = "error";
      showAlert = true;
      console.error("Error deleting auction:", error);
    }
  }
</script>

<Alert message={alertMessage} type={alertType} isVisible={showAlert} />
<NewBidModal
  isVisible={showBidModal}
  onClose={closeBidModal}
  onConfirm={handleConfirmBid}
/>

{#if auction && card}
  <div class="flex flex-col min-h-screen">
    <div class="flex-grow p-4 max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold mb-4 text-center md:text-left">
        {card.name}
      </h1>

      <!-- Auction details section -->
      <div class="text-lg space-y-4">
        {#if isAdmin && isEditing}
          <div>
            <label><strong>Base Price: </strong></label>
            <input
              type="number"
              bind:value={updatedAuction.basePrice}
              class="border rounded p-1 w-full"
            />
          </div>
          <div>
            <label><strong>Published Date/Time: </strong></label>
            <input
              type="text"
              bind:value={updatedAuction.publishedDateTime}
              class="border rounded p-1 w-full"
              placeholder="dd-mm-yyyy hh:mm:ss"
            />
          </div>
          <div>
            <label><strong>End Date/Time: </strong></label>
            <input
              type="text"
              bind:value={updatedAuction.endDateTime}
              class="border rounded p-1 w-full"
              placeholder="dd-mm-yyyy hh:mm:ss"
            />
          </div>
        {:else}
          <p><strong>Base Price: </strong>{auction.basePrice}</p>
          <p>
            <strong>Published Date/Time: </strong>{auction.publishedDateTime}
          </p>
          <p><strong>End Date/Time: </strong>{auction.endDateTime}</p>
        {/if}

        {#if auction.endDateTime}
          <Countdown {auctionId} endDateTime={endDateTimeForCountdown} />
        {/if}
      </div>

      <!-- Current bid card with bid history -->
      <!-- Current bid card with bid history -->
      <div class="mt-8">
        <div class="p-6 border rounded-lg bg-gray-100">
        {#if bids && bids.length > 0}
            <AuctionBidsSection {bids} {users} {isAdmin} onDeleteBid={deleteBid} />
        {:else}
            <p>No bids found.</p> <!-- Add a fallback message -->
        {/if}


          {#if !lastBidHasWon}
            <button
              on:click={openBidModal}
              class={`px-4 py-2 rounded hover:bg-green-600 md:block ml-4 ${isLoggedIn ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
              disabled={!isLoggedIn}
            >
              {isLoggedIn ? "Place Bid" : "Log in to place a bid"}
            </button>
          {/if}
        </div>
      </div>

      <!-- Display card details -->
      <div
        class="flex flex-col md:flex-row items-center md:items-start gap-6 mt-6"
      >
        <img
          src={card.imageUrl}
          alt={card.name}
          class="w-full max-w-xs md:max-w-md lg:max-w-lg h-auto object-contain rounded-lg mx-auto"
        />

        <div class="text-lg space-y-4">
          <p><strong>Description: </strong>{card.description}</p>
          <p><strong>Type:</strong> {card.type}</p>
          <p><strong>Rarity:</strong> {card.rarity}</p>

          <!-- {#if card.auctionId !== -1}
          <p><strong>Auction ID:</strong> {card.auctionId}</p>
        {/if} -->
        </div>
      </div>

      <!-- Auction editing controls -->
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
              Edit Auction
            </button>
          {/if}

          <button
            on:click={viewCardDetails}
            class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            View Card
          </button>

          <button
            on:click={deleteAuction}
            class="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete Auction
          </button>
        </div>
      {/if}

      <button
        on:click={() => router.redirect("/auctions")}
        class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mt-6"
      >
        Back to Auctions
      </button>

      <!-- Add padding to avoid overlap with fixed bottom bar -->
      <div class="pb-16"></div>
    </div>

    <!-- Fixed Bottom Bar for mobile -->
    {#if bids && !lastBidHasWon}
      <div
        class="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 md:hidden flex justify-between items-center"
      >
        {#if bids.length > 0}
          <p class="text-lg">
            <strong>Current Bid: </strong>${bids[bids.length - 1].bidAmount}
          </p>
        {:else}
          <p class="text-lg">
            <strong>No bids yet. </strong>Be the first to bid!
          </p>
        {/if}
        <button
          on:click={openBidModal}
          class={`px-4 py-2 rounded hover:bg-green-600 md:block ml-4 ${isLoggedIn ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          disabled={!isLoggedIn}
        >
          {isLoggedIn ? "Place Bid" : "Log in to place a bid"}
        </button>
      </div>
    {/if}
  </div>
{:else}
  <p>Loading auction and card details...</p>
{/if}
