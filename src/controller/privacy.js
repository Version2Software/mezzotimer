const {ipcRenderer} = require('electron');

new Vue({
    el: '#app',
    data: {
        checked: false,
        activeClass: "button",
        disabledClass: "disabled-button"
    },
    methods: {
        accepted: function () {
            ipcRenderer.send("accepted");
        },
        declined: function () {
            ipcRenderer.send("exit");
        }
    }
});
