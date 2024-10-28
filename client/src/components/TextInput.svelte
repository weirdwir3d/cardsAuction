<!-- CustomInput.svelte -->
<script>
    export let placeholder = "Enter value"; // Default placeholder
    export let value; // Two-way binding for input value
</script>

<div class="flex flex-col">
    <input
        type="text"
        bind:value={value} 
        placeholder={placeholder}
        class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out md:w-1/2 w-full"
    />
</div>

<style>
    /* You can add any additional styles here if needed */
</style>
