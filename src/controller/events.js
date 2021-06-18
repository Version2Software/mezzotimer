/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const {ipcRenderer, remote} = require("electron");
const {summary, getPeriod} = require("../util/util");
const _ = require("lodash");

ipcRenderer.on("refresh", () => {
    refreshLog();
});

const refreshLog = () => {
    const timePeriod = $("#time-period").val();
    const period = getPeriod(timePeriod, new Date());

    ipcRenderer.invoke("findAll", period)
        .then(items => report.docs = items)
        .catch(err => ipcRenderer.send("error", err));
};

const print = () => {
    const timePeriod = $("#time-period").val();
    const period = getPeriod(timePeriod, new Date());
    ipcRenderer.send("print", period);
};

const deleteEvent = async (e) => {
    remote.dialog.showMessageBox(
        await remote.getCurrentWindow(),
        {
            type: "question",
            buttons: ["Yes", "No"],
            title: "Confirm",
            message: "Delete " + e.description + "?"
        })
        .then(result => {
            // 0 means Yes
            if (result.response === 0) {
                ipcRenderer.invoke("delete", e.rowid)
                    .then(_ => refreshLog())
                    .catch(err => ipcRenderer.send("error", err));
            }
        });
};

const editEvent = (e) => {
    return jPrompt("Task description:", e.description, "Prompt Dialog", function (desc) {
        if (desc) {
            e.description = desc;
            ipcRenderer.invoke("update", e)
                .then(_ => refreshLog())
                .catch(err => ipcRenderer.send("error", err));
        }
    });
};

const report = new Vue({
    el: "#events",
    data: {
        docs: []
    },
    computed: {
        summaryRows: function() {
            return summary(this.docs);
        },
        totalCount: function() {
            return _.filter(this.docs, e => e.eventType === "COMPLETE").length;
        }
    },
    methods: {
        print: function() {
            print();
        },
        selectPeriod: function() {
            refreshLog();
        },
        textColor: function(e) {
            return (e.eventType === "COMPLETE") ? "red" : "black";
        },
        deleteEvent: function(e) {
            deleteEvent(e);
        },
        editEvent: function(e) {
            editEvent(e);
        }
    },
    mounted() {
        refreshLog();
    }
});
