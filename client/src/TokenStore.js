// src/TokenStore.js
import { writable } from 'svelte/store';

// Create the tokenStore writable store
export let tokenStore = writable({
    token: ''
}); 
