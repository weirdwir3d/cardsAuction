<script>
  export let card;
  export let auction;
  import router from "page";

  function handleClick() {
    router.redirect(`/auctions/${auction.id}`); // Navigate without causing a page refresh
  }
</script>

<div
  class="bg-primary p-2 shadow-md rounded-lg max-w-xs mx-auto cursor-pointer"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keypress={(e) => e.key === "Enter" && handleClick()}
>
  {#if card}
    <h2 class="text-lg font-bold mb-2 text-center text-white hover:text-accent">{card.name}</h2>
    <img
      src={card.imageUrl}
      alt={card.name}
      class="w-full h-auto object-contain rounded-lg"
    />
  {:else}
    <p>No card available</p>
  {/if}
</div>
