/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const {ipcRenderer} = require("electron");
const util = require("../util/util");
const _ = require("lodash");

const report = new Vue({
    el: "#report",
    data: {
        period: {startkey: 0, endkey: 0},
        docs: []
    },
    computed: {
        periodFrom: function () {
            return new Date(this.period.startkey).toLocaleDateString();
        },
        periodTo: function () {
            return new Date(this.period.endkey).toLocaleDateString();
        },
        reportDate: function () {
            return new Date().toLocaleDateString();
        },
        summaryRows: function() {
            return util.summary(this.docs);
        },
        totalCount: function() {
            return _.filter(this.docs, e => e.eventType === "COMPLETE").length;
        }
    },
    mounted() {
        ipcRenderer.invoke("getCachedPeriod")
            .then(period => {
                this.period = period;
                ipcRenderer.invoke("findAll", period)
                    .then(items => this.docs = items)
                    .catch(err => console.error(err));
            })
            .catch(err => console.error(err));
    }
});

