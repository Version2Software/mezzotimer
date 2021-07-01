'use strict'

const {contextBridge, ipcRenderer, shell} = require('electron');
const remote = require('@electron/remote')

contextBridge.exposeInMainWorld("api", {

    'promptDescription': async (taskDescription) => {
        return ipcRenderer.invoke('promptDescription', taskDescription);
    },
    'changeDescription': async (taskDescription) => {
        return ipcRenderer.invoke('changeDescription', taskDescription);
    },
    'delete': async (e) => {
        let w = await remote.getCurrentWindow();
        let result = await remote.dialog.showMessageBox(w, {
            type: "question",
            buttons: ["Delete", "Cancel"],
            title: "Confirm",
            message: "Delete " + e.description + "?"
        });
        // 0 means Yes
        if (result.response === 0) {
            return await ipcRenderer.invoke("delete", e.rowid);
        }
    },
    'confirmCancel': async () => {
        let w = await remote.getCurrentWindow();
        let result = await remote.dialog.showMessageBox(w, {
            type: "question",
            buttons: ["Yes", "No"],
            title: "Confirm Cancel",
            message: "Are you sure you want to cancel?"
        });
        // 0 means Yes
        return (result.response === 0)
    },
    'download': () => {
        shell.openExternal("https://mezzotimer.com")
            .then(_ => ipcRenderer.send("exit"))
    },
    'error': (doc) => {
        ipcRenderer.send("error", doc);
    },
    'save': (me) => {
        ipcRenderer.send("save", me)
    },
    'update': (me) => {
        ipcRenderer.send("update", me)
    },
    'viewLog': () => {
        ipcRenderer.send("viewLog");
    },
    'findAll': async (period) => {
        return await ipcRenderer.invoke("findAll", period)
    },
    'print': (period) => {
        ipcRenderer.send("print", period);
    },
    'info': () => {
        shell.openExternal("https://mezzotimer.com/help.html");
    },
    'about': () => {
        ipcRenderer.send("about");
    },
    'register': (channel, f) => {
        ipcRenderer.on(channel, (event, data) => {
            f(data)
        })
    },
    'getCachedPeriod': (channel) => {
        return ipcRenderer.invoke("getCachedPeriod")
    }
});
