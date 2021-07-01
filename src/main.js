import Vue from 'vue'

import App from './components/App.vue';
import VuejsDialog from 'vuejs-dialog';
import VuejsDialogMixin from 'vuejs-dialog/dist/vuejs-dialog-mixin.min.js'; // only needed in custom components

// include the default style
import 'vuejs-dialog/dist/vuejs-dialog.min.css';
Vue.use(VuejsDialog);

new Vue({
    render: h => h(App)
}).$mount('#app')
