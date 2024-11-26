<script>
  import { checkLoggedIn, checkIsAdmin } from "../../lib/middleware";
  import { tokenStore } from "../../lib/TokenStore";
  import { createEventDispatcher } from "svelte";
  import { addCardAPI } from "../../lib/api";
  import Alert from "../Alert.svelte";

  let isLoggedIn = false;
  let isAdmin = false;
  let token;

  export let isVisible = false;
  const dispatch = createEventDispatcher();
  let name = "";
  let description = "";
  let type = "monster";
  let rarity = "rare";
  let imageUrl = "";
  let auctionId = -1;
  //alert
  let alertMessage = "";
  let alertType = "";
  let isAlertVisible = false;

  tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  })();

  function close() {
    //reset fields
    isVisible = false;
    name = "";
    description = "";
    type = "monster";
    rarity = "rare";
    imageUrl = "";
    showAddCardModal = false;
  }

  async function addCard() {
    isAlertVisible = false;

    try {
      const data = await addCardAPI({
        name,
        description,
        type,
        rarity,
        imageUrl,
        auctionId,
        token,
      });

    //   console.log('new card data:', data);

      alertMessage = "Card added successfully!";
      alertType = "success";
      isAlertVisible = true;

      dispatch("cardAdded");
      setTimeout(() => {
        close();
        dispatch("close");
      }, 1500);
    } catch (error) {
      alertMessage = error.message;
      alertType = "error";
      isAlertVisible = true;
      console.error("error adding card:", error);
    }
  }
</script>

<div
  class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
>
  <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg sm:w-11/12 md:w-3/4 lg:w-1/2">
    <h2 class="text-2xl font-bold mb-4">Add New Card</h2>

    <!-- Alert -->
    <Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />

    <div class="mb-4">
      <label class="block mb-1">Card Name</label>
      <input
        bind:value={name}
        class="w-full p-2 border rounded"
        type="text"
        placeholder="Enter card name"
      />
    </div>

    <div class="mb-4">
      <label class="block mb-1">Card Description</label>
      <textarea
        bind:value={description}
        class="w-full p-2 border rounded"
        placeholder="Enter description"
      ></textarea>
    </div>

    <div class="mb-4">
      <label class="block mb-1">Card Type</label>
      <select bind:value={type} class="w-full p-2 border rounded">
        <option value="monster">Monster</option>
        <option value="trap">Trap</option>
        <option value="spell">Spell</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block mb-1">Card Rarity</label>
      <select bind:value={rarity} class="w-full p-2 border rounded">
        <option value="rare">Rare</option>
        <option value="super rare">Super Rare</option>
        <option value="ultra rare">Ultra Rare</option>
        <option value="unique">Unique</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block mb-1">Image URL</label>
      <input
        bind:value={imageUrl}
        class="w-full p-2 border rounded"
        type="text"
        placeholder="Enter image URL"
      />
    </div>

    <div
      class="mt-6 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2"
    >
    <!-- Add card btn -->
      <button
        on:click={addCard}
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full sm:w-auto"
        >Add Card</button
      >
      <button
        on:click={() => (dispatch("close"))}
        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 w-full sm:w-auto"
        >Cancel</button
      >
    </div>
  </div>
</div>