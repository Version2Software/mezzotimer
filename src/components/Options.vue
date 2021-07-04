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
            <button class="button" @click="defautOptions">Defaults</button>
        </div>
        </div>
        <div class="done-button" @click="done"><img src="../images/arrow_left.png" title="Back"/></div>
    </div>
</template>

<script>
    const defaultMinutes = "30";
    const defaultLongBreak = "15";
    const defaultShortBreak = "5";
    const defaultTick = "true";
    const defaultGong = "true";
    const defaultAlarm = "true";
    const defaultNotification = "true";
    const defaultTimerColor = "green";
    const defaultGongStyle = "progressive";

    export default {

        data() {
            return {
                times: [1, 3, 5, 10, 15, 20, 25, 30, 45, 60],
                minutes: localStorage["minutes"] !== undefined ? localStorage["minutes"] : defaultMinutes,
                longBreak: localStorage["longbreak"] !== undefined ? localStorage["longbreak"] : defaultLongBreak,
                shortBreak: localStorage["shortbreak"] !== undefined ? localStorage["shortbreak"] : defaultShortBreak,
                tick: localStorage["tick"] !== undefined ? localStorage["tick"] : defaultTick,
                gong: localStorage["gong"] !== undefined ? localStorage["gong"] : defaultGong,
                alarm: localStorage["alarm"] !== undefined ? localStorage["alarm"] : defaultAlarm,
                notification: localStorage["notification"] !== undefined ? localStorage["notification"] : defaultNotification,
                timerColor: localStorage["timercolor"] !== undefined ? localStorage["timercolor"] : defaultTimerColor,
                gongStyle: localStorage["gongstyle"] !== undefined ? localStorage["gongstyle"] : defaultGongStyle

            };
        },
        watch: {
            minutes() {
                localStorage["minutes"] = this.minutes;
            },
            longBreak() {
                localStorage["longbreak"] = this.longBreak;
            },
            shortBreak() {
                localStorage["shortbreak"] = this.shortBreak;
            },
            tick() {
                localStorage["tick"] = this.tick;
            },
            gong() {
                localStorage["gong"] = this.gong;
            },
            alarm() {
                localStorage["alarm"] = this.alarm;
            },
            notification() {
                localStorage["notification"] = this.notification;
            },
            timerColor() {
                localStorage["timercolor"] = this.timerColor;
            },
            gongStyle() {
                localStorage["gongstyle"] = this.gongStyle;
            }
        },
        methods: {
            done() {
                this.emitter.emit('currentView', { view: 'timerMenuComponent' })
            },
            defautOptions() {
                this.minutes = localStorage["minutes"] = defaultMinutes;
                this.longBreak = localStorage["longbreak"] = defaultLongBreak;
                this.shortBreak = localStorage["shortbreak"] = defaultShortBreak;
                this.tick = localStorage["tick"] = defaultTick;
                this.gong = localStorage["gong"] = defaultGong;
                this.alarm = localStorage["alarm"] = defaultAlarm;
                this.notification = localStorage["notification"] = defaultNotification;
                this.timerColor = localStorage["timercolor"] = defaultTimerColor;
                this.gongStyle = localStorage["gongstyle"] = defaultGongStyle;
            }
        }
    }
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
