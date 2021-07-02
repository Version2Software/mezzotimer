<template>
    <div id="timer">
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
