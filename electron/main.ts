/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

import fs from "fs";
import os from "os";
import path from "path";

import {app, BrowserWindow, dialog, ipcMain, Menu, screen} from "electron";
import {MezzoEvent, Period, Props, QueryOptions} from "./mezzo-types";

import prompt from "electron-prompt";
import Store from "electron-store";

import {DatabaseService} from "./database-service";
const db = new DatabaseService();

const store = new Store();
const size = os.platform() === "darwin" ? 250 : 270;

let winTimer: BrowserWindow | null;
let winEvents: BrowserWindow | null;
let winPrint: BrowserWindow | null;
let winAbout: BrowserWindow | null;
let winPrivacy: BrowserWindow | null;
let winPrivacyReadOnly: BrowserWindow | null;

let cachedOptions: QueryOptions;

const DEBUG = false;

const winPrefs = {
    contextIsolation: true,
    nodeIntegration: true,
    preload: path.join(__dirname, "preload.js"),
};

async function createPrivacyWindow() {

    winPrivacy = new BrowserWindow({x: 20, y: 20, width: 800, height: 560, webPreferences: winPrefs});

    await winPrivacy.loadURL(path.join("file://", __dirname, "index.html"));
    winPrivacy.setMenu(null);
    winPrivacy.setTitle("Privacy Policy");
    winPrivacy.webContents.send("page", "privacy");
    winPrivacy.on("closed", () => winPrivacy = null);
    winPrivacy.focus();

    if (DEBUG) {
        winPrivacy.webContents.openDevTools();
    }
}

async function createPrivacyWindowReadOnly() {

    winPrivacyReadOnly = new BrowserWindow({x: 20, y: 20, width: 800, height: 560, webPreferences: winPrefs});

    await winPrivacyReadOnly.loadURL(path.join("file://", __dirname, "index.html"));
    winPrivacyReadOnly.setMenu(null);
    winPrivacyReadOnly.setTitle("Privacy Policy");
    winPrivacyReadOnly.webContents.send("page", "privacy-readonly");
    winPrivacyReadOnly.on("closed", () => winPrivacyReadOnly = null);
    winPrivacyReadOnly.focus();

    if (DEBUG) {
        winPrivacyReadOnly.webContents.openDevTools();
    }
}

async function createTimerWindow(left: number) {
    if (DEBUG) {
        winTimer = new BrowserWindow({x: 0, y: 0, width: 2000, height: 400, webPreferences: winPrefs});
    } else {
        winTimer = new BrowserWindow({x: left, y: 40, width: size, height: size, webPreferences: winPrefs});
    }

    await winTimer.loadURL(path.join("file://", __dirname, "index.html"));
    winTimer.setMenu(null);
    winTimer.setTitle("Mezzo");
    winTimer.webContents.send("page", "timer");

    if (DEBUG) {
        winTimer.webContents.openDevTools();
    }

    winTimer.on("closed", () => winTimer = null);
}

async function createEventsWindow() {
    if (winEvents) {
        winEvents.close();
        return;
    }

    const dimensions = screen.getPrimaryDisplay().size;
    const left = dimensions.width - 620;
    const top = 290 + 10;

    if (DEBUG) {
        winEvents = new BrowserWindow({x: left, y: top, width: 2000, height: 600, webPreferences: winPrefs});
    } else {
        winEvents = new BrowserWindow({x: left, y: top, width: 600, height: 600, webPreferences: winPrefs});
    }

    await winEvents.loadURL(path.join("file://", __dirname, "index.html"));

    winEvents.setMenu(null);
    winEvents.setTitle("Mezzo Events");
    winEvents.webContents.send("page", "events");

    if (DEBUG) {
        winEvents.webContents.openDevTools();
    }

    winEvents.on("closed", () => winEvents = null);

    (winTimer as BrowserWindow).focus();
}

async function createPrintWindow() {

    const left = 10;
    const top = 10;

    if (DEBUG) {
        winPrint = new BrowserWindow({x: left, y: top, width: 2000, height: 600, webPreferences: winPrefs});
    } else {
        winPrint = new BrowserWindow({x: left, y: top, width: 600, height: 600, webPreferences: winPrefs});
    }

    await winPrint.loadURL(path.join("file://", __dirname, "index.html"));
    winPrint.setMenu(null);
    winPrint.setTitle("Print");
    winPrint.webContents.send("page", "print");

    if (DEBUG) {
        winPrint.webContents.openDevTools();
    }

    winPrint.on("closed", () => winPrint = null);
}

