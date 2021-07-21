<template>
    <div id="options">
        <div id="options-body">
        Color:
        <select v-model="timerColor">
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
            <select v-model="minutes">
                <option v-for="t in times" v-bind:value="t">{{t}}</option>
            </select>
            <br>

            Long Break:
            <select v-model="longBreak">
                <option v-for="t in times" v-bind:value="t">{{t}}</option>
            </select>

            Short Break:

            <select v-model="shortBreak">
                <option v-for="t in times" v-bind:value="t">{{t}}</option>
            </select>
        </div>

        <br>

        <input type="checkbox" v-model="tick" true-value="true" false-value="false">Tick-tock
        <input type="checkbox" v-model="alarm" true-value="true" false-value="false">Final Alarm
        <input type="checkbox" v-model="notification">Notification
        <br><br>
        <input type="checkbox" v-model="gong" true-value="true" false-value="false">Gong
        <input type="radio" name="gong-style" value="progressive" v-model="gongStyle">Progressive
        <input type="radio" name="gong-style" value="single" v-model="gongStyle">Single<br>

        <div class="center">
            <button class="button" @click="defaultOptions">Defaults</button>
        </div>
        </div>
        <div class="done-button" @click="done"><img src="../images/arrow_left.png" title="Back"/></div>
    </div>
</template>

<script lang="ts">
    import {defineComponent, inject, ref, watch, onMounted} from 'vue';
    import {Emitter} from "mitt";

    const defaultMinutes = "30";
    const defaultLongBreak = "15";
    const defaultShortBreak = "5";
    const defaultTick = "true";
    const defaultGong = "true";
    const defaultAlarm = "true";
    const defaultNotification = "true";
    const defaultTimerColor = "green";
    const defaultGongStyle = "progressive";

    export default defineComponent({
        setup() {

            const emitter = inject("emitter") as Emitter<any>

            const times = ref([1, 3, 5, 10, 15, 20, 25, 30, 45, 60]);
            const minutes = ref(localStorage["minutes"] !== undefined ? localStorage["minutes"] : defaultMinutes);
            const longBreak = ref(localStorage["longbreak"] !== undefined ? localStorage["longbreak"] : defaultLongBreak);
            const shortBreak = ref(localStorage["shortbreak"] !== undefined ? localStorage["shortbreak"] : defaultShortBreak);
            const tick = ref(localStorage["tick"] !== undefined ? localStorage["tick"] : defaultTick);
            const gong = ref(localStorage["gong"] !== undefined ? localStorage["gong"] : defaultGong);
            const alarm = ref(localStorage["alarm"] !== undefined ? localStorage["alarm"] : defaultAlarm);
            const notification = ref(localStorage["notification"] !== undefined ? localStorage["notification"] : defaultNotification);
            const timerColor = ref(localStorage["timercolor"] !== undefined ? localStorage["timercolor"] : defaultTimerColor);
            const gongStyle = ref(localStorage["gongstyle"] !== undefined ? localStorage["gongstyle"] : defaultGongStyle);

            function defaultOptions() {
                minutes.value = defaultMinutes;
                longBreak.value = defaultLongBreak;
                shortBreak.value = defaultShortBreak;
                tick.value = defaultTick;
                gong.value = defaultGong;
                alarm.value = defaultAlarm;
                notification.value = defaultNotification;
                timerColor.value = defaultTimerColor;
                gongStyle.value = defaultGongStyle;
            }

            watch(minutes, (newValue, _) => localStorage["minutes"] = newValue)
            watch(longBreak, (newValue, _) => localStorage["longbreak"] = newValue)
            watch(shortBreak, (newValue, _) => localStorage["shortbreak"] = newValue)
            watch(tick, (newValue, _) => localStorage["tick"] = newValue)
            watch(gong, (newValue, _) => localStorage["gong"] = newValue)
            watch(alarm, (newValue, _) => localStorage["alarm"] = newValue)
            watch(notification, (newValue, _) => localStorage["notification"] = newValue)
            watch(timerColor, (newValue, _) => localStorage["timercolor"] = newValue)
            watch(gongStyle, (newValue, _) => localStorage["gongstyle"] = newValue)

            return {
                times,
                minutes,
                longBreak,
                shortBreak,
                tick,
                gong,
                alarm,
                notification,
                timerColor,
                gongStyle,
                defaultOptions,
                done: () => emitter.emit('currentView', { view: 'timerMenuComponent' })
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
