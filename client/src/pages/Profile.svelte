<script>
  import { onMount } from "svelte";
  import * as middleware from "../lib/middleware";
  import BidCard from "../components/BidContainer.svelte";
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
      } else {
        throw new Error("user id is not available");
      }
    } catch (error) {
      console.error("Error getting usre data:", error);
      alertMessage = "An error occurred while retrieving user info";
      alertType = "error";
      isAlertVisible = true;
    }
  });

  async function loadBids() {
    try {
      const data = await API.fetchBidsAPI({ userId });
      //   console.log("fetchBidsAPI:", data);

      if (!data) {
        throw new Error("no bids found in response");
      }

      const latestBids = {};

      for (const bid of data) {
        const auctionId = bid.auctionId;
        // check if this auction doesnt have a bid yet, or if the current bid is higher
        if (
          !latestBids[auctionId] ||
          bid.bidAmount > latestBids[auctionId].bidAmount
        ) {
          latestBids[auctionId] = bid; //save current bid as the highest
        }
      }
    //   console.log("latest bids:", latestBids);

      const arrayBids = Object.values(latestBids); //turn to array

    //   console.log("unique bids:", arrayBids);

      const bidsWithCardData = [];

      for (const bid of arrayBids) {
        const card = await API.fetchCardAPI(bid.auctionId);
        bidsWithCardData.push({
          ...bid,
          cardName: card.name,
          cardImageUrl: card.imageUrl
        });
      }

      bids = bidsWithCardData;
      //   console.log("Bids:", bids);
    } catch (error) {
      console.error("Error retrieving bids:", error);
      alertMessage = "an error occurred while retrieving bids.";
      alertType = "error";
      isAlertVisible = true;
    }
  }
</script>

<div
  class="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4 px-4"
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
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
  >
    {#each bids as bid}
      <BidCard {bid} />
    {/each}
  </div>
</div>
