<template>
    <component v-bind:is="currentView" :readonly="readonly"></component>
</template>

<script>
    import timerComponent from './Timer.vue';
    import eventsComponent from './Events.vue';
    import printComponent from './Print.vue';
    import aboutComponent from './About.vue';
    import privacyComponent from './Privacy.vue';

    export default {
        data() {
            return {
                currentView: null
            };
        },
        mounted: function () {
            window.api.register('page', data => {
                if (data === 'about') {
                    this.currentView = aboutComponent
                } else if (data === 'timer') {
                    this.currentView = timerComponent
                } else if (data === 'events') {
                    this.currentView = eventsComponent
                } else if (data === 'print') {
                    this.currentView = printComponent
                } else if (data === 'privacy') {
                    this.readonly = false
                    this.currentView = privacyComponent
                } else if (data === 'privacy-readonly') {
                    this.readonly = true
                    this.currentView = privacyComponent
                }
            })
        },
        components: {
            timerComponent,
            aboutComponent,
            eventsComponent,
            printComponent,
            privacyComponent
        }
    }
</script>

<style>
body, html, #app {
    /*background-color: white;*/
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
}
</style>
