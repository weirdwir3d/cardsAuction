<script>
  export let username = "User";
  export let isAdmin = false;
</script>

<div class="flex-col text-center pb-6">
  <h2 class="text-2xl">
    Welcome, <span class="text-accent">{username}</span>!
  </h2>
  <ul class="mt-4">
    <li><a href="/auctions" class="text-accent underline">Auctions</a></li>
    <li><a href="/profile" class="text-accent underline">Profile</a></li>
    {#if isAdmin}
      <li><a href="/cards" class="text-accent underline">Cards</a></li>
    {/if}
  </ul>
</div>
