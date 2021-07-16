'use strict'

const {contextBridge, ipcRenderer, shell} = require('electron');

contextBridge.exposeInMainWorld("api", {

    'promptDescription': async (taskDescription:string) => {
        return ipcRenderer.invoke('promptDescription', taskDescription);
    },
    'changeDescription': async (taskDescription:string) => {
        return ipcRenderer.invoke('changeDescription', taskDescription);
    },
    'deleteTask': async (rowId:number, description:string) => {
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
    'error': (doc:any) => {
        ipcRenderer.send("error", doc);
    },
    'save': (me:MezzoEvent) => {
        ipcRenderer.send("save", me)
    },
    'update': (me:MezzoEvent) => {
        ipcRenderer.send("update", me)
    },
    'viewLog': () => {
        ipcRenderer.send("viewLog");
    },
    'findAll': async (period:Period) => {
        return await ipcRenderer.invoke("findAll", period)
    },
    'print': (period:Period) => {
        ipcRenderer.send("print", period);
    },
    'info': () => {
        shell.openExternal("https://mezzotimer.com/help.html");
    },
    'about': () => {
        ipcRenderer.send("about");
    },
    'register': (channel:any, f:any) => {
        ipcRenderer.on(channel, (event, data) => {
            f(data)
        })
    },
    'getCachedPeriod': (channel:any) => {
        return ipcRenderer.invoke("getCachedPeriod")
    }
});
