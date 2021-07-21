'use strict'

import {createApp} from 'vue';
import mitt from 'mitt'
import App from './components/App.vue';

const app = createApp(App)
app.provide('emitter', mitt());
app.mount('#app');
