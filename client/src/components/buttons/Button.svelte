<script>
  export let label = "";
  export let color = "primary"; //default
  export let onClick;
  export let disabled = false;

  // map color prop to tailwind classes
  $: colorClass = {
    accent: "bg-red-700 text-white hover:bg-red-700/90",
    confirmation: "bg-confirmation text-white hover:bg-confirmation/90",
    warning: "bg-warning text-black hover:bg-warning/90",
    business: "bg-business text-white hover:bg-business/90",
    gray: "bg-gray-300 text-black hover:bg-gray-400"
  }[color] || "bg-primary text-white hover:bg-primary/90"; // default fallback
</script>

<button
  class={`px-6 py-3 rounded ${colorClass} disabled:bg-gray-300 disabled:cursor-not-allowed`}
  on:click={onClick}
  disabled={disabled}
>
  {label}
</button>
