<template>
    <div id="events">
        Time Period:
        <select id="time-period" @change="selectPeriod">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="yesterday">Yesterday</option>
            <option value="lastweek">Last Week</option>
            <option value="lastmonth">Last Month</option>
        </select>

        <button id="print-event" @click="print">Printable Page</button>

        <br>
        <br>

        <div class="center" v-cloak>Completed: {{totalCount}}</div>

        <div id="completed-div">
            <table id="completed-table" v-cloak>
                <tr v-for="sr in summaryRows">
                    <td width="70%">{{sr.taskDescription}}</td>
                    <td width="30%">{{sr.count}}</td>
                </tr>
            </table>
        </div>

        <div class="center">Events</div>

        <div id="log-div">
            <table id="log-table" v-cloak>
                <tr v-for="d in docs">
<!--                    <td width="30%">{{dateFormat(new Date(d.eventTimestamp), "yyyy-mm-dd h:MM TT")}}</td>-->
<!--                    <td width="30%">{{new Date(d.eventTimestamp)}}</td>-->
                    <td width="30%">{{new Date(d.eventTimestamp).toLocaleString()}}</td>
                    <td width="45%">{{d.description}}</td>
                    <td width="20%" :style="{ color: textColor(d) }" >{{d.eventType}}</td>
                    <td width="5%"><button @click="editEvent(d)">edit</button></td>
                    <td width="5%"><button @click="deleteEvent(d)">del</button></td>
                </tr>
            </table>
        </div>
    </div>

<!--    &lt;!&ndash; This enables jquery to work &ndash;&gt;-->
<!--    <script>if (typeof module === 'object') {window.module = module; module = undefined;}</script>-->

</template>

<script>

    const {summary, getPeriod} = require("../util/util");
    const _ = require("lodash");
    const $ = require("../lib/jquery.min")

    const deleteEvent = async (e) => {
        // remote.dialog.showMessageBox(
        //     await remote.getCurrentWindow(),
        //     {
        //         type: "question",
        //         buttons: ["Yes", "No"],
        //         title: "Confirm",
        //         message: "Delete " + e.description + "?"
        //     })
        //     .then(result => {
        //         // 0 means Yes
        //         if (result.response === 0) {
        //             ipcRenderer.invoke("delete", e.rowid)
        //                 .then(_ => refreshLog())
        //                 .catch(err => ipcRenderer.send("error", err));
        //         }
        //     });
    };

    const editEvent = (e) => {
        // return jPrompt("Task description:", e.description, "Prompt Dialog", function (desc) {
        //     if (desc) {
        //         e.description = desc;
        //         ipcRenderer.invoke("update", e)
        //             .then(_ => refreshLog())
        //             .catch(err => ipcRenderer.send("error", err));
        //     }
        // });
    };

export default {
    data() {
        return {
            docs: []
        }
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
            const timePeriod = $("#time-period").val();
            const period = getPeriod(timePeriod, new Date());
            window.api.print(period);
        },
        selectPeriod: function() {
            this.refreshLog();
        },
        textColor: function(e) {
            return (e.eventType === "COMPLETE") ? "red" : "black";
        },
        deleteEvent: function(e) {
            deleteEvent(e);
        },
        editEvent: function(e) {
            editEvent(e);
        },
        refreshLog: function() {
            const timePeriod = $("#time-period").val();
            const period = getPeriod(timePeriod, new Date());

            window.api.findAll(period)
                .then(items => {
                    this.docs = items
                })
                .catch(err => {
                    window.api.error(err)
                });
        }
    },
    mounted() {
        this.refreshLog();

        window.api.register("refresh", () => {
            this.refreshLog();
        });
    }
}
</script>

<style>

    #events {
        /*height: 100%;*/

        width: 90%;
        height: 90%;
        margin-left: auto;
        margin-right: auto;
        margin-top: 1em;
        margin-bottom: 1em;
    }

    [v-cloak] {
        display: none;
    }

    #completed-div, #log-div {
        width: 100%;
        height: 40%;
        margin-bottom: 1em;
        overflow: auto;
        border: 1px solid #DDDDDD;
        box-shadow: 2px 2px 2px #DDDDDD;
    }

    #completed-table, #log-table  {
        width: 100%;
    }

    tr:nth-child(even) {
        background: #FFF;
    }

    tr:nth-child(odd) {
        background: #EEE;
    }

    td {
        vertical-align: top;
    }

    .center {
        text-align: center;
    }
</style>
