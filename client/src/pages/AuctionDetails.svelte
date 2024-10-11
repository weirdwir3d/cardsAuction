<script>
  import { onMount } from 'svelte';
  import router from 'page';
  import { tokenStore } from '../TokenStore';
  import Alert from '../lib/Alert.svelte';
  import { checkLoggedIn, checkIsAdmin, getUserId } from "../middleware";
  import { formatDate, getCookie } from "../utils";
  import Countdown from '../lib/Countdown.svelte';
  import NewBidModal from '../lib/NewBidModal.svelte';

  let auctionId;
  let auction = null;
  let card = null;
  let bids = [];
  let users = [];
  let userId;
  let isEditing = false;
  let updatedAuction = {};
  let token;
  let authToken;
  let isLoggedIn = false;
  let isAdmin = false;
  let showAlert = false;
  let alertMessage = '';
  let alertType = 'success'
  let showBidModal = false;

  tokenStore.subscribe(value => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
    userId = getUserId();
    // console.log('AUCTIONDETAILS PG Token stored in tokenStore:', token);
    // console.log('is the user logged in?:', isLoggedIn)
    console.log('authToken:', authToken)
  })();

  async function fetchAuctionDetails() {
    try {
      const response = await fetch(`http://localhost:3000/auctions/${auctionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      auction = await response.json(); 
      const parts = auction.endDateTime.split(' ');
      const [day, month, year] = parts[0].split('-');
      // auction.endDateTime = `${year}-${month}-${day}T${parts[1]}`;
      updatedAuction = { ...auction };
    } catch (error) {
      console.error("Error retrieving auction details:", error);
    }
  }

  async function fetchCardDetails() {
    try {
      const response = await fetch(`http://localhost:3000/cards/${auction.cardId}`, {
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
    } catch (error) {
      console.error("Error retrieving card details:", error);
    }
  }

  async function fetchBids() {
    try {
      const response = await fetch(`http://localhost:3000/bids?auctionId=${auctionId}`);
      if (response.ok) {
        const data = await response.json();
        bids = data.bids;
      } else if (response.status === 404) {
        bids = [];
      } else {
        console.error('Failed to retrieve bids:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  }

  async function fetchUsers() {
    try {
      const response = await fetch(`http://localhost:3000/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })

      let data = await response.json();
      users = data.usersData;
      if (!response.ok) {
        console.error('Error fetching users:', error)
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  onMount(() => {
    auctionId = window.location.pathname.split('/').pop();
    authToken = getCookie('authToken');
    fetchAuctionDetails().then(() => {
      fetchCardDetails(); 
      fetchUsers();
      fetchBids();
    });
  });

  function toggleEdit() {
    isEditing = !isEditing;
  }

  async function saveChanges() {
    try {
      const response = await fetch(`http://localhost:3000/auctions/${auctionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(updatedAuction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      auction = await response.json().auction;
      isEditing = false;
      alertMessage = "Auction edited successfully!";
      showAlert = true;

      await fetchAuctionDetails(); 

      setTimeout(() => {
        showAlert = false;
      }, 4000);
    } catch (error) {
      console.error("Error updating auction details:", error);
    }
  }

  function viewCardDetails() {
    router.redirect(`/cards/${card.id}`);
  }

    function openBidModal() {
    showBidModal = true;
  }

  function closeBidModal() {
    showBidModal = false;
  }

async function handleConfirmBid(bidAmount) {
  let authToken = getCookie('authToken');
  const currentDateTime = formatDate(new Date());

  let newBid = {
    userId: userId,
    auctionId: parseInt(auctionId),
    bidAmount: parseFloat(bidAmount),
    publishedDateTime: currentDateTime,
  };

  console.log('New bid being submitted:', newBid);

  try {
    const response = await fetch(`http://localhost:3000/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(newBid),
    });

    console.log('Response from bid submission:', response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'HTTP error! Status: ' + response.status);
    }

    const bidData = await response.json();
    console.log('Bid data received:', bidData);

    // Refresh bids after successful bid
    await fetchBids();
    console.log("Fetched bids after placing a bid:", bids);
    
    alertMessage = "Bid placed successfully!";
    alertType = "success"; // Green alert for success
    showAlert = true;
    closeBidModal();

    setTimeout(() => {
      showAlert = false;
    }, 4000);

  } catch (error) {
    console.error("Error trying to place a bid:", error);
    alertMessage = error.message || "Error placing bid. Please try again.";
    alertType = "error"; // Red alert for error
    showAlert = true;
    closeBidModal();
  }
}  
</script>

<Alert message={alertMessage} type={alertType} isVisible={showAlert} />
<NewBidModal isVisible={showBidModal} onClose={closeBidModal} onConfirm={handleConfirmBid} />

{#if auction && card}
  <div class="p-4 max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold mb-4 text-center md:text-left">{card.name}</h1>

    <!-- Auction details section -->
    <div class="text-lg space-y-4">
      {#if isAdmin && isEditing}
        <div>
          <label><strong>Base Price: </strong></label>
          <input 
            type="number" 
            bind:value={updatedAuction.basePrice} 
            class="border rounded p-1 w-full"
          />
        </div>
        <div>
          <label><strong>Published Date/Time: </strong></label>
          <input 
            type="text" 
            bind:value={updatedAuction.publishedDateTime} 
            class="border rounded p-1 w-full"
            placeholder="dd-mm-yyyy hh:mm:ss"
          />
        </div>
        <div>
          <label><strong>End Date/Time: </strong></label>
          <input 
            type="text" 
            bind:value={updatedAuction.endDateTime} 
            class="border rounded p-1 w-full"
            placeholder="dd-mm-yyyy hh:mm:ss"
          />
        </div>
      {:else}
        <p><strong>Base Price: </strong>{auction.basePrice}</p>
        <p><strong>Published Date/Time: </strong>{auction.publishedDateTime}</p>
        <p><strong>End Date/Time: </strong>{auction.endDateTime}</p>
      {/if}
      
      {#if auction.endDateTime}
        <Countdown endDateTime={auction.endDateTime} />
      {/if}
    </div>

    <!-- Current bid card with bid history -->
    <div class="mt-8">
      <!-- Current bid section -->
<div class="p-6 border rounded-lg bg-gray-100">
  {#if bids && bids.length > 0}
    <div class="flex items-center">
      <div class="flex-grow">
        <p class="text-lg"><strong>Current Bid: </strong>${bids[bids.length - 1].bidAmount}</p>
        <p class="text-lg hidden md:block"><strong>Published Date/Time: </strong>{bids[0].publishedDateTime}</p>
      </div>
<button 
  on:click={openBidModal} 
  class={`px-4 py-2 rounded hover:bg-green-600 hidden md:block ml-4 ${isLoggedIn ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} 
  disabled={!isLoggedIn}
>
  {isLoggedIn ? 'Place Bid' : 'Log in to place a bid'}
</button>

    </div>
  {:else}
    <p class="text-lg">No bids have been placed for this auction yet.</p>
  {/if}
        <!-- Bid History Table -->
<!-- Bid History Table -->
{#if bids && bids.length > 1}
  <div class="mt-6">
    <h3 class="text-lg font-bold mb-2">Bid History</h3>
    <table class="table-auto w-full text-left border-collapse">
      <thead>
        <tr class="bg-gray-200">
          <th class="border px-4 py-2">Bid Amount</th>
          <th class="border px-4 py-2">Published Date/Time</th>
          <th class="border px-4 py-2">Username</th> <!-- New Username Column -->
        </tr>
      </thead>
      <tbody>
        {#each bids.slice(1) as bid, index}
          <tr class={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td class="border px-4 py-2">${bid.bidAmount}</td>
            <td class="border px-4 py-2">{bid.publishedDateTime}</td>
            <td class="border px-4 py-2">{users.find(user => user.id === bid.userId)?.username || 'Unknown'}</td> <!-- Display username -->
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

      </div>
    </div>

    <!-- Display card details -->
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 mt-6">
      <img 
        src={card.imageUrl} 
        alt={card.name} 
        class="w-full max-w-xs md:max-w-md lg:max-w-lg h-auto object-contain rounded-lg mx-auto"
      />
      
      <div class="text-lg space-y-4">
        <p><strong>Description: </strong>{card.description}</p>
        <p><strong>Type:</strong> {card.type}</p>
        <p><strong>Rarity:</strong> {card.rarity}</p>
        
        {#if card.auctionId !== -1}
          <p><strong>Auction ID:</strong> {card.auctionId}</p>
        {/if}
      </div>
    </div>

    <!-- Auction editing controls -->
    {#if isAdmin}
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
            Edit Auction
          </button>
        {/if}
        
        <!-- View Card Button, only for admins -->
        <button 
          on:click={viewCardDetails} 
          class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          View Card
        </button>
      </div>
    {/if}

    <button 
      on:click={() => router.redirect('/auctions')} 
      class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mt-6"
    >
      Back to Auctions
    </button>

    <!-- Fixed Bottom Bar for mobile -->
    {#if bids && bids.length > 0}
      <div class="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 md:hidden flex justify-between items-center">
        <p class="text-lg"><strong>Current Bid: </strong>${bids[bids.length - 1].bidAmount}</p>
<button 
  on:click={openBidModal} 
  class={`px-4 py-2 rounded hover:bg-green-600 md:block ml-4 ${isLoggedIn ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} 
  disabled={!isLoggedIn}
>
  {isLoggedIn ? 'Place Bid' : 'Log in to place a bid'}
</button>

      </div>
    {/if}
  </div>
{:else}
  <p>Loading auction and card details...</p>
{/if}
