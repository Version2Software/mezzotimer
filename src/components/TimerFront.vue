/*
*  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
*/

<template>
    <div id="timer-front" :style="{'font-weight': timerFrontFontWeight}">
        <audio id="audio-tick" src="./ogg/ticktock.ogg"></audio>
        <audio id="audio-gong" src="./ogg/gong.ogg"></audio>
        <audio id="audio-extra-gong" src="./ogg/extra-gong.ogg"></audio>
        <audio id="audio-alarm" src="./ogg/low-gong.ogg"></audio>

        <div>
            <div id="completed-counter" title="Completed" v-show="completedCount > 0">{{completedCount}}</div>
        </div>

        <div id="mezzora">
            <div id="clock">
                <canvas id="triangle"></canvas>
                <canvas id="mezzcanvas"></canvas>
            </div>
            <div id="middle-buttons">
                <div id="start-stop" class="center"><img id="play-button" src="../images/play-pause-gray.png"
                                                         class="play-pause" @click="startPauseResume" title="Start/Pause"/>
                </div>
                <div id="short-break" @click="startShortBreak" title="Short Break"></div>
                <div id="long-break" @click="startLongBreak" title="Long Break"></div>
                <div id="pause-resume" class="center"><img id="stop-button" src="../images/stop-gray.png"
                                                           class="play-pause" @click="stop" title="Stop"/></div>
            </div>
        </div>

        <div>
            <canvas id="volume-control" @click="stepVolume" width=200 height=200 title="Volume"></canvas>
            <div id="log-button" @click="viewLog"><img src="../images/log.png" title="Records"></div>
            <div id="refresh-button" @click="refreshTimerCount"><img src="../images/reset.png" title="Refresh"></div>
            <div id="menu-button" class="defaultCursor" @click="menu">...</div>
        </div>
    </div>
</template>

<script lang="ts">

import {states} from "../util/mezzo-constants";
import {defaultProperties} from "../util/util";

let realState = states.IDLE;
let mezzoraMinutes = 0;
let millis = 0;
let millisAtStart = 0;
let startPause = 0;
let pauses: number[] = [];
let elapsedFiveMinutePeriods = 0;
let taskDescription: any = null;
let needGong = true;
let vol = 1.0;
let props = defaultProperties();

</script>

<script lang="ts" setup>

import {inject, ref, onMounted} from 'vue';
import {lengthOfTickMark, tickTime, nextTimeout, ellapsedTime, pausedTime} from "../util/timer-util";
import {events, states} from "../util/mezzo-constants";
import {Emitter} from "mitt";

const emitter = inject("emitter") as Emitter<any>

const audioTick = ref(null as any);
const audioGong = ref(null as any);
const audioExtraGong = ref(null as any);
const audioAlarm = ref(null as any);
const triangle = ref(null as any);
const triangleOpacity = ref(1.0);
const mezzcanvasBackground = ref(null as any);
const completedCount = ref(0);
const timerFrontFontWeight = ref("");
const clockStyles = ref({
    'background-color': 'red',
    'font-weight': 'normal',
    'text-shadow': 'initial'
});

onMounted(async function () {
    props = await window.api.loadProperties();

    try {
        audioTick.value = document.getElementById("audio-tick");
        audioGong.value = document.getElementById("audio-gong");
        audioExtraGong.value = document.getElementById("audio-extra-gong");
        audioAlarm.value = document.getElementById("audio-alarm");
        triangle.value = document.getElementById("triangle");

        audioGong.value.addEventListener("ended", gongEnd, false);
        audioExtraGong.value.addEventListener("ended", extraGongEnd, false);

        mezzcanvasBackground.value = props.timerColor;
        setClockColor(props.timerColor);

        paintTriangle(1.0);
        paintVolume();

        // TODO - verify if  code is still needed
        if (isWindows()) {
            timerFrontFontWeight.value = "bold";
            clockStyles.value["font-weight"] = "bold";
            clockStyles.value["text-shadow"] = "0px 1px 1px white";
        }
        updateGUI(minutes());
        audioTick.value.load();

        refreshTimerCount();
        //
        // ipcRenderer.on("cancelTask", () => {
        //     processEvent(events.STOP);
        // });

        if (realState === states.PAUSED) {
            addLogEvent(events.RESUME, "Resume");
            realState = states.RUNNING;
            resume();
        }
    } catch (ex) {
        error(ex);
    }
});

async function startPauseResume() {
    if (realState === states.IDLE) {
        let desc = await window.api.promptDescription(taskDescription);
        if (desc) {
            taskDescription = desc;
            processEvent(events.START);
        }
    } else if (realState === states.RUNNING) {
        processEvent(events.START);

    } else if (realState === states.PAUSED) {
        processEvent(events.START);
    }
}

