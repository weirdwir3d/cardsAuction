<script>
  export let isVisible = false;
  export let onClose;
  export let onConfirm;

  let bidAmount = '';

  //can be retrieved by parent AuctionDetails page
  function confirmBid() {
    onConfirm(bidAmount);
    bidAmount = '';
  }
</script>

{#if isVisible}
  <div class="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-4 rounded shadow-lg max-w-sm w-full">
      <h2 class="text-lg font-bold mb-4">New Bid</h2>
      <div class="flex items-center">
        <input
          type="number"
          bind:value={bidAmount}
          class="border rounded p-1 flex-grow"
          placeholder="Enter bid amount"
        />
        <span class="ml-2">€</span>
      </div>
      <div class="mt-4 flex justify-end space-x-2">
        <button on:click={onClose} class="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        <button on:click={confirmBid} class="px-4 py-2 bg-green-500 text-white rounded">Confirm</button>
      </div>
    </div>
  </div>
{/if}