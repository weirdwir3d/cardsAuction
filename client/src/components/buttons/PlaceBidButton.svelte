<script>
  export let isLoggedIn = false;
  export let onClick;
</script>

<button
  on:click={() => isLoggedIn && onClick()}
  class={`px-4 py-2 rounded mt-4 ${
    isLoggedIn
      ? "bg-green-500 text-white hover:bg-green-600"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
  disabled={!isLoggedIn}
>
  {isLoggedIn ? "Place Bid" : "Log in to place a bid"}
</button>