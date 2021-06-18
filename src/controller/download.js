/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

downloadComponent = Vue.component("download-component", {
    template: `
        <div id="download">
            Mandatory update available. Please download and install.<br>
            Thank you!<br><br>
            <div class="center">                       
                <button class="button" @click="download">Go to download site</button>
            </div>
        </div>
        `,
    methods: {
        download() {
            shell.openExternal("https://mezzotimer.com")
                .then(_ => ipcRenderer.send("exit"));
        }
    }
});
