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
                    <td width="30%">{{format(d.eventTimestamp)}}</td>
                    <td width="45%">{{d.description}}</td>
                    <td width="20%">{{d.eventType}}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref, computed, onMounted} from 'vue';
import {dateFormat, summary} from "../util/util";

const period = ref({startkey: 0, endkey: 0} as Period);
const docs = ref([] as MezzoEvent[]);

const format = (ts: number) => dateFormat(ts);
const printPage = () => window.api.printPage();

const periodFrom = computed(() => new Date(period.value.startkey).toLocaleDateString());
const periodTo = computed(() => new Date(period.value.endkey).toLocaleDateString());
const reportDate = computed(() => new Date().toLocaleDateString());
const summaryRows = computed(() => summary(docs.value));
const totalCount = computed(() => {
    return docs.value.filter((e: MezzoEvent) => e.eventType === "COMPLETE").length;
});

onMounted(() => {
    window.api.getCachedOptions()
        .then((queryOptions: QueryOptions) => {
            period.value = queryOptions.period;
            window.api.findAll(queryOptions)
                .then((items: MezzoEvent[]) => docs.value = items)
                .catch((err: any) => console.error(err));
        })
        .catch((err: any) => console.error(err));
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
