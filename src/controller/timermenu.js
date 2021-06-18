/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

// const {shell} = require('electron');

timerMenuComponent = Vue.component("menu-component", {
    template: `
        <div id="timer-menu" class="defaultCursor">
            <table>
                <tr class="menuitem"><td @click="options">Options</td></tr>
                <tr class="menuitem"><td @click="info">Help</td></tr>
                <tr class="menuitem"><td @click="about">About</td></tr>
            </table>
            <!--<div id="feedback-button"><img src="images/email_mail_post_letter_stamp.png" title="Feedback"/></div>-->
            <div class="done-button" @click="done"><img src="../images/arrow_left.png" title="Back"/></div>
        </div>
        `,
    methods: {
        done: function () {
            bus.$emit("currentView", "timerFrontComponent");
        },
        options: function () {
            bus.$emit("currentView", "optionsComponent");
        },
        info: function () {
            shell.openExternal("https://mezzotimer.com/help.html");
        },
        about: function () {
            ipcRenderer.send("about");
        }
    }
});

