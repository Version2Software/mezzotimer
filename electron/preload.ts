import {contextBridge, ipcRenderer, shell} from "electron";

import {MezzoEvent, Period, Props, QueryOptions} from "./mezzo-types";

contextBridge.exposeInMainWorld("api", {

    about: () => {
        ipcRenderer.send("about");
    },
    accepted: () => {
        ipcRenderer.send("accepted");
    },
    changeDescription: async (taskDescription: string) => {
        return ipcRenderer.invoke("changeDescription", taskDescription);
    },
    completedCount: async (period: Period) => {
        return await ipcRenderer.invoke("completedCount", period);
    },
    confirmCancel: async () => {
        return await ipcRenderer.invoke("confirmCancel");
    },
    deleteTask: async (rowId: number, description: string) => {
        return await ipcRenderer.invoke("deleteTask", rowId, description);
    },
    download: () => {
        shell.openExternal("https://mezzotimer.com");
    },
    exit: () => {
        ipcRenderer.send("exit");
    },
    exportData: (format: string, period: Period, completedOnly: boolean) => {
        return ipcRenderer.invoke("exportData", format, period, completedOnly);
    },
    findAll: async (queryOptions: QueryOptions) => {
        return await ipcRenderer.invoke("findAll", queryOptions);
    },
    getCachedOptions: () => {
        return ipcRenderer.invoke("getCachedOptions");
    },
    getDatabaseSize: (): Promise<number> => {
        return ipcRenderer.invoke("getDatabaseSize");
    },
    info: () => {
        shell.openExternal("https://mezzotimer.com/help.html");
    },
    loadProperties: (): Promise<Props> => {
        return ipcRenderer.invoke("loadProperties");
    },
    log: (doc: any) => {
        ipcRenderer.send("log", doc);
    },
    print: (queryOptions: QueryOptions) => {
        ipcRenderer.send("print", queryOptions);
    },
    printPage: () => {
        ipcRenderer.send("printPage");
    },
    promptDescription: async (taskDescription: string) => {
        return ipcRenderer.invoke("promptDescription", taskDescription);
    },
    purgeData: (days: number): Promise<boolean> => {
        return ipcRenderer.invoke("purgeData", days);
    },
    register: (channel: any, f: any) => {
        ipcRenderer.on(channel, (event, data) => {
            f(data);
        });
    },
    save: (me: MezzoEvent) => {
        ipcRenderer.send("save", me);
    },
    saveProperties: (props: Props) => {
        ipcRenderer.invoke("saveProperties", props);
    },
    update: (me: MezzoEvent) => {
        ipcRenderer.send("update", me);
    },
    viewLog: () => {
        ipcRenderer.send("viewLog");
    },
});
