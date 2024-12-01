<script>
  export let bid;
  //   console.log("one bid:", bid);

  let statusSymbol = "Auction still running"; // default, in case hasWon == null
  if (bid.hasWon === true) {
    // emojis https://emojiterra.com/white-heavy-check-mark/
    statusSymbol = "✅";
  } else if (bid.hasWon === false) {
    statusSymbol = "❌";
  }
</script>

<div
  class="bg-background border-solid border-primary p-4 border-2 rounded-lg shadow-md flex flex-col items-center transition-transform duration-200 transform hover:scale-105"
>
  <h2 class="text-lg font-bold mb-2">{bid.cardName}</h2>
  <img
    src={bid.cardImageUrl}
    alt={bid.cardName}
    class="w-full h-40 object-cover mb-2 rounded"
  />
  <p class="text-xl font-semibold">You bidded: ${bid.bidAmount}</p>
  <p class="text-sm text-white">Bid Date: {bid.publishedDateTime}</p>
  {#if statusSymbol}
    <p class="text-2xl">{statusSymbol}</p>
  {/if}
</div>