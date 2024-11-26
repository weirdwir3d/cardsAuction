<script>
  import router from "page";
  import { onMount } from "svelte";
  import { tokenStore } from "../lib/TokenStore";
  import { checkLoggedIn, checkIsAdmin, getUserId } from "../lib/middleware";
  import AuctionBidsSection from "../components/AuctionBidsSection.svelte";
  import Countdown from "../components/Countdown.svelte";
  import CardDetails from "../components/CardInfo.svelte";
  import NewBidModal from "../components/modals/NewBidModal.svelte";
  import EditAuctionModal from "../components/modals/EditAuctionModal.svelte";
  import Alert from "../components/Alert.svelte";
  import * as utils from "../lib/utils";
  import * as API from "../lib/api";

  let token;
  let isLoggedIn = false;
  let isAdmin = false;

  let auctionId;
  let auction = null;
  let card = null;
  let bids = [];
  let users = [];
  let userId; //needed in case current user decides to place bid
  //editing
  let isEditing = false;
  let updatedAuction = {};
  //alert n modals
  let showAlert = false;
  let alertMessage = "";
  let alertType = "error";
  let showBidModal = false;
  let showEditModal = false;

  let endDateTimeForCountdown;
  let hasLastBidWon = bids.length > 0 && bids[bids.length - 1].hasWon; //if last bid has won, then no more bids can be made

  tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
    userId = getUserId();
  })();

  onMount(async () => {
    auctionId = window.location.pathname.split("/").pop();
    try {
      await fetchAuctionDetails();
      await fetchCardDetails();
      await fetchUsers();
      await fetchBids();
    } catch (error) {
      console.error("error fetching data:", error);
    }
  });

  async function fetchAuctionDetails() {
    try {
      auction = await API.fetchAuctionDetailsAPI(auctionId);
      const parts = auction.endDateTime.split(" ");
      const [day, month, year] = parts[0].split("-");
      //formate in Date format before passing it to Countdown
      endDateTimeForCountdown = `${year}-${month}-${day}T${parts[1]}`;
      updatedAuction = { ...auction };
    } catch (error) {
      console.error("Error retrieving auction details:", error);
    }
  }

  async function fetchCardDetails() {
    try {
      card = await API.fetchCardAPI(auction.cardId);
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

  async function fetchBids() {
    try {
      bids = await API.fetchBidsAPI({ auctionId });
      // console.log("fetched bids:", bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  }

  async function deleteBid(bidId) {
    try {
      await API.deleteBidAPI(bidId, token);
      //i could or should fetch bids again after deleting one (instead of filtering), but there are already so many network calls in this file
      bids = bids.filter((bid) => bid.id !== bidId);
      alertMessage = "Bid deleted successfully!!";
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

  //to display bidders
  async function fetchUsers() {
    try {
      users = await API.fetchUsersAPI();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  function toggleEdit() {
    updatedAuction = { ...auction };
    showEditModal = !showEditModal;
  }

  async function saveChanges() {
    try {
      auction = await API.saveAuctionChangesAPI(
        auctionId,
        updatedAuction,
        token
      );
      showEditModal = false;
      alertMessage = "Auction edited successfully!";
      alertType = "success";
      showAlert = true;
      await fetchAuctionDetails();
    } catch (error) {
      alertMessage = error.message;
      alertType = "error";
      showAlert = true;
    } finally {
      setTimeout(() => {
        showAlert = false;
      }, 4000);
    }
  }

  function viewCardDetails() {
    router.redirect(`/cards/${card.id}`);
  }

  async function handleConfirmBid(bidAmount) {
    try {
      //format current dateTime before sending it to backend. From Javascript Date format to 'dd-mm-yyyy hh:mm:ss'
      const currentDateTime = utils.formatDate(new Date());
      let newBid = {
        userId: userId,
        auctionId: parseInt(auctionId),
        bidAmount: parseFloat(bidAmount),
        publishedDateTime: currentDateTime,
      };
      await API.addBidAPI(newBid);
      await fetchBids();
      alertMessage = "Bid placed successfully ;)";
      alertType = "success";
      showAlert = true;
      showBidModal = false;
      setTimeout(() => {
        showAlert = false;
      }, 4000);
    } catch (error) {
      console.error("Error trying to place a bid:", error);
      alertMessage = error.message || "Error placing bid. please try again";
      alertType = "error";
      showAlert = true;
      showBidModal = false;
    }
  }

  async function deleteAuction() {
    try {
      await API.deleteAuctionAPI(auctionId, token);
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

<!-- Alert -->
<Alert message={alertMessage} type={alertType} isVisible={showAlert} />

<!-- Modal to add new bid -->
<NewBidModal
  isVisible={showBidModal}
  onClose={() => (showBidModal = false)}
  onConfirm={handleConfirmBid}
/>

<!-- Modal to edit auction -->
{#if showEditModal}
  <EditAuctionModal
    {auction}
    bind:updatedAuction
    on:save={saveChanges}
    on:cancel={toggleEdit}
  />
{/if}

<!-- Wait for auction and card data to load before html -->
{#if auction && card}
  <div class="flex flex-col min-h-screen">
    <div class="flex flex-col justify-between space-y-4 px-4">

      <!-- Card name -->
      <h1 class="text-2xl md:text-4xl font-bold mt-4 text-center">
        {card.name}
      </h1>

      <div class="flex flex-col md:flex-row justify-evenly">
        <div class="text-base md:text-lg space-y-4 md:w-2/4 mb-2">
          <!-- Auction details -->
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
              <label><strong>Published: </strong></label>
              <input
                type="text"
                bind:value={updatedAuction.publishedDateTime}
                class="border rounded p-1 w-full"
                placeholder="dd-mm-yyyy hh:mm:ss"
              />
            </div>
            <div>
              <label><strong>Ends: </strong></label>
              <input
                type="text"
                bind:value={updatedAuction.endDateTime}
                class="border rounded p-1 w-full"
                placeholder="dd-mm-yyyy hh:mm:ss"
              />
            </div>
          {:else}
            <p><strong>Base Price: </strong>{auction.basePrice} $</p>
            <p><strong>Published: </strong>{auction.publishedDateTime}</p>
            <p><strong>Ends: </strong>{auction.endDateTime}</p>
          {/if}

          <!-- ensure endDateTime !== null before loading Countdown -->
          {#if auction.endDateTime}
            <Countdown {auctionId} endDateTime={endDateTimeForCountdown} />
          {/if}

          <!-- Edit auction btn -->
          {#if isAdmin}
            <button
              on:click={toggleEdit}
              class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >Edit Auction</button
            >
          {/if}

        </div>

        <!-- Bids table -->
        <div class="w-full p-2 border rounded-lg bg-gray-200">
          {#if bids && bids.length > 0}
            <AuctionBidsSection
              {bids}
              {users}
              {isAdmin}
              onDeleteBid={deleteBid}
            />
          {:else}
            <p>No bids found.</p>
          {/if}

          {#if !hasLastBidWon}
          <!-- only if you are logged in you can bid -->
            <button
              on:click={() => (showBidModal = true)}
              class={`px-4 py-2 rounded hover:bg-green-600 ${isLoggedIn ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"} mt-4`}
            >
              {isLoggedIn ? "Place Bid" : "Log in to place a bid"}
            </button>
          {/if}
        </div>
      </div>

      <!-- Card details -->
      <CardDetails {card} />

      <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
        {#if isAdmin}
          <button
            on:click={viewCardDetails}
            class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >View Card</button
          >
          <button
            on:click={deleteAuction}
            class="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
            >Delete Auction</button
          >
        {/if}
      </div>

      <div class="flex flex-wrap justify-center md:justify-start gap-4">
        <button
          on:click={() => router.redirect("/auctions")}
          class="px-6 py-3 bg-primary text-white rounded hover:bg-blue-600"
        >
          Back to Auctions
        </button>
      </div>
      <div class="pb-16"></div>
    </div>

    <!-- Bottom bar (only visible on phones), showing latest bid and btn to place bid -->
    {#if bids && !hasLastBidWon}
      <div
        class="fixed bottom-0 left-0 right-0 bg-primary shadow-md p-4 md:hidden flex justify-between items-center"
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
          on:click={() => (showBidModal = true)}
          class={`px-4 py-2 rounded hover:bg-green-600 ${isLoggedIn ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
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
