/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

// const ipcRenderer = require("electron").ipcRenderer;
const timerutil = require("../util/timerutil");
const {MezzoraEvent} = require("../domain/mezzoraevent");
const {events, states, defaults} = require("../util/mzConstants");

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

const timerFrontComponent = {
    template: `
        <div>
            <div>
                <div id="completed-counter" title="Completed"></div>
            </div>

            <div id="mezzora">
                <div id="clock">
                    <canvas id="triangle"></canvas>
                    <canvas id="mezzcanvas"></canvas>
                </div>
                <div id="middle-buttons">
                    <div id="start-stop" class="center"><img id="play-button" src="../images/play-pause-gray.png"
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
    `,
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

            ipcRenderer.on("cancelTask", () => {
                this.processEvent(events.STOP);
            });

        } catch (ex) {
            this.error(ex);
        }
    },
    methods: {
        startPauseResume() {
            const self = this;
            if (realState === states.IDLE) {
                return jPrompt("Task description:", taskDescription, "Prompt Dialog", function (desc) {
                    if (desc) {
                        taskDescription = desc;
                        self.processEvent(events.START);
                    }
                });
            } else if (realState === states.RUNNING) {
                this.processEvent(events.START);

            } else if (realState === states.PAUSED) {
                this.processEvent(events.START);
            }
        },

        stop() {
            const self = this;
            if (realState === states.RUNNING || realState === states.PAUSED) {
                return jConfirm("Are you sure you want to cancel?", "Confirm Cancel", function (result) {
                    self.error("confirm=" + result);
                    if (result) {
                        self.processEvent(events.STOP);
                    }
                });
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
            ipcRenderer.send("error", doc);
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
                ipcRenderer.send("save", me)
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
                ipcRenderer.invoke("findAll", period)
                    .then((items) => {
                        const c = items.filter(e => e.eventType === "COMPLETE").length;
                        $("#completed-counter").text(c === 0 ? "" : c);
                    })
                    .catch(err => this.error(err));
            } catch (ex) {
                this.error(ex);
            }
        },

        viewLog: function () {
            ipcRenderer.send("viewLog");
        },

        menu: function () {
            bus.$emit("currentView", "timerMenuComponent");
        }
    }
}
