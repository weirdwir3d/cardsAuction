<script>
  export let message = "";
  export let type = "error";
  export let isVisible = false;

  const alertColors = {
    success: "bg-green-100 text-green-700 border-green-500",
    error: "bg-red-100 text-red-700 border-red-500",
  };

  //run whenever isVisible changes
  $: if (isVisible) {
    const timeout = setTimeout(() => {
      isVisible = false;
      //clear timeout if alert is closed manually
      return () => clearTimeout(timeout);
    }, 4000);
  }
</script>

{#if isVisible}
  <div
    class="fixed top-3/5 md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm w-full border-l-4 p-4 rounded-lg shadow-lg {alertColors[
      type
    ]} z-20"
  >
    <div class="flex justify-between items-center">
      <span>{message}</span>
      <button class="ml-4" on:click={() => (isVisible = false)}>&times;</button>
    </div>
  </div>
{/if}