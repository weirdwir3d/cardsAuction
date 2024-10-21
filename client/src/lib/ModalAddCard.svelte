<script>
    import { checkLoggedIn, checkIsAdmin, getUserId } from "../middleware";
    import { tokenStore } from '../TokenStore';
    import { createEventDispatcher, tick } from "svelte";
    import Alert from "../lib/Alert.svelte";

    let isLoggedIn = false;
    let isAdmin = false;
    let token;

    let name = '';
    let description = '';
    let type = 'monster';
    let rarity = 'rare';
    let imageUrl = '';
    let auctionId = -1;

    let alertMessage = '';
    let alertType = '';
    let isAlertVisible = false;

    tokenStore.subscribe(value => {
        token = value.token;
        isLoggedIn = checkLoggedIn(token);
        isAdmin = isLoggedIn && checkIsAdmin(token);
    })();

    const dispatch = createEventDispatcher();

    async function addCard() {
        isAlertVisible = false; 

        try {
            const response = await fetch("http://localhost:3000/cards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    type,
                    rarity,
                    imageUrl,
                    auctionId
                })
            });

            const data = await response.json();

            if (response.ok) {
                alertMessage = "Card added successfully!";
                alertType = "success";
                isAlertVisible = true;
                await tick(); 
                dispatch('cardAdded', { name: name}); 
                setTimeout(() => {
                    dispatch('close');
                }, 1500);
            } else {
                alertMessage = data.error || "Failed to add card.";
                alertType = "error";
                isAlertVisible = true;
                await tick(); 
            }

        } catch (error) {
            alertMessage = "An error occurred while adding the card.";
            alertType = "error";
            isAlertVisible = true; 
            await tick(); 
            console.error("Error adding card:", error);
        }
    }

    function closeModal() {
        dispatch('close');
    }
</script>

<!-- Modal layout -->
<div class="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-4">Add New Card</h2>
        
        <Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />

        <div class="mb-4">
            <label class="block mb-1">Card Name</label>
            <input bind:value={name} class="w-full p-2 border rounded" type="text" placeholder="Enter card name" />
        </div>

        <div class="mb-4">
            <label class="block mb-1">Card Description</label>
            <textarea bind:value={description} class="w-full p-2 border rounded" placeholder="Enter description"></textarea>
        </div>

        <div class="mb-4">
            <label class="block mb-1">Card Type</label>
            <select bind:value={type} class="w-full p-2 border rounded">
                <option value="monster">Monster</option>
                <option value="trap">Trap</option>
                <option value="spell">Spell</option>
            </select>
        </div>

        <div class="mb-4">
            <label class="block mb-1">Card Rarity</label>
            <select bind:value={rarity} class="w-full p-2 border rounded">
                <option value="rare">Rare</option>
                <option value="super rare">Super Rare</option>
                <option value="ultra rare">Ultra Rare</option>
                <option value="unique">Unique</option>
            </select>
        </div>

        <div class="mb-4">
            <label class="block mb-1">Image URL</label>
            <input bind:value={imageUrl} class="w-full p-2 border rounded" type="text" placeholder="Enter image URL" />
        </div>

        <div class="flex justify-end space-x-4">
            <button on:click={closeModal} class="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
            <button on:click={addCard} class="px-4 py-2 bg-blue-500 text-white rounded">Add Card</button>
        </div>
    </div>
</div>

<style>
    @media (max-width: 768px) {
        .modal-content {
            width: 90%;
        }
    }
</style>
