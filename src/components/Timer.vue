<template>
    <div id="timer">

<!--        <audio id="audio-tick" src="../ogg/ticktock.ogg"></audio>-->
<!--        <audio id="audio-gong" src="../ogg/gong.ogg"></audio>-->
<!--        <audio id="audio-extra-gong" src="../ogg/extra-gong.ogg"></audio>-->
<!--        <audio id="audio-alarm" src="../ogg/low-gong.ogg"></audio>-->

        <!-- This enables jquery to work -->
        <script>if (typeof module === 'object') {
            window.module = module;
            module = undefined;
        }</script>

<!--        <script src="../lib/jquery.min.js"></script>-->
<!--        <script src="../lib/jquery.alerts-1.1/jquery.alerts.js"></script>-->

<!--        <script src="../lib/axios/dist/axios.standalone.js"></script>-->
<!--        <script src="../lib/url-template/url-template.js"></script>-->

        <component v-bind:is="currentView"></component>
    </div>

</template>

<script>
    import downloadComponent from './Download.vue';
    import timerFrontComponent from './TimerFront.vue';
    import timerMenuComponent from './TimerMenu.vue';
    import optionsComponent from './Options.vue';

    import { EventBus } from '@/event-bus';

    export default {
        data() {
            return {
                currentView: timerFrontComponent
            };
        },
        mounted: function () {
            EventBus.$on("currentView", (view) => this.currentView = view);
        },
        components: {
            downloadComponent,
            timerFrontComponent,
            timerMenuComponent,
            optionsComponent
        }
    }
</script>

<style scoped>
    #timer {
        background-color: black;
        font-family: Helvetica;
        font-size: 12pt;
        width: 100%;
        height: 100%;
    }
</style>
