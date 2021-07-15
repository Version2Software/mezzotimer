'use strict'

import {createApp} from 'vue';
import App from './components/App.vue';
import mitt from 'mitt'

const app = createApp(App)
app.config.globalProperties.emitter = mitt();
app.mount('#app');
