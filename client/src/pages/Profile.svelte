<script>
    import { onMount } from 'svelte';
    import { getUserId, getUsername, getEmail } from '../middleware';
    import BidCard from '../lib/BidCard.svelte';
    import { fetchBidsAPI, fetchCardAPI } from '../api'; // Import the new API functions

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
                await loadBids(); // Updated function name for clarity
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

async function loadBids() {
    try {
        const data = await fetchBidsAPI({ userId });
        console.log("API Response:", data); // Log the entire response

        if (!data) {
            throw new Error("No bids found in response");
        }

        const latestBids = {};

        data.forEach(bid => {
            if (!latestBids[bid.auctionId] || bid.bidAmount > latestBids[bid.auctionId].bidAmount) {
                latestBids[bid.auctionId] = bid;
            }
        });

        const uniqueBids = Object.values(latestBids);

        const bidsWithCardData = await Promise.all(uniqueBids.map(async (bid) => {
            const card = await fetchCardAPI(bid.auctionId);
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
