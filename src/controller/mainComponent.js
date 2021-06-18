const {shell, ipcRenderer} = require('electron');

globalState = "IDLE";

const bus = new Vue({
    el: "#main-component",
    data() {
        return {
            currentView: timerFrontComponent
        };
    },

    mounted: function () {
        this.$on("currentView", (view) => this.currentView = view);
    },
    components: {
        downloadComponent,
        timerFrontComponent,
        timerMenuComponent,
        optionsComponent
    }
});
