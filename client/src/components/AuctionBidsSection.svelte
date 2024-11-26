<!-- Display all bids for an auction in a table (from latest to oldest), with the winning bid (if any) highlighted in green -->
<script>
  export let bids = [];
  export let users = [];
  export let isAdmin = false;
  export let onDeleteBid;
</script>

<div class="p-4">
  <h3 class="text-lg font-bold mb-4">Bids:</h3>
  <div>
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
          <tr
            class="{bid.hasWon
              ? 'bg-green-100'
              : index % 2 === 0
                ? 'bg-white'
                : 'bg-gray-50'} text-sm md:text-base"
          >
            <td class="border px-2 md:px-4 py-2">${bid.bidAmount}</td>
            <td class="border px-2 md:px-4 py-2">{bid.publishedDateTime}</td>
            <td class="border px-2 md:px-4 py-2"
              >{users.find((user) => user.id === bid.userId)?.username ||
                "UnknownUser"}</td
            >
            <!-- admin can delete bids -->
            {#if isAdmin}
              <td class="border px-2 md:px-4 py-2 text-center">
                <button
                  on:click={() => onDeleteBid(bid.id)}
                  class="text-accent hover:text-red-700 flex justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 md:h-6 md:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
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