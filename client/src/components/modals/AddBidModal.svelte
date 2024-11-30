<script>
  import Button from "../buttons/Button.svelte";
  export let isVisible = false;
  export let onClose;
  export let onConfirm;

  let bidAmount = "";

  //can be retrieved by parent AuctionDetails page
  function confirmBid() {
    onConfirm(bidAmount);
    bidAmount = "";
  }
</script>

{#if isVisible}
  <div
    class="fixed z-40 inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
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
        <Button label="Cancel" color="gray" onClick={onClose} />
        <Button label="Confirm" color="confirmation" onClick={confirmBid} />
      </div>
    </div>
  </div>
{/if}
