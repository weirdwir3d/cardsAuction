<script>
  export let card;
</script>

<div class="flex flex-col md:flex-row items-center gap-6 mt-6">
  <img
    src={card.imageUrl}
    alt={card.name}
    class="w-full max-w-[250px] max-h-[350px] md:max-w-[300px] md:max-h-[400px] object-contain rounded-lg mx-auto"
  />
  <div class="text-base md:text-lg space-y-4">
    <p><strong>Description: </strong>{card.description}</p>
    <p><strong>Type:</strong> {card.type}</p>
    <p><strong>Rarity:</strong> {card.rarity}</p>
  </div>
</div>
