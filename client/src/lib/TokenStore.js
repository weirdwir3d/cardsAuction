import { setCookie } from './helper'
import { writable } from 'svelte/store';

export let tokenStore = writable({
    token: null
});
tokenStore.subscribe(value => setCookie('authToken', value.token || '', 1));