async function stop() {
    if (realState === states.RUNNING || realState === states.PAUSED) {
        if (await window.api.confirmCancel()) {
            processEvent(events.STOP);
        }
    } else if (realState === states.SHORT_BREAK_RUNNING) {
        processEvent(events.STOP);

    } else if (realState === states.LONG_BREAK_RUNNING) {
        processEvent(events.STOP);
    }
}

function startShortBreak() {
    if (realState === states.IDLE) {
        processEvent(events.SHORT_BREAK_START);
    }
}

function startLongBreak() {
    if (realState === states.IDLE) {
        processEvent(events.LONG_BREAK_START);
    }
}

function paintTriangle(opacity: number) {
    const contextTriangle = triangle.value.getContext("2d");
    contextTriangle.fillStyle = "white";
    contextTriangle.beginPath();
    contextTriangle.moveTo(0, 0);
    contextTriangle.lineTo(triangle.value.width, 0);
    contextTriangle.lineTo(triangle.value.width / 2, triangle.value.height);
    contextTriangle.lineTo(0, 0);
    contextTriangle.closePath();
    triangleOpacity.value = opacity;
    contextTriangle.fill();
}

function error(doc: any) {
    console.log(doc);
    window.api.log(doc);
}

function updateClock() {

    // // TODO - is this needed?
    if (realState !== states.RUNNING && realState !== states.SHORT_BREAK_RUNNING && realState !== states.LONG_BREAK_RUNNING) {
        return;
    }

    const ellapsed = ellapsedTime(millisAtStart, Date.now(), pausedTime(pauses));
    const remaining = Math.round(mezzoraMinutes * 60000 - ellapsed);
    const remainingSeconds = Math.round(remaining / 1000);

    // console.log("remainingSeconds", remainingSeconds % 2);

    if (remainingSeconds % 2 === 0) {
        if ("true" === props.tick) {
            audioTick.value.play();
        }
    }

    millis += 1000;

    toggleRunningIndicator();

    if (millis >= 60000) {
        const mins = minutes();
        millis = 0;
        updateGUI(mins);
        if (mins % 5 === 0 && mins !== 0) {
            if (needGong) {
                needGong = false;
                if (props.gong === "true") {
                    playGong(elapsedFiveMinutePeriods);
                    elapsedFiveMinutePeriods++;
                }
            }
        } else {
            needGong = true;
        }
    }

    if (remaining <= 0) {
        // realState = states.IDLE;
        processEvent(events.COMPLETE);
        // audioTick.pause();
        pauses = [];
        if ("true" === props.alarm) {
            audioAlarm.play();
        }
    } else {
        setTimeout(updateClock, nextTimeout(ellapsed));
    }
}

function playGong(extraTimes: any) {
    audioExtraGong.value.times = extraTimes;
    audioGong.value.play();
}

function gongEnd() {
    playExtraGong();
}

function playExtraGong() {
    if (audioExtraGong.value.times > 0) {
        audioExtraGong.value.play();
    }
}

function extraGongEnd() {
    audioExtraGong.value.times--;
    playExtraGong();
}

