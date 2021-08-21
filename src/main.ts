import mitt from "mitt";
import {createApp} from "vue";
import App from "./components/App.vue";

const app = createApp(App);
app.provide("emitter", mitt());
app.mount("#app");
