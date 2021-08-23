<template>
  <div id="options">
    <div id="options-body">
      Color:
      <select v-model="props.timerColor">
        <option value="green">
          Green
        </option>
        <option value="#4169E1">
          Blue
        </option>
        <option value="orange">
          Orange
        </option>
        <option value="purple">
          Purple
        </option>
        <option value="red">
          Red
        </option>
      </select>
      <br><br>

      Minutes:
      <div style="padding-left: 1em;">
        Task Length:
        <select v-model="props.minutes">
          <option
            v-for="(t, index) in times"
            :key="index"
            :value="t"
          >
            {{ t }}
          </option>
        </select>
        <br>

        Long Break:
        <select v-model="props.longBreak">
          <option
            v-for="(t, index) in times"
            :key="index"
            :value="t"
          >
            {{ t }}
          </option>
        </select>

        Short Break:

        <select v-model="props.shortBreak">
          <option
            v-for="(t, index) in times"
            :key="index"
            :value="t"
          >
            {{ t }}
          </option>
        </select>
      </div>

      <br>

      <input
        v-model="props.tick"
        type="checkbox"
        true-value="true"
        false-value="false"
      >Tick-tock
      <input
        v-model="props.alarm"
        type="checkbox"
        true-value="true"
        false-value="false"
      >Final Alarm
      <input
        v-model="props.notification"
        type="checkbox"
      >Notification
      <br><br>
      <input
        v-model="props.gong"
        type="checkbox"
        true-value="true"
        false-value="false"
      >Gong
      <input
        v-model="props.gongStyle"
        type="radio"
        name="gong-style"
        value="progressive"
      >Progressive
      <input
        v-model="props.gongStyle"
        type="radio"
        name="gong-style"
        value="single"
      >Single<br>

      <div class="center">
        <button
          class="button"
          @click="save"
        >
          Save
        </button>
        <button
          class="button"
          @click="defaultOptions"
        >
          Defaults
        </button>
      </div>
    </div>
    <div
      class="done-button"
      @click="done"
    >
      <img
        src="../images/arrow_left.png"
        title="Back"
      >
    </div>
  </div>
</template>

<script lang="ts" setup>

import {inject, reactive, ref, onMounted} from "vue";
import {Emitter} from "mitt";
import {defaultProperties} from "../util/util";

const emitter = inject("emitter") as Emitter<any>;
const times = ref([1, 3, 5, 10, 15, 20, 25, 30, 45, 60]);

const props = reactive(defaultProperties());

onMounted(async function() {
    updateProps(await window.api.loadProperties());
});

function defaultOptions() {
    updateProps(defaultProperties());
}

function updateProps(p:Props) {
    props.minutes = p.minutes;
    props.longBreak = p.longBreak;
    props.shortBreak = p.shortBreak;
    props.tick = p.tick;
    props.gong = p.gong;
    props.alarm = p.alarm;
    props.notification = p.notification;
    props.timerColor = p.timerColor;
    props.gongStyle = p.gongStyle;
}

const save = () => {
    // This bizzare snippet converts props from a proxy to a simple object, therefore preventing a clone error.
    window.api.saveProperties(JSON.parse(JSON.stringify(props)));
};

const done = () => emitter.emit("currentView", {view: "timerMenuComponent"});

</script>

<style scoped>
    #options {
        position: absolute;
        /*display: none;*/
        height: 100%;
        width: 100%;
        background-color: black;
        color: white;
        font-size: 8pt;
        line-height: 1.5em;
    }
    #options-body {
        margin: 1em;
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
        margin-left: 2px;
        margin-right: 2px;
    }

    .button:active {
        background-color: lightblue;
    }
</style>
