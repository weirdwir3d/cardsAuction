<script>
  import Button from "../buttons/Button.svelte";
  export let message;
  export let confirmAction;
  export let cancelAction;
</script>

<div class="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
  <div class="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
    <p class="mb-4">{message}</p>
    <div class="space-x-4">
      <Button label="Confirm" color="accent" onClick={confirmAction} />
      <Button label="Cancel" color="gray" onClick={cancelAction} />
    </div>
  </div>
</div>
