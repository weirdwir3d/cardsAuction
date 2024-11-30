<script>
  export let card;
  import router from "page";

  function handleClick() {
    router.redirect(`/cards/${card.id}`);
  }
</script>

<div
  class="bg-secondary p-2 shadow-md rounded-lg max-w-xs mx-auto cursor-pointer"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keypress={(e) => e.key === "Enter" && handleClick()}
>
  <h2 class="text-lg font-bold mb-2 text-center text-white hover:text-accent">{card.name}</h2>
  <img
    src={card.imageUrl}
    alt={card.name}
    class="w-full h-auto object-contain rounded-lg"
  />

  {#if card.auctionId !== -1}
    <p class="text-center font-semibold mt-2">In auction</p>
  {/if}
</div>
