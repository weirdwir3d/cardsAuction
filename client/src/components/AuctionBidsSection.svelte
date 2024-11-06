<script>
  export let bids = [];
  export let users = [];
  export let isAdmin = false;
  export let onDeleteBid;
  $: console.log('bids:', bids);
</script>

<div class="p-4">
  <h3 class="text-lg font-bold mb-4">Bids:</h3>
  <div class="">
    <table class="table-auto w-full text-left border-collapse">
      <thead>
        <tr class="bg-gray-200 text-sm md:text-base">
          <th class="border px-2 md:px-4 py-2">Bid Amount</th>
          <th class="border px-2 md:px-4 py-2">Published</th>
          <th class="border px-2 md:px-4 py-2">Username</th>
          {#if isAdmin}
            <th class="border px-2 md:px-4 py-2">Actions</th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each [...bids].reverse() as bid, index}
          <tr class="{bid.hasWon ? 'bg-green-100' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} text-sm md:text-base">
            <td class="border px-2 md:px-4 py-2">${bid.bidAmount}</td>
            <td class="border px-2 md:px-4 py-2">{bid.publishedDateTime}</td>
            <td class="border px-2 md:px-4 py-2">{users.find(user => user.id === bid.userId)?.username || 'Unknown'}</td>
            {#if isAdmin}
              <td class="border px-2 md:px-4 py-2 text-center">
                <button on:click={() => onDeleteBid(bid.id)} class="text-red-500 hover:text-red-700 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-1 12H6L5 7M4 7h16M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                  </svg>
                </button>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
