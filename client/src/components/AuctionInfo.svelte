<script>
  export let auction;
  export let isAdmin;
  export let updatedAuction;
  export let toggleEdit;
</script>

<div>
  {#if isAdmin && updatedAuction}
    <div>
      <label><strong>Base Price: </strong></label>
      <input type="number" bind:value={updatedAuction.basePrice} class="border rounded p-1 w-full" />
    </div>
    <div>
      <label><strong>Published: </strong></label>
      <input type="text" bind:value={updatedAuction.publishedDateTime} class="border rounded p-1 w-full" placeholder="dd-mm-yyyy hh:mm:ss" />
    </div>
    <div>
      <label><strong>Ends: </strong></label>
      <input type="text" bind:value={updatedAuction.endDateTime} class="border rounded p-1 w-full" placeholder="dd-mm-yyyy hh:mm:ss" />
    </div>
  {:else}
    <p><strong>Base Price: </strong>{auction.basePrice} $</p>
    <p><strong>Published: </strong>{auction.publishedDateTime}</p>
    <p><strong>Ends: </strong>{auction.endDateTime}</p>
  {/if}
  {#if isAdmin}
    <button on:click={toggleEdit} class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit Auction</button>
  {/if}
</div>