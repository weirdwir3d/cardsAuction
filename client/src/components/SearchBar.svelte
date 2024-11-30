<script>
  import { escapeRegExp } from "../lib/helper";

  export let searchQuery = "";
  export let onSearchChange;

  function handleInput(event) {
    searchQuery = event.target.value;
    let sanitizedSearchQuery = escapeRegExp(searchQuery);
    if (onSearchChange) {
      onSearchChange(sanitizedSearchQuery);
    }
  }
</script>

<div class="px-4">
  <input
    type="text"
    placeholder="Search auctions by card name..."
    bind:value={searchQuery}
    on:input={handleInput}
    class="border-2 border-blue-500 rounded p-2 lg:mt-6 w-full outline-none focus:ring-4 focus:ring-blue-500"
  />
</div>