async function createAboutWindow() {

    if (winAbout) {
        return;
    }

    const dimensions = screen.getPrimaryDisplay().size;
    const left = dimensions.width / 2 - 409 / 2;
    const top = dimensions.height / 2 - 125;

    if (DEBUG) {
        winAbout = new BrowserWindow({x: left, y: top, width: 2000, height: 600, webPreferences: winPrefs});
    } else {
        winAbout = new BrowserWindow({x: left, y: top, width: 450, height: 350, webPreferences: winPrefs});
    }

    await winAbout.loadURL(path.join("file://", __dirname, "index.html"));
    winAbout.setMenu(null);
    winAbout.setTitle("About");
    winAbout.webContents.send("page", "about");

    if (DEBUG) {
        winAbout.webContents.openDevTools();
    }

    winAbout.on("closed", () => winAbout = null);
}

function initEventListeners() {
    ipcMain.on("started", () => {
        if (winEvents) {
            winEvents.webContents.send("started");
        }
    });

    ipcMain.on("viewLog", () => {
        createEventsWindow();
    });

    ipcMain.on("print", async (event, queryOptions) => {
        cachedOptions = queryOptions;
        createPrintWindow();
    });

    // TODO - There has to be a beter way of passing options to print window
    ipcMain.handle("getCachedOptions", () => {
        return cachedOptions;
    });

    ipcMain.handle("promptDescription" , async (event, taskDescription) => {
        return descriptionHelper(taskDescription, winTimer as BrowserWindow);
    });

    ipcMain.handle("changeDescription" , async (event, taskDescription) => {
        return descriptionHelper(taskDescription, winEvents as BrowserWindow);
    });

    async function descriptionHelper(taskDescription: string, currentWin: BrowserWindow) {
        return await prompt({
            inputAttrs: {
                type: "text",
            },
            label: "Task description:",
            title: "Task",
            type: "input",
            value: taskDescription,
            width: size - 20,
        }, currentWin);
    }

    ipcMain.handle("deleteTask" , async (event, rowId, description) => {
        const result = await dialog.showMessageBox(winEvents as BrowserWindow, {
            buttons: ["Yes", "No"],
            message: "Delete " + description + "?",
            title: "Confirm",
            type: "question",
        });

        // 0 means Yes
        if (result.response === 0) {
            return await db.delete(rowId);
        } else {
            return null;
        }
    });

    ipcMain.handle("confirmCancel" , async (_) => {
        const result = await dialog.showMessageBox(winTimer as BrowserWindow, {
            buttons: ["Yes", "No"],
            message: "Are you sure you want to cancel?",
            title: "Confirm Cancel",
            type: "question",
        });
        // 0 means Yes
        return (result.response === 0);
    });

    ipcMain.handle("exportData", async (_, format: string, queryOptions: QueryOptions) => {

        dialog.showSaveDialog(winTimer as BrowserWindow, {
            buttonLabel: "Save",
            defaultPath: path.join(os.homedir(), "mezzo." + format),
            filters: [
                {
                    extensions: ["json", "csv"],
                    name: "Text Files",
                } ],
            title: "Select the File Path to save",
        }).then((file: any) => {
            if (!file.canceled) {
                db.findAll(queryOptions)
                    .then((items: MezzoEvent[]) => {
                        const items2write = format === "json" ? items2json(items) : items2csv(items);

                        fs.writeFile(file.filePath.toString(),
                            items2write,
                            (err) => {
                                if (err) {
                                    throw err;
                                }
                            });
                    }).catch((err: any) => {
                        console.error(err);
                    });
            }
        });
    });

    ipcMain.handle("purgeData", async (_, days: number): Promise<boolean> => {
        const result = await dialog.showMessageBox(winTimer as BrowserWindow, {
            buttons: ["Yes", "No"],
            message: "Are you sure you want to purge " + days + " days?",
            title: "Confirm Cancel",
            type: "question",
        });
        // 0 means Yes
        if (result.response === 0) {
            db.purgeData(days);
            return true;
        }
        return false;
    });

    function items2json(items: MezzoEvent[]): string {
        return JSON.stringify(items, null, 4);
    }

    function items2csv(items: MezzoEvent[]): string {
        let s = "rowId,eventTimestamp,description,eventType\n";
        for (const i of items) {
            s += i.rowId + "," + i.eventTimestamp + "," + i.description + "," + i.eventType + "\n";
        }
        return s;
    }

    ipcMain.on("about", () => {
        createAboutWindow();
    });

    ipcMain.on("refresh", () => {
        refresh();
    });

    ipcMain.handle("findAll", async (event, queryOptions) => {
        return await db.findAll(queryOptions);
    });

    ipcMain.handle("completedCount", async (event, period: Period) => {
        return await db.completedCount(period);
    });

    ipcMain.on("save", async (_, me) => {
        await db.save(me);
        refresh();
    });

    ipcMain.handle("update", async (_, item) => {
        return await db.update(item);
    });

    ipcMain.handle("getDatabaseSize", async (_) => {
        const mezzoFile = path.join(os.homedir(), ".mezzo", "mezzo.sqlite");
        const stats = fs.statSync(mezzoFile);
        return stats.size;
    });

    ipcMain.on("log", (_, doc: any) => {
        console.log(doc);
    });

    ipcMain.on("closeEvents", () => {
        if (winEvents) {
            winEvents.close();
        }
    });

    ipcMain.on("cancelTask", () => {
        (winEvents  as BrowserWindow).webContents.send("cancelTask");
    });

    ipcMain.on("printPage", () => {
        (winPrint  as BrowserWindow).webContents.print({silent: false});
    });

    ipcMain.on("exit", () => {
        db.shutdown();
        app.quit();
    });

    ipcMain.on("accepted", () => {
        store.set("agreed", true);

        createWindow();
        createMenu();

        (winPrivacy as BrowserWindow).close();
    });

    ipcMain.handle("loadProperties", async (_) => {
        return loadProperties();
    });

    ipcMain.handle("saveProperties", async (_, props: Props) => {
        saveProperties(props);
    });
}

