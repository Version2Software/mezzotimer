'use strict'

const {contextBridge, ipcRenderer, shell} = require('electron');
import {MezzoEvent, Period, QueryOptions, Props} from "./mezzo-types";

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
    'accepted': () => {
        ipcRenderer.send("accepted");
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
    'findAll': async (queryOptions:QueryOptions) => {
        return await ipcRenderer.invoke("findAll", queryOptions)
    },
    'completedCount': async (period:Period) => {
        return await ipcRenderer.invoke("completedCount", period)
    },
    'print': (queryOptions:QueryOptions) => {
        ipcRenderer.send("print", queryOptions);
    },
    'info': () => {
        shell.openExternal("https://mezzotimer.com/help.html");
    },
    'about': () => {
        ipcRenderer.send("about");
    },
    'log': (doc:any) => {
        ipcRenderer.send("log", doc);
    },
    'exit': () => {
        ipcRenderer.send("exit");
    },
    'register': (channel:any, f:any) => {
        ipcRenderer.on(channel, (event, data) => {
            f(data)
        })
    },
    'getCachedOptions': () => {
        return ipcRenderer.invoke("getCachedOptions")
    },
    'exportData': (format:string, period:Period, completedOnly:boolean) => {
        return ipcRenderer.invoke("exportData", format, period, completedOnly);
    },
    'purgeData': (days:number):Promise<boolean> => {
        return ipcRenderer.invoke("purgeData", days);
    },
    'getDatabaseSize': ():Promise<number> => {
        return ipcRenderer.invoke("getDatabaseSize");
    },
    'loadProperties': ():Promise<Props> => {
        return ipcRenderer.invoke("loadProperties");
    },
    'saveProperties': (props:Props) => {
        ipcRenderer.invoke("saveProperties", props);
    }
});
