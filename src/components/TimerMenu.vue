<template>
    <div id="timer-menu" class="defaultCursor">
        <table>
            <tr class="menuitem">
                <td @click="options">Options</td>
            </tr>
            <tr class="menuitem">
                <td @click="info">Help</td>
            </tr>
            <tr class="menuitem">
                <td @click="about">About</td>
            </tr>
        </table>
        <!--<div id="feedback-button"><img src="images/email_mail_post_letter_stamp.png" title="Feedback"/></div>-->
        <div class="done-button" @click="done"><img src="../images/arrow_left.png" title="Back"/></div>
    </div>
</template>

<script>
    export default {
        methods: {
            done: function () {
                this.emitter.emit('currentView', { view: 'timerFrontComponent' })
            },
            options: function () {
                this.emitter.emit('currentView', { view: 'optionsComponent' })
            },
            info: function () {
                window.api.info()
            },
            about: function () {
                window.api.about()
            }
        }
    }
</script>
<style scoped>
    #timer-menu {
        position: absolute;
        /*display: none;*/
        height: 100%;
        width: 100%;
        background-color: black;
        color: white;
    }

    table {
        margin: 1em;
    }

    .menuitem {
        background-color: black;
    }

    .menuitem:hover {
        background-color: dodgerblue;
    }

    .defaultCursor {
        cursor: default;
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
</style>
