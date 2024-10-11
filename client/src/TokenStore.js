// src/TokenStore.js
import { setCookie } from './utils'
import { writable } from 'svelte/store';

// Create the tokenStore writable store
export let tokenStore = writable({
    token: ''
});
tokenStore.subscribe(value => setCookie('authToken', value.token, 1));