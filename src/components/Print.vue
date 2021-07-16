/*
 * Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

<template>
    <div id="report">
        <p><a href="#" @click="printPage()">Print</a></p>
        <br><br>
        Report Date: {{reportDate}}
        <br>
        Period: {{periodFrom}} - {{periodTo}}
        <br><br>
        <div class="center">Completed Mezzos: {{totalCount}}</div>
        <div>
            <table>
                <tr v-for="sr in summaryRows">
                    <td width="70%">{{sr.taskDescription}}</td>
                    <td width="30%">{{sr.count}}</td>
                </tr>
            </table>
        </div>
        <br>
        <div class="center">Events</div>
        <div>
            <table>
                <tr v-for="d in docs">
                    <td width="30%">{{dateFormat(d.eventTimestamp)}}</td>
                    <td width="45%">{{d.description}}</td>
                    <td width="20%">{{d.eventType}}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import util from "../util/util";

    export default defineComponent({
        data() {
            return {
                period: {startkey: 0, endkey: 0} as Period,
                docs: [] as MezzoEvent[]
            }
        },
        methods: {
            dateFormat: (ts:number) => util.dateFormat(ts),
            printPage: function() {
                window.api.printPage();
            }
        },
        computed: {
            periodFrom: function (this: any) {
                return new Date(this.period.startkey).toLocaleDateString();
            },
            periodTo: function (this: any) {
                return new Date(this.period.endkey).toLocaleDateString();
            },
            reportDate: function () {
                return new Date().toLocaleDateString();
            },
            summaryRows: function(this: any) {
                return util.summary(this.docs);
            },
            totalCount: function(this: any) {
                return this.docs.filter((e:MezzoEvent) => e.eventType === "COMPLETE").length;
            }
        },
        mounted() {
            window.api.getCachedPeriod()
                .then((period:Period) => {
                    this.period = period;
                    window.api.findAll(period)
                        .then((items:MezzoEvent[]) => this.docs = items)
                        .catch((err:any) => console.error(err));
                })
                .catch((err:any) => console.error(err));
        }
    });
</script>

<style scoped>
    #report {
        background-color: white;
        font-family: Helvetica;
        font-size: 10pt;
        /*width: 100%;*/
        /*height: 100%;*/
        margin-top: 2em;
        margin-left: 1em;
        margin-right: 1em;
        margin-bottom: 1em;
    }

    td {
        vertical-align: top;
    }

    table {
        width: 100%;
    }

    .center {
        text-align: center;
    }

    p {
        text-align: right;
    }
</style>
