/*
*  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
*/

<template>
    <div>
        <audio id="audio-tick" src="../ogg/ticktock.ogg"></audio>
        <audio id="audio-gong" src="../ogg/gong.ogg"></audio>
        <audio id="audio-extra-gong" src="../ogg/extra-gong.ogg"></audio>
        <audio id="audio-alarm" src="../ogg/low-gong.ogg"></audio>

<!--        &lt;!&ndash; This enables jquery to work &ndash;&gt;-->
<!--        <script>if (typeof module === 'object') {-->
<!--            window.module = module;-->
<!--            module = undefined;-->
<!--        }</script>-->

        <div>
            <div id="completed-counter" title="Completed"></div>
        </div>

        <div id="mezzora">
            <div id="clock">
                <canvas id="triangle"></canvas>
                <canvas id="mezzcanvas"></canvas>
            </div>
            <div id="middle-buttons">
                <div id="start-stop" v-prompt="" class="center"><img id="play-button" src="../images/play-pause-gray.png"
                                                         class="play-pause" @click="startPauseResume"
                                                         @mouseenter="buttonIn('start')"
                                                         @mouseleave="buttonOut('start')" title="Start/Pause"/>
                </div>
                <div id="short-break" @click="startShortBreak" title="Short Break"></div>
                <div id="long-break" @click="startLongBreak" title="Long Break"></div>
                <div id="pause-resume" class="center"><img id="stop-button" src="../images/stop-gray.png"
                                                           class="play-pause" @click="stop"
                                                           @mouseenter="buttonIn('stop')"
                                                           @mouseleave="buttonOut('stop')" title="Stop"/></div>
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

