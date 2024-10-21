<!-- PasswordInput.svelte -->
<script>
    export let placeholder = "Enter password"; // Default placeholder
    export let value = ""; // Two-way binding for input value
    export let onInput = () => {}; // Callback function for input event
</script>

<div class="flex flex-col">
    <input
        type="password"
        bind:value
        on:input={onInput}
        placeholder={placeholder}
        class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out md:w-1/2 w-full"
    />
</div>

<style>
    /* You can add any additional styles here if needed */
</style>
