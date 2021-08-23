<template>
  <div id="timer">
    <component :is="currentView" />
  </div>
</template>

<script lang="ts" setup>

import {ref, inject, onMounted} from "vue";
import {Component} from "@vue/runtime-core";
import exportComponent from "./ExportData.vue";
import purgeComponent from "./PurgeData.vue";
import timerFrontComponent from "./TimerFront.vue";
import timerMenuComponent from "./TimerMenu.vue";
import optionsComponent from "./Options.vue";
import {Emitter} from "mitt";

const emitter = inject("emitter") as Emitter<any>;
const currentView = ref(timerFrontComponent as Component);

const names = {
    exportComponent,
    purgeComponent,
    timerFrontComponent,
    timerMenuComponent,
    optionsComponent
};

function lookup(name:string):Component {
    return names[name];
}

onMounted(() => {
    emitter.on("currentView", (e: string) => currentView.value = lookup(e.view));
});

</script>

<style scoped>
    #timer {
        background-color: black;
        font-family: Helvetica;
        font-size: 12pt;
        width: 100%;
        height: 100%;
    }
</style>
