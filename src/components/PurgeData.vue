<template>
    <div id="purgeData">
        <div id="purge-body">
            <div>
                Current database size (bytes): {{databaseSize}}
            </div>
            <br>
            Delete records older than:
            <select id="time-period" v-model="days">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="730">2 years</option>
                <option value="0">Delete all records</option>
            </select>
            <br><br>
            <div class="center">
                <button class="button" @click="purgeData">Purge</button>
            </div>
        </div>
        <div class="done-button" @click="done"><img src="../images/arrow_left.png" title="Back"/></div>
    </div>
</template>

<script lang="ts" setup>

import {inject, onMounted, ref} from 'vue';
import {Emitter} from "mitt";

const emitter = inject("emitter") as Emitter<any>;
const days = ref(730);
const databaseSize = ref(0);

function getDatabaseSize() {
    window.api.getDatabaseSize().
        then((size:number) => databaseSize.value = size);
}

async function purgeData() {
    window.api.purgeData(days.value).then((purged:boolean) => {
        if (purged) {
            getDatabaseSize();
        }
    });
}

onMounted(function () {
    getDatabaseSize();
});

const done = () => emitter.emit('currentView', {view: 'timerMenuComponent'});

</script>

<style scoped>
#purgeData {
    position: absolute;
    /*display: none;*/
    height: 100%;
    width: 100%;
    background-color: black;
    color: white;
    font-size: 8pt;
    line-height: 1.5em;
}

#purge-body {
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
