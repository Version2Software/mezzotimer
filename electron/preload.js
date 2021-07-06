'use strict'

const {contextBridge, ipcRenderer, shell} = require('electron');

contextBridge.exposeInMainWorld("api", {

    'promptDescription': async (taskDescription) => {
        return ipcRenderer.invoke('promptDescription', taskDescription);
    },
    'changeDescription': async (taskDescription) => {
        return ipcRenderer.invoke('changeDescription', taskDescription);
    },
    'deleteTask': async (rowId, description) => {
        return await ipcRenderer.invoke('deleteTask', rowId, description);
    },
    'confirmCancel': async () => {
        return await ipcRenderer.invoke('confirmCancel');
    },
    'download': () => {
        shell.openExternal("https://mezzotimer.com")
    },
    'printPage': () => {
        ipcRenderer.send("printPage");
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
