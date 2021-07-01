/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const os = require("os");
const path = require("path");
const url = require("url");
const fs = require('fs');

const {app, BrowserWindow, ipcMain, Menu, screen} = require("electron");
const Store = require('electron-store');

const remoteService = require("./service/remoteService")
const db = new remoteService.RemoteService();

const store = new Store();
const size = os.platform() === 'darwin' ? 250 : 270;

let winTimer, winEvents, winPrint, winError, winAbout, winPrivacy, winPrivacyReadOnly;
let cachedPeriod = null;

const DEBUG = false;

// const winPrefs = {
//     nodeIntegration: true,
//     contextIsolation: false,
//     enableRemoteModule: true
// };

const winPrefs = {
    nodeIntegration: true,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
};

function createPrivacyWindow() {

    winPrivacy = new BrowserWindow({x: 20, y: 20, width: 800, height: 488, webPreferences: winPrefs});

    winPrivacy.loadURL(path.join("file://", __dirname, "index.html")).then(result => {
        winPrivacy.webContents.send("page", "privacy")
    })

    winPrivacy.setMenu(null);
    winPrivacy.on("closed", () => winPrivacy = null);
    winPrivacy.focus();
}

function createPrivacyWindowReadOnly() {

    winPrivacyReadOnly = new BrowserWindow({x: 20, y: 20, width: 800, height: 488, webPreferences: winPrefs});

    winPrivacyReadOnly.loadURL(path.join("file://", __dirname, "index.html")).then(result => {
        winPrivacyReadOnly.webContents.send("page", "privacy-readonly")
    })

    winPrivacyReadOnly.setMenu(null);
    winPrivacyReadOnly.on("closed", () => winPrivacy = null);
    winPrivacyReadOnly.focus();
}

function createTimerWindow(left) {
    if (DEBUG) {
        winTimer = new BrowserWindow({x: 0, y: 0, width: 2000, height: 400, webPreferences: winPrefs});
    } else {
        winTimer = new BrowserWindow({x: left, y: 40, width: size, height: size, show: false, webPreferences: winPrefs});
    }

    winTimer.loadURL(path.join("file://", __dirname, "index.html")).then(result => {
        winTimer.webContents.send("page", "timer")
    })

    if (DEBUG) {
        winTimer.webContents.openDevTools();
    }
    winTimer.setMenu(null);
    winTimer.once("ready-to-show", () => winTimer.show());
    winTimer.on("closed", () => winTimer = null);
}

function createEventsWindow() {
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

    winEvents.setMenu(null);
    winEvents.loadURL(path.join("file://", __dirname, "index.html")).then(result => {
        winEvents.webContents.send("page", "events")
    })

    if (DEBUG) {
        winEvents.webContents.openDevTools();
    }

    winEvents.on("closed", () => winEvents = null);
    winTimer.focus();
}

function createPrintWindow() {

    const left = 10;
    const top = 10;

    if (DEBUG) {
        winPrint = new BrowserWindow({x: left, y: top, width: 2000, height: 600, webPreferences: winPrefs});
    } else {
        winPrint = new BrowserWindow({x: left, y: top, width: 600, height: 600, webPreferences: winPrefs});
    }

    winPrint.setMenu(null);

    winPrint.loadURL(path.join("file://", __dirname, "index.html")).then(result => {
        winPrint.webContents.send("page", "print")
    })

    if (DEBUG) {
        winPrint.webContents.openDevTools();
    }

    winPrint.on("closed", () => winPrint = null);
}

function createErrorWindow() {

    if (winError) {
        winError.close();
        return;
    }

    const dimensions = screen.getPrimaryDisplay().size;
    const left = dimensions.width - 290 - 600;
    const top = 40;

    if (DEBUG) {
        winError = new BrowserWindow({x: left, y: top, width: 2000, height: 600, webPreferences: winPrefs});
    } else {
        winError = new BrowserWindow({x: left, y: top, width: 600, height: 250, webPreferences: winPrefs});
    }

    winError.setMenu(null);
    winError.loadURL(path.join("file://", __dirname, "index.html"));

    if (DEBUG) {
        winError.webContents.openDevTools();
    }

    winError.on("closed", () => winError = null);
}

