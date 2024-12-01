<script>
  export let card;
  export let auction;
  import router from "page";
  import * as helper from "../../lib/helper";

  function handleClick() {
    router.redirect(`/auctions/${auction.id}`); // navigate without page refresh
  }

  hasAuctionEnded();

  function hasAuctionEnded() {
    //convert auction endDateTime to Date obj
    const parsedEndDateTime = helper.parseDateTime(auction.endDateTime);
    // const endDateTime = new Date(auction.endDateTime);
    console.log(parsedEndDateTime, "for auctionId:", auction.id);

    const now = new Date();
  
    return now > parsedEndDateTime;
  }
</script>

<div
  class="bg-background items-center border-solid border-2 border-accent p-2 shadow-md rounded-lg max-w-xs mx-auto cursor-pointer flex flex-col"
  on:click={() => router.redirect(`/auctions/${auction.id}`)}
  role="button"
  tabindex="0"
  on:keypress={(e) => e.key === "Enter" && handleClick()}
>
  {#if card}
    <h2 class="text-lg font-bold mb-2 text-center text-white hover:text-accent">
      {card.name}
    </h2>
    <div class="flex-grow">
      <img
        src={card.imageUrl}
        alt={card.name}
        class="w-full h-auto object-contain rounded-lg"
      />
    </div>
    <p class="text-center text-accent font-semibold mt-2">
      {hasAuctionEnded() ? "Ended" : "Running"}
    </p>
  {:else}
    <p>No card available</p>
  {/if}
</div>
