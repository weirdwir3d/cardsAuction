<script>
    export let message = "";
    export let type = "success"; // can be "success", "error", "warning", etc.
    export let isVisible = false; // controls alert visibility

    const alertColors = {
        success: "bg-green-100 text-green-700 border-green-500",
        error: "bg-red-100 text-red-700 border-red-500",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-500",
    };

    function closeAlert() {
        isVisible = false;
    }
</script>

{#if isVisible}
    <div class="fixed top-4 right-4 max-w-sm w-full border-l-4 p-4 rounded-lg shadow-lg {alertColors[type]}">
        <div class="flex justify-between items-center">
            <span>{message}</span>
            <button class="ml-4" on:click={closeAlert}>&times;</button>
        </div>
    </div>
{/if}

<style>
    /* Add responsiveness */
    @media (max-width: 640px) {
        div {
            top: 2rem;
            right: 1rem;
            max-width: 90%;
        }
    }
</style>