function createAboutWindow() {

    if (winAbout) {
        return;
    }

    const dimensions = screen.getPrimaryDisplay().size;
    const left = dimensions.width/2 - 409/2;
    const top = dimensions.height/2 - 125;

    if (DEBUG) {
        winAbout = new BrowserWindow({x: left, y: top, width: 2000, height: 600, webPreferences: winPrefs});
    } else {
        winAbout = new BrowserWindow({x: left, y: top, width: 450, height: 350, webPreferences: winPrefs});
    }

    winAbout.setMenu(null);
    winAbout.loadURL(path.join("file://", __dirname, "index.html")).then(result => {
        winAbout.webContents.send("page", "about")
    })

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

    ipcMain.on("print", async (event, period) => {
        cachedPeriod = period
        createPrintWindow()
    });

    ipcMain.handle("getCachedPeriod", () => {
        return cachedPeriod;
    });

    ipcMain.on("about", () => {
        createAboutWindow();
    });

    ipcMain.on("refresh", () => {
        refresh();
    });

    ipcMain.handle("findAll", async (event, period) => {
        return await db.findAll(period.startkey, period.endkey)
    });

    ipcMain.on("save", async (event, me) => {
        await db.save(me);
        refresh();
    });

    ipcMain.handle("delete", async (event, sortTimestamp) => {
        return await db.delete(sortTimestamp);
    });

    ipcMain.handle("update", async (event, item) => {
        return await db.update(item);
    });

    ipcMain.on("error", (event, doc) => {
        if (winError) {
            winError.webContents.send("doc", doc);
        }
    });

    ipcMain.on("closeEvents", () => {
        if (winEvents) {
            winEvents.close();
        }
    });

    ipcMain.on("cancelTask", () => {
        winTimer.webContents.send("cancelTask");
    });

    ipcMain.on("exit", () => {
        db.shutdown();
        app.quit();
    });

    ipcMain.on("accepted", () => {
        store.set('agreed', true);

        createWindow();
        createMenu();

        winPrivacy.close();
    });
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

function errors() {
    createErrorWindow();
}

function createMenu() {
    if (os.platform() == "darwin") {
        const template = [
            {
                label: "Mezzo",
                submenu: [
                    {
                        label: "About Mezzo",
                        click() {
                            about();
                        }
                    },
                    {
                        label: "Hide Mezzo",
                        role: "hide"
                    },
                    {
                        label: "Quit Mezzo",
                        role: "quit"
                    },
                ]
            },
            {
                label: "Edit",
                submenu: [
                    {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
                    {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                    {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"}
                ]
            },
            {
                label: "View",
                submenu: [
                    {
                        label: "Privacy Policy",
                        click() {
                            createPrivacyWindowReadOnly();
                        }
                    },
                    {
                        label: "Log",
                        accelerator: "Command+L",
                        click() {
                            events();
                        }
                    },
                    {
                        visible: DEBUG,
                        label: "System Events",
                        accelerator: "Command+E",
                        click() {
                            errors();
                        }
                    }
                ]
            }
        ];
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

    let agreed = store.get('agreed');

    if (agreed) {
        createWindow();
        createMenu();
    } else {
        createPrivacyWindow();
    }

    const mezzodir = path.join(os.homedir(), '.mezzo');

    if (!fs.existsSync(mezzodir)) {
        fs.mkdir(mezzodir, (err) => {
            if (err) {
                console.error('Could not create ' + mezzodir);
                console.error(err);
                app.exit(-1);
            }
            console.log('Directory created successfully: ', mezzodir);
        });
    }
    db.init(path.join(mezzodir, 'mezzo.sqlite'));
};

app.on("ready", init);

app.on("window-all-closed", () => {
    app.quit();
});

app.on("will-quit", () => {
    console.log("will-quit")
    // db.shutdown()
});

app.on("activate", () => {
    if (winTimer === null) {
        createWindow();
    }
});
