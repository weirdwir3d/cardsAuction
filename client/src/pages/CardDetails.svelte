<script>
  import { onMount } from 'svelte';
  import router from 'page';
  import { tokenStore } from '../TokenStore'; // Import the tokenStore
  import Alert from '../lib/Alert.svelte'; // Import Alert component

  let cardId;
  let card;
  let isEditing = false; // State to track if in edit mode
  let updatedCard = {}; // Object to hold updated card data
  let token;
  let showAlert = false; // Control alert visibility
  let alertMessage = ''; // Message to display in the alert

  tokenStore.subscribe(value => {
    token = value.token;
    console.log('CARDDETAILS PG Token stored in tokenStore:', token); // Log the token from TokenStore
  })();

  async function fetchCardDetails() {
    try {
      const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      card = data.foundCard;
      updatedCard = { ...card }; // Initialize updatedCard with the fetched data
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

  onMount(() => {
    cardId = window.location.pathname.split('/').pop(); // Get card ID from URL
    fetchCardDetails();
  });

  function handleAuction() {
    // Placeholder function for putting the card up for auction
    console.log(`Put card with ID ${cardId} up for auction`);
  }

  function toggleEdit() {
    isEditing = !isEditing;
  }

  async function saveChanges() {
  try {
    const response = await fetch(`http://localhost:3000/cards/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedCard),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Updated card data:', data); // Log the updated card data

    card = data.card; // Ensure this contains the updated card
    isEditing = false; // Exit edit mode
    
    alertMessage = "Card edited successfully!";
    showAlert = true;

    setTimeout(() => {
      showAlert = false;
    }, 4000); // 4 seconds

  } catch (error) {
    console.error("Error updating card details:", error);
  }
}

</script>

<Alert message={alertMessage} type="success" isVisible={showAlert} />

{#if card}
  <div class="p-4 max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold mb-4 text-center md:text-left">{card.name}</h1>

    <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
      <img 
        src={card.imageUrl} 
        alt={card.name} 
        class="w-full max-w-xs md:max-w-md lg:max-w-lg h-auto object-contain rounded-lg mx-auto"
      />
      
      <div class="text-lg space-y-4">
        {#if isEditing}
          <div>
            <label><strong>Description: </strong></label>
            <textarea 
              type="text" 
              bind:value={updatedCard.description} 
              class="border rounded p-1 w-full"
            />
          </div>
          <div>
            <label><strong>Type:</strong></label>
            <input 
              type="text" 
              bind:value={updatedCard.type} 
              class="border rounded p-1 w-full"
            />
          </div>
          <div>
            <label><strong>Rarity:</strong></label>
            <input 
              type="text" 
              bind:value={updatedCard.rarity} 
              class="border rounded p-1 w-full"
            />
          </div>
        {:else}
          <p><strong>Description: </strong>{card.description}</p>
          <p><strong>Type:</strong> {card.type}</p>
          <p><strong>Rarity:</strong> {card.rarity}</p>
        {/if}

        {#if card.auctionId !== -1}
          <p><strong>Auction ID:</strong> {card.auctionId}</p>
        {:else}
          <button 
            on:click={handleAuction} 
            class="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Put Up for Auction
          </button>
        {/if}
      </div>
    </div>

    <div class="text-center md:text-left mt-6 space-x-4">
      {#if isEditing}
        <button 
          on:click={saveChanges} 
          class="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Save Changes
        </button>
        <button 
          on:click={toggleEdit} 
          class="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      {:else}
        <button 
          on:click={toggleEdit} 
          class="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Edit
        </button>
      {/if}
      <button 
        on:click={() => router.redirect('/cards')} 
        class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Back to Cards
      </button>
    </div>
  </div>
{/if}
