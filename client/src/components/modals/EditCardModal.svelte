<script>
  import Button from "../buttons/Button.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let card;
  export let updatedCard;
</script>

<div
  class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
>
  <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
    <h2 class="text-xl font-bold mb-4">Edit Card</h2>

    <div class="mb-4">
      <label class="block text-sm font-semibold">Description</label>
      <textarea
        bind:value={updatedCard.description}
        class="border rounded p-2 w-full"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-semibold">Type</label>
      <select bind:value={updatedCard.type} class="border rounded p-2 w-full">
        <option value="monster">Monster</option>
        <option value="trap">Trap</option>
        <option value="spell">Spell</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-semibold">Rarity</label>
      <select bind:value={updatedCard.rarity} class="border rounded p-2 w-full">
        <option value="rare">Rare</option>
        <option value="super rare">Super Rare</option>
        <option value="ultra rare">Ultra Rare</option>
        <option value="unique">Unique</option>
      </select>
    </div>

    <div class="flex justify-end space-x-4">
      <Button label="Cancel" color="gray" onClick={() => dispatch("cancel")} />
      <Button
        label="Save changes"
        color="confirmation"
        onClick={() => dispatch("save", updatedCard)}
      />
    </div>
  </div>
</div>
