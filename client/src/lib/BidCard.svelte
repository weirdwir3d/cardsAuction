<script>
        export let bid;
    console.log("Rendering Bid:", bid);

    // Determine the status symbol based on the bid's outcome
    let statusSymbol = 'Auction still running';
    if (bid.hasWon === "true") {
        statusSymbol = '✔️'; // Checkmark for won bids
    } else if (bid.hasWon === "false") {
        statusSymbol = '❌'; // X symbol for lost bids
    }
</script>

<div class="bid-card p-4 border rounded-lg shadow-md flex flex-col items-center">
    <h2 class="text-lg font-bold mb-2">{bid.cardName}</h2>
    <img src={bid.cardImageUrl} alt={bid.cardName} class="w-full h-40 object-cover mb-2 rounded" />
    <p class="text-xl font-semibold">Bid Amount: ${bid.bidAmount}</p>
    <p class="text-sm text-gray-500">Bid Date: {bid.publishedDateTime}</p>
    {#if statusSymbol}
        <p class="text-2xl">{statusSymbol}</p>
    {/if}
</div>

<style>
    .bid-card {
        transition: all 0.2s;
    }
    .bid-card:hover {
        transform: scale(1.05);
    }
</style>