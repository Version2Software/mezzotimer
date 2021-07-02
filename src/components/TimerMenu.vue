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
    import mitt from 'mitt'
    window.mitt = window.mitt || new mitt()

    export default {
        methods: {
            done: function () {
                window.mitt.emit('currentView', { view: 'timerFrontComponent' })
            },
            options: function () {
                window.mitt.emit('currentView', { view: 'optionsComponent' })
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
        height: 94%;
        width: 94%;
        background-color: black;
        color: white;
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
        bottom: 0px;
        left: 0px;
    }

    .done-button img {
        width: 20px;
        height: 20px;
    }
</style>
