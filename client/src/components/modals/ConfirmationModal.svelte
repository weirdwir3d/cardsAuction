<script>
  export let message;
  export let confirmAction;
  export let cancelAction;
</script>

<div class="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
  <div class="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
    <p class="mb-4">{message}</p>
    <div class="space-x-4">
      <button
        on:click={confirmAction}
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Confirm
      </button>
      <button
        on:click={cancelAction}
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
