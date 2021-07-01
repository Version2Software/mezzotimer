'use strict'

const { contextBridge, ipcRenderer, shell } = require('electron');

// In this file we want to expose protected methods that allow the renderer
// process to use the ipcRenderer without exposing the entire object.
contextBridge.exposeInMainWorld("api", {
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