function processEvent(timerEvent: any) {
    try {
        millis = 0;
        if (timerEvent === events.START && realState === states.IDLE) {
            addLogEvent(events.START, taskDescription);
            realState = states.RUNNING;
            startUp(props.minutes);

        } else if (timerEvent === events.START && realState === states.RUNNING) {
            addLogEvent(events.PAUSE, "Pause");
            realState = states.PAUSED;
            pause();

        } else if (timerEvent === events.START && realState === states.PAUSED) {
            addLogEvent(events.RESUME, "Resume");
            realState = states.RUNNING;
            resume();

        } else if (timerEvent === events.STOP && realState === states.RUNNING || realState === states.PAUSED) {
            addLogEvent(events.CANCEL, taskDescription);
            realState = states.IDLE;
            cancel();

        } else if (timerEvent === events.COMPLETE && realState === states.RUNNING) {
            addLogEvent(events.COMPLETE, taskDescription);
            realState = states.IDLE;
            notifyComplete("The mezzo is complete.");

            // TODO - Timeout needed due to database latency. Is there a better way?
            setTimeout(refreshTimerCount, 3000);

        } else if (timerEvent === events.SHORT_BREAK_START && realState === states.IDLE) {
            addLogEvent(events.SHORT_BREAK_START, "Short break started");
            realState = states.SHORT_BREAK_RUNNING;
            startUp(parseInt(props.shortBreak, 10));

        } else if (timerEvent === events.LONG_BREAK_START && realState === states.IDLE) {
            addLogEvent(events.LONG_BREAK_START, "Long break started");
            realState = states.LONG_BREAK_RUNNING;
            startUp(parseInt(props.longBreak, 10));

        } else if (timerEvent === events.COMPLETE && realState === states.SHORT_BREAK_RUNNING) {
            addLogEvent(events.SHORT_BREAK_COMPLETE, "Short break complete");
            realState = states.IDLE;
            notifyComplete("The break is over.");

        } else if (timerEvent === events.COMPLETE && realState === states.LONG_BREAK_RUNNING) {
            addLogEvent(events.LONG_BREAK_COMPLETE, "Long break complete");
            realState = states.IDLE;
            notifyComplete("The break is over.");

        } else if (timerEvent === events.STOP && realState === states.SHORT_BREAK_RUNNING) {
            addLogEvent(events.CANCEL, "Short break cancelled");
            realState = states.IDLE;
            cancel();

        } else if (timerEvent === events.STOP && realState === states.LONG_BREAK_RUNNING) {
            addLogEvent(events.CANCEL, "Long break cancelled");
            realState = states.IDLE;
            cancel();
        }

        updateGUI(minutes());
    } catch (ex) {
        error(ex);
    }
}

function startUp(m: any) {
    try {
        mezzoraMinutes = m;
        elapsedFiveMinutePeriods = 0;
        millisAtStart = Date.now();
        pauses = [];
        // if (props.tick) {
        // audioTick.play();

        // audioTick.load();
        // setTimeout(delayPlay, 1000);
        // }
        setTimeout(updateClock, 1000);

        setClockColor(props.timerColor);
    } catch (ex) {
        error(ex);
    }
}

function pause() {
    audioTick.value.pause();
    startPause = Date.now();
    setClockColor("gray");
}

function resume() {
    // if (props.tick) {
    //   setTimeout(delayPlay, 1000);
    // }
    setClockColor(props.timerColor);
    pauses.push(Date.now() - startPause);
    startPause = 0;
    setTimeout(updateClock, 1000);
}

function cancel() {
    audioTick.value.pause();
    // minutes = 0;
    elapsedFiveMinutePeriods = 0;
    pauses = [];
    setClockColor(props.timerColor);
    paintTriangle(1.0);
}

function addLogEvent(eventType: string, desc: string) {
    try {
        let me: MezzoEvent = {
            rowId: 0,
            eventTimestamp: new Date().getTime(),
            description: desc,
            eventType: eventType
        }
        window.api.save(me)
    } catch (ex) {
        error(ex);
    }
}

function toggleRunningIndicator() {
    paintTriangle((millis / 1000) % 2 === 0 ? 1.0 : 0.7);
}

function notifyComplete(msg: string) {
    if (props.notification) {
        // TODO - put useSpeech on options if it works in windows
        if (false /*props.useSpeech*/) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
        } else {
            new Notification("Mezzo", {body: msg});
        }
    }
}

function volume() {
    vol = vol < 0.1 ? 1.0 : vol - 0.3333;
    audioTick.value.volume = vol;
    audioGong.value.volume = vol;
    audioExtraGong.value.volume = vol;
    audioAlarm.value.volume = vol;
}

function updateGUI(mins: number) {

    const canvas = document.getElementById("mezzcanvas") as any;
    const context = canvas.getContext("2d");
    canvas.width = canvas.width;
    context.fillStyle = "black";
    context.beginPath();
    context.moveTo(0, 0);
    context.fillRect(0, 0, canvas.width, 8);
    context.closePath();
    context.fill();
    context.strokeStyle = "white";
    context.fillStyle = "white";
    context.font = isWindows() ? "bold 38pt Arial" : "38pt Helvetica";
    context.textAlign = "center";
    context.beginPath();
    const deltax = canvas.width / 20;

    for (let i = 0; i <= 19; i++) {
        const len = lengthOfTickMark(i, mins);
        context.fillRect(i * deltax, 20, 2, len - 5);
        if (len === 60) {
            context.fillText(tickTime(i, mins) + "", deltax * i, 125);
        }
    }
    context.closePath();
    context.stroke();
}

function setClockColor(c: string) {
    clockStyles.value["background-color"] = c
}

function stepVolume() {
    volume();
    paintVolume();
}

