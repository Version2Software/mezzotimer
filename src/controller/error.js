/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const {ipcRenderer} = require("electron");

ipcRenderer.on("doc", (event, doc) => {
    report.docs.push(doc);
});

const report = new Vue({
    el: "#error",
    data: {
        docs: []
    }
});
