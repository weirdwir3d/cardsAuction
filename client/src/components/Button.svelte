<!-- Button.svelte -->
<script>
    export let onClick = () => {}; // Function to execute on click
    export let type = "button"; // Type of the button
    export let label = "Click Me"; // Default label
</script>

<button
    type={type}
    on:click={onClick}
    class="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-150 ease-in-out"
>
    {label}
</button>

<style>
    /* Additional styles can be added here if needed */
</style>
