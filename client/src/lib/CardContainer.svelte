<script>
  export let card;
  import router from 'page';

  function handleClick() {
    router.redirect(`/cards/${card.id}`); // Navigate without causing a page refresh
  }
</script>

<div class="bg-tertiary p-2 shadow-md rounded-lg max-w-xs mx-auto cursor-pointer" 
     on:click={handleClick} 
     role="button" 
     tabindex="0" 
     on:keypress={(e) => e.key === 'Enter' && handleClick()}>
  <h2 class="text-lg font-bold mb-2 text-center">{card.name}</h2>
  <img src={card.imageUrl} alt={card.name} class="w-full h-auto object-contain rounded-lg" />
</div>
