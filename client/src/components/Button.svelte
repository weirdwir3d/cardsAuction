<script>
  export let label = "";
  export let color = "primary"; // default style
  export let onClick;
  export let disabled = false;

  // Map the color prop to a CSS class
  $: colorClass = {
    primary: "primary",
    secondary: "secondary",
    success: "success",
    danger: "danger",
    warning: "warning",
    info: "info",
    light: "light",
    dark: "dark"
  }[color] || "primary"; // default to "primary" if color is undefined
</script>

<button
  class={`px-6 py-3 rounded text-white ${colorClass}`}
  on:click={onClick}
  disabled={disabled}
>
  {label}
</button>

<style>
  .primary { background-color: #007bff; }
  .secondary { background-color: #6c757d; }
  .success { background-color: #28a745; }
  .danger { background-color: #dc3545; }
  .warning { background-color: #ffc107; }
  .info { background-color: #17a2b8; }
  .light { background-color: #f8f9fa; color: #212529; }
  .dark { background-color: #343a40; }
  button:disabled { background-color: #e0e0e0; cursor: not-allowed; }
</style>
