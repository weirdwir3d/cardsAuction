<script>
  import { onMount } from "svelte";
  import { tokenStore } from "../lib/TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../lib/middleware";

  export let auctionId;
  export let endDateTime;

  let token;
  let isLoggedIn = false;
  let isAdmin = false;
  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let interval;
  let auctionEnded = false;

  tokenStore.subscribe((value) => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  })();

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const end = new Date(endDateTime).getTime();

    if (isNaN(end)) {
      clearInterval(interval);
      return;
    }

    const timeLeft = end - now;

    if (timeLeft > 0) {
      // couintdown https://stackoverflow.com/questions/51078140/calculation-of-countdown-timer
      days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      auctionEnded = false;
    } else {
      days = 0;
      hours = 0;
      minutes = 0;
      seconds = 0;
      auctionEnded = true;
      clearInterval(interval);
    }
  }

  onMount(() => {
    if (!endDateTime) {
      return;
    }
    calculateTimeLeft();
    interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="text-lg font-bold mt-4">
  {#if auctionEnded}
    <p><strong>Auction has ended</strong></p>
  {:else}
    <p><strong>Time Left:</strong> {days}d {hours}h {minutes}m {seconds}s</p>
  {/if}
</div>
