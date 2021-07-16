<template>
    <div id="events">
        Time Period:
        <select id="time-period" @change="selectPeriod" v-model="timePeriod">
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

        <div class="center">Completed Mezzos: {{totalCount}}</div>

        <div id="completed-div">
            <table id="completed-table">
                <tr v-for="sr in summaryRows">
                    <td width="70%">{{sr.taskDescription}}</td>
                    <td width="30%">{{sr.count}}</td>
                </tr>
            </table>
        </div>

        <div class="center">Events</div>

        <div id="log-div">
            <table id="log-table">
                <tr v-for="d in docs">
                    <td width="30%">{{dateFormat(d.eventTimestamp)}}</td>
                    <td width="45%">{{d.description}}</td>
                    <td width="20%" :style="{ color: textColor(d) }" >{{d.eventType}}</td>
                    <td width="5%"><button @click="editEvent(d)">edit</button></td>
                    <td width="5%"><button @click="deleteEvent(d)">del</button></td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script lang="ts">

import {dateFormat, summary, getPeriod} from "../util/util";
import {defineComponent} from 'vue'

export default defineComponent({
    data() {
        return {
            docs: [] as MezzoEvent[],
            timePeriod: "today"
        }
    },
    computed: {
        summaryRows: function():{taskDescription:string, count:string}[] {
            return summary(this.docs);
        },
        totalCount: function():number {
            return this.docs.filter((e:MezzoEvent) => e.eventType === "COMPLETE").length;
        }
    },
    methods: {
        print: function():void {
            const period = getPeriod(this.timePeriod, new Date());
            window.api.print(period);
        },
        selectPeriod: function() {
            this.refreshLog();
        },
        textColor: function(e:MezzoEvent):string {
            return (e.eventType === "COMPLETE") ? "red" : "black";
        },
        deleteEvent: async function(e:MezzoEvent) {
            if (await window.api.deleteTask(e.rowId, e.description)) {
                this.refreshLog();
            }
        },
        editEvent: async function(e:MezzoEvent) {
            let desc = await window.api.changeDescription(e.description);
            if (desc) {
                e.description = desc;
                window.api.update(e);
            }
        },
        refreshLog: function() {
            const period = getPeriod(this.timePeriod, new Date());

            window.api.findAll(period)
                .then((items:[MezzoEvent]) => {
                    this.docs = items
                    console.log('items', items)
                })
                .catch((err:any) => {
                    window.api.error(err)
                });
        },
        dateFormat: (ts:number) => dateFormat(ts)
    },
    mounted() {
        this.refreshLog();

        window.api.register("refresh", () => {
            this.refreshLog();
        });
    }
});
</script>

<style>

    #events {
        font-family: Helvetica;
        font-size: 10pt;
        width: 90%;
        height: 90%;
        margin-left: auto;
        margin-right: auto;
        margin-top: 1em;
        margin-bottom: 1em;
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
