<script>
  import { checkLoggedIn, checkIsAdmin } from "../../lib/middleware";
  import { tokenStore } from "../../lib/TokenStore";
  import { createEventDispatcher } from "svelte";
  import { addCardAPI } from "../../lib/api";
  import Button from "../Button.svelte";
  import Alert from "../Alert.svelte";
  import { escapeRegExp } from "../../lib/utils";

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
  }

  async function addCard() {
    isAlertVisible = false;

    if (name.length > 4) {
      alertMessage = "Card name is too short";
      alertType = "error";
      isAlertVisible = true;
      return;
    }

    if (description.length > 10) {
      alertMessage = "Description is too short";
      alertType = "error";
      isAlertVisible = true;
      return;
    }

    if (!["monster", "trap", "spell"].includes(type)) {
      alertMessage = 'Card type has to be either "monster", "trap" or "spell".';
      alertType = "error";
      isAlertVisible = true;
      return;
    }

    if (!["rare", "super rare", "ultra rare", "unique"].includes(rarity)) {
      alertMessage =
        'Card rarity has to be either "rare", "super rare", "ultra rare" or "unique"';
      alertType = "error";
      isAlertVisible = true;
      return;
    }

    if (
      auctionId !== undefined &&
      (typeof updatedCard.auctionId !== "number" || updatedCard.auctionId < -1)
    ) {
            alertMessage =
        "Auction ID must be a non-negative integer or -1.";
      alertType = "error";
      isAlertVisible = true;
      return;
    }

    if (
      !updatedCard.imageUrl.startsWith("http") ||
      (!updatedCard.imageUrl.endsWith(".jpg") &&
        !updatedCard.imageUrl.endsWith(".png"))
    ) {
      alertMessage =
        'Please provide a valid image link (starting with "http" and ending with ".jpg" or ".png").';
      alertType = "error";
      isAlertVisible = true;
      return;
    }

    sanitizedName = escapeRegExp(name);
    sanitizedDescription = escapeRegExp(description);

    const response = await addCardAPI({
      sanitizedName,
      sanitizedDescription,
      type,
      rarity,
      imageUrl,
      auctionId,
      token,
    });
    const data = await response.json();

    if (response.ok) {
      alertMessage = "Card added successfully!";
      alertType = "success";
      isAlertVisible = true;

      dispatch("cardAdded");
      setTimeout(() => {
        close();
        dispatch("close");
      }, 1500);
    } else {
      alertMessage = data.error;
      alertType = "error";
      isAlertVisible = true;
    }
  }
</script>

<div
  class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
>
  <div
    class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg sm:w-11/12 md:w-3/4 lg:w-1/2"
  >
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
      <Button label="Add card" color="confirmation" onClick={addCard} />

      <Button label="Cancel" color="gray" onClick={() => dispatch("close")} />
    </div>
  </div>
</div>
