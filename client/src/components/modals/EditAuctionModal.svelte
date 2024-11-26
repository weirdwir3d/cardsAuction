<script>
  import Button from "../Button.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let auction;
  export let updatedAuction;
</script>

<div
  class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
>
  <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
    <h2 class="text-xl font-bold mb-4">Edit Auction</h2>

    <div class="mb-4">
      <label class="block text-sm font-semibold">Base Price</label>
      <input
        type="number"
        bind:value={updatedAuction.basePrice}
        class="border rounded p-2 w-full"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-semibold">Published</label>
      <input
        type="text"
        bind:value={updatedAuction.publishedDateTime}
        class="border rounded p-2 w-full"
        placeholder="dd-mm-yyyy hh:mm:ss"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-semibold">Ends</label>
      <input
        type="text"
        bind:value={updatedAuction.endDateTime}
        class="border rounded p-2 w-full"
        placeholder="dd-mm-yyyy hh:mm:ss"
      />
    </div>

    <div class="flex justify-end space-x-4">
      <Button label="Cancel" color="gray" onClick={() => dispatch("cancel")} />
      <Button
        label="Save changes"
        color="confirmation"
        onClick={() => dispatch("save", updatedAuction)}
      />
    </div>
  </div>
</div>
