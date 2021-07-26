<template>
    <div id="exportData">
        <div id="export-body">
            Time Period:
            <select id="time-period" v-model="timePeriod">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="yesterday">Yesterday</option>
                <option value="lastweek">Last Week</option>
                <option value="lastmonth">Last Month</option>
                <option value="all">All Records</option>
            </select>
            <br><br>
            Export Format:
            <select v-model="exportFormat">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
            </select>
            <br><br>
            <input type="checkbox" v-model="completedOnly">Only include Completed
            <br><br>
            <div class="center">
                <button class="button" @click="exportData">Export</button>
            </div>
        </div>
        <div class="done-button" @click="done"><img src="../images/arrow_left.png" title="Back"/></div>
    </div>
</template>

<script lang="ts">
import {defineComponent, inject, ref} from 'vue';
import {getPeriod} from "../util/util";
import {Emitter} from "mitt";

export default defineComponent({
    setup() {
        const emitter = inject("emitter") as Emitter<any>;
        const exportFormat = ref("json");
        const timePeriod = ref("today");
        const completedOnly = ref(false);

        function exportData() {
            const queryOptions:QueryOptions = {
                period: getPeriod(timePeriod.value, new Date()),
                completedOnly: completedOnly.value
            }
            window.api.exportData(exportFormat.value, queryOptions)
        }

        return {
            timePeriod,
            exportFormat,
            completedOnly,
            exportData,
            done: () => emitter.emit('currentView', {view: 'timerMenuComponent'})
        }
    }
});
</script>

<style scoped>
#exportData {
    position: absolute;
    /*display: none;*/
    height: 100%;
    width: 100%;
    background-color: black;
    color: white;
    font-size: 8pt;
    line-height: 1.5em;
}

#export-body {
    margin: 1em;
}

.button {
    background-color: dodgerblue;
    border: none;
    color: white;
    padding: 5px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    border-radius: 20px;
    margin-top: 5px;
}

.done-button {
    position: absolute;
    bottom: 7px;
    left: 5px;
}

.done-button img {
    width: 20px;
    height: 20px;
}

.center {
    text-align: center;
}
</style>