function paintVolume() {
    const timerColor = props.timerColor;
    const radius = vol * 60 + 100;
    const canvasVolume = document.getElementById("volume-control") as any;
    const contextVolume = canvasVolume.getContext("2d");

    // Erase the area
    contextVolume.fillStyle = "black";
    contextVolume.beginPath();
    contextVolume.fillRect(0, 0, 200, 200);
    contextVolume.closePath();
    contextVolume.fill();

    // Draw the bottom left small quarter circle
    contextVolume.fillStyle = Math.round(radius) === 100 ? timerColor : "white";
    contextVolume.beginPath();
    contextVolume.arc(0, 200, 100, 0, Math.PI / 2.0, true);
    contextVolume.closePath();
    contextVolume.fill();

    // Draw the outer ring
    contextVolume.strokeStyle = Math.round(radius) === 100 ? timerColor : "white";
    contextVolume.beginPath();
    contextVolume.lineWidth = 20;
    contextVolume.arc(0, 200, radius, 0, Math.PI / 2.0, true);
    contextVolume.closePath();
    contextVolume.stroke();
}

function minutes(): number {
    if (realState === states.IDLE) {
        return 0;
    }
    const ellapsed = ellapsedTime(millisAtStart, Date.now(), pausedTime(pauses));
    return Math.round(mezzoraMinutes - (ellapsed / 60000));
}

function isWindows() {
    return navigator.appVersion.indexOf("Win") !== -1;
}

async function refreshTimerCount() {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 99);

        let period = {startkey: start.getTime(), endkey: end.getTime()};

        completedCount.value = await window.api.completedCount(period);

    } catch (ex) {
        error(ex);
    }
}

function viewLog() {
    window.api.viewLog()
}

function menu() {
    if (realState === states.RUNNING) {
        addLogEvent(events.PAUSE, "Pause");
        realState = states.PAUSED;
        pause();
    }
    emitter.emit('currentView', {view: 'timerMenuComponent'});
}

</script>

<style scoped>
#timer-front {
    background-color: black;
    position: absolute;
    width: 100%;
    height: 100%;
}

#mezzora {
    position: absolute;
    left: 10%;
    right: 10%;
    top: 8%;
    height: 80%;
}

#clock {
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    height: 79%;
    border-top-left-radius: 200px;
    border-top-right-radius: 200px;
    background-color: v-bind(clockStyles ['background-color']);
    font-weight: v-bind(clockStyles ['font-weight']);
    text-shadow: v-bind(clockStyles ['text-shadow']);
}

#triangle {
    position: absolute;
    bottom: 32%;
    left: 45%;
    right: 45%;
    width: 10%;
    height: 10%;
    opacity: v-bind(triangleOpacity);
}

#mezzcanvas {
    position: absolute;
    bottom: 0%;
    left: 0px;
    width: 100%;
    height: 30%;
    background-color: v-bind(mezzcanvasBackground);
}

#start-stop, #pause-resume, #short-break, #long-break {
    position: absolute;
    height: 100%;
    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #858585), color-stop(50%, #a1a1a1), color-stop(51%, #989898), color-stop(100%, #c6c6c6));
}

#middle-buttons {
    position: absolute;
    bottom: 0px;
    height: 20%;
    width: 100%;
}

#start-stop {
    left: 0px;
    width: 44.5%;
    border-bottom-left-radius: 20px;
}

#pause-resume {
    right: 0px;
    width: 44.5%;
    border-bottom-right-radius: 20px;
}

#play-button:hover, #stop-button:hover {
    padding-top: 1px;
    padding-left: 1px;
}

.play-pause {
    width: 35%;
    height: 100%;
    margin: auto;
}

#short-break {
    top: 0px;
    height: 40%;
    left: 45%;
    right: 45%;
}

#long-break {
    bottom: 0px;
    height: 60%;
    left: 45%;
    right: 45%;
}

#volume-control {
    position: absolute;
    bottom: 7px;
    left: 5px;
    width: 20px;
    height: 20px;
    -webkit-user-select: none;
    user-select: none;
}

#log-button {
    position: absolute;
    bottom: 0px;
    left: 40%;
    width: 20%;
    text-align: left;
}

#log-button img {
    width: 20px;
    height: 20px;
}

#refresh-button {
    position: absolute;
    bottom: 0px;
    right: 40%;
    text-align: right;
}

#refresh-button img {
    width: 22px;
    height: 22px;
}

#menu-button {
    position: absolute;
    bottom: 7px;
    right: 7px;
    background-color: black;
    color: white;
    font-size: 18pt;
}

#completed-counter {
    position: absolute;
    top: 0px;
    right: 10px;
    font-size: 12pt;
    color: white;
    text-align: center;
    vertical-align: middle;
}

.center {
    text-align: center;
}

</style>
