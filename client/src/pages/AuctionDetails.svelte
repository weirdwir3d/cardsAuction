<script>
  import router from "page";
  import { onMount } from "svelte";
  import { tokenStore } from "../lib/TokenStore";
  import { checkLoggedIn, checkIsAdmin, getUserId } from "../lib/middleware";
  import AuctionBidsSection from "../components/AuctionBidsSection.svelte";
  import Countdown from "../components/Countdown.svelte";
  import CardDetails from "../components/CardInfo.svelte";
  import AddBidModal from "../components/modals/AddBidModal.svelte";
  import EditAuctionModal from "../components/modals/EditAuctionModal.svelte";
  import Button from "../components/buttons/Button.svelte";
  import PlaceBidButton from "../components/buttons/PlaceBidButton.svelte";
  import Alert from "../components/Alert.svelte";
  import * as helper from "../lib/helper";
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

  tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
    userId = getUserId();
  })();

  onMount(async () => {
    auctionId = window.location.pathname.split("/").pop();
    await fetchAuctionDetails();
    await fetchCardDetails();
    await fetchUsers();
    await fetchBids();
  });

  async function fetchAuctionDetails() {
    const response = await API.fetchAuctionDetailsAPI(auctionId);
    const data = await response.json();

    if (response.ok) {
      auction = data.auction;
      const parts = auction.endDateTime.split(" ");
      const [day, month, year] = parts[0].split("-");
      //formate in Date format before passing it to Countdown
      endDateTimeForCountdown = `${year}-${month}-${day}T${parts[1]}`;
      updatedAuction = { ...auction };
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  async function fetchCardDetails() {
    const response = await API.fetchCardDetailsAPI(auction.cardId);
    const data = await response.json();

    if (response.ok) {
      card = data.card;
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  async function fetchBids() {
    const response = await API.fetchBidsAPI({ auctionId });
    const data = await response.json();
    if (response.ok) {
      bids = data.bids;
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  async function deleteBid(auctionId, bidId) {
    const response = await API.deleteBidAPI(auctionId, bidId, token);
    const data = await response.json();

    if (response.ok) {
      //i could or should fetch bids again after deleting one (instead of filtering), but there are already so many network calls in this file
      bids = bids.filter((bid) => bid.id !== bidId);
      alertMessage = "Bid deleted successfully!!";
      alertType = "success";
      showAlert = true;
      setTimeout(() => {
        showAlert = false;
      }, 3000);
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  //to display bidders
  async function fetchUsers() {
    let response = await API.fetchUsersAPI();
    const data = await response.json();

    if (response.ok) {
      users = data.users;
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  function toggleEdit() {
    updatedAuction = { ...auction };
    showEditModal = !showEditModal;
  }

  async function saveChanges() {
    const response = await API.saveAuctionChangesAPI(
      auctionId,
      updatedAuction,
      token
    );
    const data = await response.json();

    if (response.ok) {
      auction = data.auction;

      showEditModal = false;
      alertMessage = "Auction edited successfully!";
      alertType = "success";
      showAlert = true;
      await fetchAuctionDetails();
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
    setTimeout(() => {
      showAlert = false;
    }, 4000);
  }

  function viewCardDetails() {
    router.redirect(`/cards/${card.id}`);
  }

  async function handleConfirmBid(bidAmount) {
    showAlert = false;

    if (hasAuctionEnded()) {
      showAlert = true;
      alertMessage = "You cannot place bids after the auction has ended";
      alertType = "error";
      return;
    }

    if (bidAmount <= 0) {
      showAlert = true;
      alertMessage = "Bid amount cannot be zero or less";
      alertType = "error";
      return;
    }
    //format current dateTime before sending it to backend. From Javascript Date format to 'dd-mm-yyyy hh:mm:ss'
    const currentDateTime = helper.formatDate(new Date());
    let newBid = {
      userId: userId,
      auctionId: parseInt(auctionId),
      bidAmount: parseFloat(bidAmount),
      publishedDateTime: currentDateTime,
    };
    const response = await API.addBidAPI(newBid);
    const data = await response.json();

    if (response.ok) {
      await fetchBids();
      alertMessage = "Bid placed successfully ;)";
      alertType = "success";
      showAlert = true;
      showBidModal = false;
      setTimeout(() => {
        showAlert = false;
      }, 4000);
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
      showBidModal = false;
    }
  }

  async function deleteAuction() {
    showAlert = false;
    if (isNaN(auctionId) || auctionId < 0) {
      showAlert = true;
      alertMessage = "Invalid auctionId. Please contact admin";
      alertType = "error";
      return;
    }

    const response = await API.deleteAuctionAPI(auctionId, token);
    const data = await response.json();

    if (response.ok) {
      alertMessage = "Auction deleted successfully!";
      alertType = "success";
      showAlert = true;
      setTimeout(() => {
        router.redirect("/auctions");
      }, 3000);
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }

  function hasAuctionEnded() {
    //convert auction endDateTime to Date obj
    const parsedEndDateTime = helper.parseDateTime(auction.endDateTime);
    const now = new Date();

    return now > parsedEndDateTime;
  }
</script>

<!-- Alert -->
<Alert message={alertMessage} type={alertType} isVisible={showAlert} />

<!-- Modal to add new bid -->
<AddBidModal
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
            <Button label="Edit auction" color="warning" onClick={toggleEdit} />
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

          {#if !hasAuctionEnded()}
            <!-- only if you are logged in you can bid -->
            <div class="hidden md:block">
              <PlaceBidButton
                {isLoggedIn}
                onClick={() => (showBidModal = true)}
              />
            </div>
          {/if}
        </div>
      </div>

      <!-- Card details -->
      <CardDetails {card} />

      <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
        {#if isAdmin}
          <Button
            label="View card"
            color="business"
            onClick={viewCardDetails}
          />
          <Button
            label="Delete auction"
            color="accent"
            onClick={deleteAuction}
          />
        {/if}
      </div>

      <div class="flex flex-wrap justify-center md:justify-start gap-4">
        <Button
          label="Back to auctions"
          color="gray"
          onClick={() => router.redirect("/auctions")}
        />
      </div>
      <div class="pb-20"></div>
    </div>

    <!-- Bottom bar (only visible on phones), showing latest bid and btn to place bid -->
    {#if bids && !hasAuctionEnded()}
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
        <div>
          <PlaceBidButton {isLoggedIn} onClick={() => (showBidModal = true)} />
        </div>
      </div>
    {/if}
  </div>
{:else}
  <p>Loading auction and card details...</p>
{/if}
