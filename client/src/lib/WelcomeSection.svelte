<script>
    export let username = "User";  // Default username
    export let isAdmin = false;    // Flag for admin status
</script>

<div>
    <h2 class="text-2xl">Welcome, <span class="text-tertiary">{username}</span>!</h2>
    <ul class="mt-4">
        <li><a href="/auctions" class="text-tertiary underline">Auctions</a></li>
        <li><a href="/bids" class="text-tertiary underline">My Bids</a></li>
        {#if isAdmin}
            <li><a href="/cards" class="text-tertiary underline">Cards</a></li>
        {/if}
        <li><a href="/logout" class="text-tertiary underline">Log Out</a></li>
    </ul>
</div>