function loadProperties(): Props {
    return store.get("props") as Props;
}

function saveProperties(props: Props) {
    store.set("props", props);
}

function refresh() {
    if (winEvents) {
        winEvents.webContents.send("refresh");
    }
}

function about() {
    createAboutWindow();
}

function events() {
    createEventsWindow();
}

function createMenu() {
    if (os.platform() === "darwin") {
        const template = [
            {
                label: "Mezzo",
                submenu: [
                    {
                        label: "About Mezzo",
                        click() {
                            about();
                        },
                    },
                    {
                        label: "Hide Mezzo",
                        role: "hide",
                    },
                    {
                        label: "Quit Mezzo",
                        role: "quit",
                    },
                ],
            },
            {
                label: "Edit",
                submenu: [
                    {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
                    {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                    {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
                ],
            },
            {
                label: "View",
                submenu: [
                    {
                        label: "Privacy Policy",
                        click() {
                            createPrivacyWindowReadOnly();
                        },
                    },
                    {
                        accelerator: "Command+L",
                        label: "Event Log",
                        click() {
                            events();
                        },
                    },
                ],
            },
        ];
        // @ts-ignore
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }
}

function createWindow() {
    const dimensions = screen.getPrimaryDisplay().size;
    const left = dimensions.width - size - 20;

    createTimerWindow(left);
}

const init = () => {

    initEventListeners();

    const agreed = store.get("agreed");

    if (agreed) {
        createWindow();
        createMenu();
    } else {
        createPrivacyWindow();
    }

    // Create .mezzo directory if necessary
    const mezzodir = path.join(os.homedir(), ".mezzo");

    if (!fs.existsSync(mezzodir)) {
        fs.mkdir(mezzodir, (err) => {
            if (err) {
                console.error(`Could not create ${mezzodir}`);
                console.error(err);
                app.exit(-1);
            }
            console.log(`Directory created successfully: ${mezzodir}`);
        });
    }

    // Create default properties if necessary
    if (store.get("props") === undefined) {
        saveProperties(defaultProperties());
    }

    // Create and initialize database if necessary
    db.init(path.join(mezzodir, "mezzo.sqlite"));
};

function defaultProperties(): Props {
    return {
        alarm: "true",
        gong: "true",
        gongStyle: "progressive",
        longBreak: "15",
        minutes: "30",
        notification: "true",
        shortBreak: "5",
        tick: "true",
        timerColor: "green",
    };
}
app.on("ready", init);

app.on("window-all-closed", () => {
    app.quit();
});

app.on("will-quit", () => {
    console.log("will-quit");
    // db.shutdown()
});
