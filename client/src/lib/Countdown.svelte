<script>
  import { onMount } from 'svelte';
  export let auctionId;
  export let endDateTime;
    import { tokenStore } from '../TokenStore';
  import { checkLoggedIn, checkIsAdmin, getUserId } from "../middleware";
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
    // console.log('AUCTIONDETAILS PG Token stored in tokenStore:', token);
    // console.log('is the user logged in?:', isLoggedIn)
    console.log('token:', token)
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
      const response = await fetch(`http://localhost:3000/bids?auctionId=${auctionId}`);
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching bids:", data.error);
        return;
      }

      const bids = data.bids;
      if (bids.length === 0) return;

      // Get the highest bid
      const highestBid = bids.reduce((prev, current) => (prev.bidAmount > current.bidAmount) ? prev : current);

      // Update hasWon status
      const updateResponse = await fetch(`http://localhost:3000/bids/${highestBid.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ hasWon: "true" })
      });

      const updateData = await updateResponse.json();
      if (updateData.error) {
        console.error("Error updating winning bid:", updateData.error);
      } else {
        console.log("Winning bid updated successfully:", updateData.bid);
      }
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
