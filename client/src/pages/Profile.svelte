<script>
    //TODO: edit bids to make hasWon a boolean
    import { onMount } from 'svelte';
    import { getUserId, getUsername, getEmail } from '../middleware';
    import BidCard from '../lib/BidCard.svelte'; // Import the BidCard component

    let userId;
    let username;
    let email;
    let bids = [];
    let alertMessage;
    let alertType;
    let isAlertVisible;

    onMount(async () => {
        try {
            userId = await getUserId();
            username = await getUsername();
            email = await getEmail();

            if (userId || userId === 0) {
                await fetchBids();
            } else {
                throw new Error("User ID is not available");
            }
        } catch (error) {
            console.error("Error during onMount:", error);
            alertMessage = "An error occurred while retrieving user information.";
            alertType = "error";
            isAlertVisible = true;
        }
    });

    async function fetchBids() {
        try {
            const response = await fetch(`http://localhost:3000/bids?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const latestBids = {};

            // Group bids by auctionId and keep only the highest bid
            data.bids.forEach(bid => {
                if (!latestBids[bid.auctionId] || bid.bidAmount > latestBids[bid.auctionId].bidAmount) {
                    latestBids[bid.auctionId] = bid;
                }
            });

            // Convert the object back to an array
            const uniqueBids = Object.values(latestBids);

            // Fetch card data for the latest bids
            const bidsWithCardData = await Promise.all(uniqueBids.map(async (bid) => {
                const card = await fetchCard(bid.auctionId);
                return {
                    ...bid,
                    cardName: card.name,
                    cardImageUrl: card.imageUrl,
                };
            }));

            bids = bidsWithCardData;
            console.log("Bids:", bids);
        } catch (error) {
            console.error("Error retrieving bids:", error);
            alertMessage = "An error occurred while retrieving bids.";
            alertType = "error";
            isAlertVisible = true;
        }
    }

    async function fetchCard(auctionId) {
        try {
            const response = await fetch(`http://localhost:3000/cards/${auctionId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.foundCard; // Adjust this based on your actual API response
        } catch (error) {
            console.error("Error retrieving card:", error);
            alertMessage = "An error occurred while retrieving card information.";
            alertType = "error";
            isAlertVisible = true;
            return { name: 'Unknown', imageUrl: '' }; // Fallback if card not found
        }
    }
</script>

<h1>Profile</h1>

{#if isAlertVisible}
    <div class={`alert ${alertType === 'error' ? 'bg-red-500 text-white' : ''} p-4 rounded mt-4`}>
        {alertMessage}
    </div>
{/if}

<div class="mt-4 p-4 bg-gray-100 rounded">
    <h2 class="text-lg font-semibold">Profile Information</h2>
    <p><strong>Username:</strong> {username}</p>
    <p><strong>Email:</strong> {email}</p>
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
    {#each bids as bid}
        <BidCard {bid} />
    {/each}
</div>
