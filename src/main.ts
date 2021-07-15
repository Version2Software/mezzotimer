'use strict'

import {createApp} from 'vue';
import mitt, {Emitter} from 'mitt'
import App from './components/App.vue';

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        emitter: Emitter<any>
    }
}
const app = createApp(App)
app.config.globalProperties.emitter = mitt();
app.mount('#app');