<script>
    const $ = require("jquery")
    import { EventBus } from '@/event-bus';
    const timerutil = require("../util/timerutil");
    const {MezzoraEvent} = require("../domain/mezzoraevent");
    const {events, states, defaults} = require("../util/mzConstants");

    let globalState = "IDLE";

    let realState = states.IDLE;
    let mezzoraMinutes = 0;
    let millis = 0;
    let millisAtStart = 0;
    let startPause = 0;
    let pauses = [];
    let elapsedFiveMinutePeriods = 0;
    const props = {};
    let taskDescription = null;
    let needGong = true;
    let vol = 1.0;

    export default {
        data() {
            return {
                audioTick: null,
                audioGong: null,
                audioExtraGong: null,
                audioAlarm: null,
                triangle: null
            };
        },
        mounted: function () {
            try {
                this.initProps();

                this.audioTick = document.getElementById("audio-tick");
                this.audioGong = document.getElementById("audio-gong");
                this.audioExtraGong = document.getElementById("audio-extra-gong");
                this.audioAlarm = document.getElementById("audio-alarm");
                this.audioGong.addEventListener("ended", this.gongEnd, false);
                this.audioExtraGong.addEventListener("ended", this.extraGongEnd, false);

                this.triangle = document.getElementById("triangle");

                this.setThemeColor();
                this.paintTriangle(1.0);
                this.paintVolume();

                if (this.isWindows()) {
                    $("body").css("font-weight", "bold");
                    $("#clock").css("font-weight", "bold").css("text-shadow", "0px 1px 1px white");
                }
                this.updateGUI(this.minutes());
                this.audioTick.load();

                this.refreshTimerCount();
                //
                // ipcRenderer.on("cancelTask", () => {
                //     this.processEvent(events.STOP);
                // });

            } catch (ex) {
                this.error(ex);
            }
        },
        methods: {
            async startPauseResume() {
                const self = this;
                if (realState === states.IDLE) {
                    let desc = await window.api.promptDescription(taskDescription);
                    if (desc) {
                        taskDescription = desc;
                        self.processEvent(events.START);
                    }
                } else if (realState === states.RUNNING) {
                    this.processEvent(events.START);

                } else if (realState === states.PAUSED) {
                    this.processEvent(events.START);
                }
            },

            async stop() {
                const self = this;
                if (realState === states.RUNNING || realState === states.PAUSED) {
                    if (await window.api.confirmCancel()) {
                        self.processEvent(events.STOP);
                    }
                } else if (realState === states.SHORT_BREAK_RUNNING) {
                    this.processEvent(events.STOP);

                } else if (realState === states.LONG_BREAK_RUNNING) {
                    this.processEvent(events.STOP);
                }
            },

            startShortBreak() {
                if (realState === states.IDLE) {
                    this.processEvent(events.SHORT_BREAK_START);
                }
            },

            startLongBreak() {
                if (realState === states.IDLE) {
                    this.processEvent(events.LONG_BREAK_START);
                }
            },

            paintTriangle(opacity) {

                const contextTriangle = this.triangle.getContext("2d");
                contextTriangle.fillStyle = "white";
                contextTriangle.beginPath();
                contextTriangle.moveTo(0, 0);
                contextTriangle.lineTo(this.triangle.width, 0);
                contextTriangle.lineTo(this.triangle.width / 2, this.triangle.height);
                contextTriangle.lineTo(0, 0);
                contextTriangle.closePath();
                contextTriangle.fill();
                $("#triangle").css("opacity", opacity);
            },

            error(doc) {
                console.log(doc);
                window.api.error(doc)
            },

            updateClock() {

                // // TODO - is this needed?
                if (realState !== states.RUNNING && realState !== states.SHORT_BREAK_RUNNING && realState !== states.LONG_BREAK_RUNNING) {
                    return;
                }

                const ellapsed = timerutil.ellapsedTime(millisAtStart, Date.now(), timerutil.pausedTime(pauses));
                const remaining = Math.round(mezzoraMinutes * 60000 - ellapsed);
                const remainingSeconds = Math.round(remaining / 1000);

                // console.log("remainingSeconds", remainingSeconds % 2);

                if (remainingSeconds % 2 === 0) {
                    if ("true" === props.tick) {
                        this.audioTick.play();
                    }
                }

                millis += 1000;

                this.toggleRunningIndicator();

                if (millis >= 60000) {
                    const mins = this.minutes();
                    millis = 0;
                    this.updateGUI(mins);
                    if (mins % 5 === 0 && mins !== 0) {
                        if (needGong) {
                            needGong = false;
                            if (props.gong === "true") {
                                this.playGong(elapsedFiveMinutePeriods);
                                elapsedFiveMinutePeriods++;
                            }
                        }
                    } else {
                        needGong = true;
                    }
                }

                if (remaining <= 0) {
                    // realState = states.IDLE;
                    this.processEvent(events.COMPLETE);
                    // audioTick.pause();
                    pauses = [];
                    if ("true" === props.alarm) {
                        this.audioAlarm.play();
                    }
                    this.setInfoColor("white");
                } else {
                    setTimeout(this.updateClock, timerutil.nextTimeout(ellapsed));
                }
            },

            playGong(extraTimes) {
                this.audioExtraGong.times = extraTimes;
                this.audioGong.play();
            },

            gongEnd() {
                this.playExtraGong();
            },

            playExtraGong() {
                if (this.audioExtraGong.times > 0) {
                    this.audioExtraGong.play();
                }
            },

            extraGongEnd() {
                this.audioExtraGong.times--;
                this.playExtraGong();
            },

            processEvent(timerEvent) {

                console.log("timerEvent", timerEvent, realState);
                try {
                    millis = 0;
                    if (timerEvent === events.START && realState === states.IDLE) {
                        this.addLogEvent(events.START, taskDescription);
                        realState = states.RUNNING;
                        this.startUp(props.minutes);

                    } else if (timerEvent === events.START && realState === states.RUNNING) {
                        this.addLogEvent(events.PAUSE, "Pause");
                        realState = states.PAUSED;
                        this.pause();

                    } else if (timerEvent === events.START && realState === states.PAUSED) {
                        this.addLogEvent(events.RESUME, "Resume");
                        realState = states.RUNNING;
                        this.resume();

                    } else if (timerEvent === events.STOP && realState === states.RUNNING || realState === states.PAUSED) {
                        this.addLogEvent(events.CANCEL, taskDescription);
                        realState = states.IDLE;
                        this.cancel();

                    } else if (timerEvent === events.COMPLETE && realState === states.RUNNING) {
                        this.addLogEvent(events.COMPLETE, taskDescription);
                        realState = states.IDLE;
                        this.notifyComplete("The mezzo is complete.");

                        // TODO - Timeout needed due to database latency. Is there a better way?
                        setTimeout(this.refreshTimerCount, 3000);

                    } else if (timerEvent === events.SHORT_BREAK_START && realState === states.IDLE) {
                        this.addLogEvent(events.SHORT_BREAK_START, "Short break started");
                        realState = states.SHORT_BREAK_RUNNING;
                        this.startUp(parseInt(props.shortBreak, 10));

                    } else if (timerEvent === events.LONG_BREAK_START && realState === states.IDLE) {
                        this.addLogEvent(events.LONG_BREAK_START, "Long break started");
                        realState = states.LONG_BREAK_RUNNING;
                        this.startUp(parseInt(props.longBreak, 10));

                    } else if (timerEvent === events.COMPLETE && realState === states.SHORT_BREAK_RUNNING) {
                        this.addLogEvent(events.SHORT_BREAK_COMPLETE, "Short break complete");
                        realState = states.IDLE;
                        this.notifyComplete("The break is over.");

                    } else if (timerEvent === events.COMPLETE && realState === states.LONG_BREAK_RUNNING) {
                        this.addLogEvent(events.LONG_BREAK_COMPLETE, "Long break complete");
                        realState = states.IDLE;
                        this.notifyComplete("The break is over.");

                    } else if (timerEvent === events.STOP && realState === states.SHORT_BREAK_RUNNING) {
                        this.addLogEvent(events.CANCEL, "Short break cancelled");
                        realState = states.IDLE;
                        this.cancel();

                    } else if (timerEvent === events.STOP && realState === states.LONG_BREAK_RUNNING) {
                        this.addLogEvent(events.CANCEL, "Long break cancelled");
                        realState = states.IDLE;
                        this.cancel();
                    }

                    globalState = realState;

                    this.updateGUI(this.minutes());
                } catch (ex) {
                    this.error(ex);
                }
            },

            startUp(m) {
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
                    setTimeout(this.updateClock, 1000);

                    this.setClockColor(props.timerColor);
                    this.setInfoColor("white");
                } catch (ex) {
                    this.error(ex);
                }
            },

            pause() {
                this.audioTick.pause();
                startPause = Date.now();
                this.setClockColor("gray");
            },

            resume() {
                // if (props.tick) {
                //   setTimeout(delayPlay, 1000);
                // }
                this.setClockColor(props.timerColor);
                pauses.push(Date.now() - startPause);
                startPause = 0;
                setTimeout(this.updateClock, 1000);
            },

            cancel() {
                this.audioTick.pause();
                // minutes = 0;
                elapsedFiveMinutePeriods = 0;
                pauses = [];
                this.setClockColor(props.timerColor);
                this.paintTriangle(1.0);
            },

            addLogEvent(eventType, desc) {
                try {
                    let me = new MezzoraEvent(0, new Date().getTime(), desc, eventType);
                    window.api.save(me)
                } catch (ex) {
                    this.error(ex);
                }
            },

            toggleRunningIndicator() {
                this.paintTriangle((millis / 1000) % 2 === 0 ? 1.0 : 0.7);
            },

            notifyComplete(msg) {
                if (props.notification) {
                    if (props.useSpeech) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
                    } else {
                        new Notification("Mezzo", {body: msg});
                    }
                }
            },

            volume() {
                vol = vol < 0.1 ? 1.0 : vol - 0.3333;
                this.audioTick.volume = vol;
                this.audioGong.volume = vol;
                this.audioExtraGong.volume = vol;
                this.audioAlarm.volume = vol;
            },

            updateGUI(mins) {

                const canvas = document.getElementById("mezzcanvas");
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
                context.font = this.isWindows() ? "bold 38pt Arial" : "38pt Helvetica";
                context.textAlign = "center";
                context.beginPath();
                const deltax = canvas.width / 20;

                for (let i = 0; i <= 19; i++) {
                    const len = timerutil.lengthOfTickMark(i, mins);
                    context.fillRect(i * deltax, 20, 2, len - 5);
                    if (len === 60) {
                        context.fillText(timerutil.tickTime(i, mins) + "", deltax * i, 125);
                    }
                }
                context.closePath();
                context.stroke();
            },

            setClockColor(c) {
                $("#clock").css("background-color", c);
            },

            setInfoColor(c) {
                $("#info-button").css("color", c);
            },

            stepVolume() {
                this.volume();
                this.paintVolume();
            },

            paintVolume() {
                const timerColor = props.timerColor;
                const radius = vol * 60 + 100;
                const canvasVolume = document.getElementById("volume-control");
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
            },

            setThemeColor() {
                this.setClockColor(props.timerColor);
                $("#mezzcanvas").css("background-color", props.timerColor);
            },

            buttonIn(btn) {
                if (btn === "start") {
                    this.moveButton("#play-button", 1);
                } else {
                    this.moveButton("#stop-button", 1);
                }
            },

            buttonOut(btn) {
                if (btn === "start") {
                    this.moveButton("#play-button", -1);
                } else {
                    this.moveButton("#stop-button", -1);
                }
            },

            moveButton(target, pix) {
                const offset = $(target).offset();
                offset.top = offset.top + pix;
                $(target).offset(offset);
            },

            minutes() {
                if (realState === states.IDLE) {
                    return 0;
                }
                const ellapsed = timerutil.ellapsedTime(millisAtStart, Date.now(), timerutil.pausedTime(pauses));
                return Math.round(mezzoraMinutes - (ellapsed / 60000));
            },

            isWindows() {
                navigator.appVersion.indexOf("Win") !== -1;
            },

            initProps() {
                props.minutes = localStorage["minutes"] !== undefined ? localStorage["minutes"] : defaults.DEFAULT_BLOCK;
                props.longBreak = localStorage["longbreak"] !== undefined ? localStorage["longbreak"] : defaults.DEFAULT_LONG_BREAK;
                props.shortBreak = localStorage["shortbreak"] !== undefined ? localStorage["shortbreak"] : defaults.DEFAULT_SHORT_BREAK;
                props.tick = localStorage["tick"] !== undefined ? localStorage["tick"] : "sdfg";
                props.gong = localStorage["gong"] !== undefined ? localStorage["gong"] : "true";
                props.alarm = localStorage["alarm"] !== undefined ? localStorage["alarm"] : "true";
                props.notification = localStorage["notification"] !== undefined ? localStorage["notification"] : "true";
                props.timerColor = localStorage["timercolor"] !== undefined ? localStorage["timercolor"] : defaults.DEFAULT_CLOCK_COLOR;
            },

            refreshTimerCount() {
                try {
                    const start = new Date();
                    start.setHours(0, 0, 0, 0);

                    const end = new Date();
                    end.setHours(23, 59, 59, 99);

                    let period = {startkey: start.getTime(), endkey: end.getTime()};
                    window.api.findAll(period)
                        .then((items) => {
                            const c = items.filter(e => e.eventType === "COMPLETE").length;
                            $("#completed-counter").text(c === 0 ? "" : c);
                        })
                        .catch(err => {
                            this.error(err)
                        });
                } catch (ex) {
                    this.error(ex);
                }
            },

            viewLog: function () {
                window.api.viewLog()
            },

            menu: function () {
                EventBus.$emit("currentView", "timerMenuComponent");
            }
        }
    }
</script>

<style scoped>
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
    }
    #triangle {
        position: absolute;
        bottom: 32%;
        left: 45%;
        right: 45%;
        width: 10%;
        height: 10%;
    }

    #mezzcanvas {
        position: absolute;
        bottom: 0%;
        left: 0px;
        width: 100%;
        height: 30%;
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
