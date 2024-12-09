<script>
  import { onMount } from "svelte";
  import * as middleware from "../lib/middleware";
  import BidCard from "../components/containers/BidContainer.svelte";
  import * as API from "../lib/api";

  let userId;
  let username;
  let email;
  let bids = [];
  //alert
  let alertMessage;
  let alertType;
  let isAlertVisible;

  onMount(async () => {
    try {
      userId = await middleware.getUserId();
      username = await middleware.getUsername();
      email = await middleware.getEmail();

      //load bids is userId !== null (0 is the userId for admin)
      if (userId || userId === 0) {
        await loadBids();
      }
    } catch (error) {
      alertMessage = "An error occurred while retrieving user info";
      alertType = "error";
      isAlertVisible = true;
    }
  });

  async function loadBids() {
    const response = await API.fetchBidsAPI({ userId });
    const data = await response.json();

    const latestBids = {};

    if (response.ok) {
      for (const bid of data.bids) {
        const auctionId = bid.auctionId;
        // check if this auction doesnt have a bid yet, or if the current bid is higher
        if (
          !latestBids[auctionId] ||
          bid.bidAmount > latestBids[auctionId].bidAmount
        ) {
          latestBids[auctionId] = bid; //save current bid as the highest
        }
      }

      const arrayBids = Object.values(latestBids); //turn to array

      //fetch all auctions and map them to cards
      const auctionsResponse = await API.fetchAuctionsAPI("All", "All", "", "");
      const auctionsData = await auctionsResponse.json();

      if (!auctionsResponse.ok) {
        alertMessage = "An error occurred while retrieving auctions data";
        alertType = "error";
        isAlertVisible = true;
      }

      const bidsWithCardData = [];

      for (const bid of arrayBids) {
        const auction = auctionsData.auctions.find(
          (auction) => auction.id === bid.auctionId
        );

        if (auction && auction.cardId != null) {
          const response = await API.fetchCardDetailsAPI(auction.cardId);
          const data = await response.json();

          if (response.ok) {
            const card = data.card;
            bidsWithCardData.push({
              ...bid,
              cardName: card.name,
              cardImageUrl: card.imageUrl,
            });
          } else {
            alertMessage = "An error occurred while retrieving cards data";
            alertType = "error";
            isAlertVisible = true;
          }
        }
      }
      bids = bidsWithCardData;

    } else {
      alertMessage = data.error;
      alertType = "error";
      isAlertVisible = true;
    }
  }
</script>

<div
  class="flex flex-col justify-between space-y-4 lg:space-y-0 lg:space-x-4 px-4"
>
  <h1 class="text-2xl p-4 md:text-3xl lg:text-4xl font-bold text-center">
    Profile
  </h1>

  {#if isAlertVisible}
    <div
      class={`alert ${alertType === "error" ? "bg-red-500 text-white" : ""} p-4 rounded mt-4`}
    >
      {alertMessage}
    </div>
  {/if}

  <div class="mt-4 p-4 bg-gray-100 rounded">
    <h2 class="text-lg font-semibold">Profile Information</h2>
    <p><strong>Username:</strong> {username}</p>
    <p><strong>Email:</strong> {email}</p>
  </div>

  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4"
  >
    {#each bids as bid}
      <BidCard {bid} />
    {/each}
  </div>
</div>
