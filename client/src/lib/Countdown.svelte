<script>
  import { onMount } from 'svelte';
  export let endDateTime;
  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let interval;

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
    } else {
      days = 0;
      hours = 0;
      minutes = 0;
      seconds = 0;
      clearInterval(interval); // Stop the countdown when time is up
    }
  }

  onMount(() => {
    console.log('generating dountdown component...')
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
  <p><strong>Time Left:</strong> {days}d {hours}h {minutes}m {seconds}s</p>
</div>

<style>
  .countdown {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1rem;
  }
</style>
