<template>
    <div id="options">
        <div id="options-body">
        Color:
        <select v-model="props.timerColor">
            <option value="green">Green</option>
            <option value="#4169E1">Blue</option>
            <option value="orange">Orange</option>
            <option value="purple">Purple</option>
            <option value="red">Red</option>
        </select>
        <br><br>

        Minutes:
        <div style="padding-left: 1em;">
            Task Length:
            <select v-model="props.minutes">
                <option v-for="t in times" v-bind:value="t">{{t}}</option>
            </select>
            <br>

            Long Break:
            <select v-model="props.longBreak">
                <option v-for="t in times" v-bind:value="t">{{t}}</option>
            </select>

            Short Break:

            <select v-model="props.shortBreak">
                <option v-for="t in times" v-bind:value="t">{{t}}</option>
            </select>
        </div>

        <br>

        <input type="checkbox" v-model="props.tick" true-value="true" false-value="false">Tick-tock
        <input type="checkbox" v-model="props.alarm" true-value="true" false-value="false">Final Alarm
        <input type="checkbox" v-model="props.notification">Notification
        <br><br>
        <input type="checkbox" v-model="props.gong" true-value="true" false-value="false">Gong
        <input type="radio" name="gong-style" value="progressive" v-model="props.gongStyle">Progressive
        <input type="radio" name="gong-style" value="single" v-model="props.gongStyle">Single<br>

        <div class="center">
            <button class="button" @click="defaultOptions">Defaults</button>
        </div>
        </div>
        <div class="done-button" @click="done"><img src="../images/arrow_left.png" title="Back"/></div>
    </div>
</template>

<script lang="ts">
import {defineComponent, inject, reactive, ref, watch} from 'vue';
import {Emitter} from "mitt";
import {loadProperties, saveProperties} from "../util/util";

export default defineComponent({
    setup() {
        const emitter = inject("emitter") as Emitter<any>;
        const times = ref([1, 3, 5, 10, 15, 20, 25, 30, 45, 60]);
        const props = reactive(loadProperties());

        function defaultOptions() {
            props.minutes = "30";
            props.longBreak = "15";
            props.shortBreak = "5";
            props.tick = "true";
            props.gong = "true";
            props.alarm = "true";
            props.notification = "true";
            props.timerColor = "green";
            props.gongStyle = "progressive";
        }

        watch(props, (newValue, _) => saveProperties(newValue));

        return {
            times,
            props,
            defaultOptions,
            done: () => emitter.emit('currentView', {view: 'timerMenuComponent'})
        };
    }
});
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
    }
</style>
