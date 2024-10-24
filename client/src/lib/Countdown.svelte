<script>
  import { onMount } from 'svelte';
  import { tokenStore } from '../TokenStore';
  import { checkLoggedIn, checkIsAdmin } from "../middleware";
  import { fetchBidsAPI, updateBidAPI } from '../api.js';

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

  tokenStore.subscribe(value => {
    token = value.token;
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
    console.log('token dio cane:', token)
  })();

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const end = new Date(endDateTime).getTime();

    if (isNaN(end)) {
      console.error("Invalid date format for endDateTime:", endDateTime);
      clearInterval(interval);
      return;
    }

    const timeLeft = end - now;

    if (timeLeft > 0) {
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
      setWinningBid();
      clearInterval(interval);
    }
  }

  async function setWinningBid() {
    try {
      const bids = await fetchBidsAPI(auctionId);
      if (bids.length === 0) return;

      const highestBid = bids.reduce((prev, current) => (prev.bidAmount > current.bidAmount) ? prev : current);

      const updateData = await updateBidAPI(highestBid.id, { hasWon: true });
      console.log("Winning bid updated successfully:", updateData.bid);
    } catch (error) {
      console.error("Error in setWinningBid:", error);
    }
  }

  onMount(() => {
    if (!endDateTime) {
      console.error("No endDateTime provided to Countdown component");
      return;
    }
    calculateTimeLeft();
    interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="countdown">
  {#if auctionEnded}
    <p><strong>Auction has ended</strong></p>
  {:else}
    <p><strong>Time Left:</strong> {days}d {hours}h {minutes}m {seconds}s</p>
  {/if}
</div>

<style>
  .countdown {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1rem;
  }
</style>
