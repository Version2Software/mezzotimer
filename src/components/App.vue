<template>
    <component v-bind:is="currentView" :readOnly="readOnly"></component>
</template>

<script lang="ts">
    import timerComponent from './Timer.vue';
    import eventsComponent from './Events.vue';
    import printComponent from './Print.vue';
    import aboutComponent from './About.vue';
    import privacyComponent from './Privacy.vue';
    import {defineComponent} from 'vue'
    import {Component} from "@vue/runtime-core";

    export default defineComponent({
        data() {
            return {
                readOnly: false, // Used by privacy windows
                currentView: null as Component
            };
        },
        mounted: function () {
            window.api.register('page', (pageName:string) => {
                if (pageName === 'about') {
                    this.currentView = aboutComponent
                } else if (pageName === 'timer') {
                    this.currentView = timerComponent
                } else if (pageName === 'events') {
                    this.currentView = eventsComponent
                } else if (pageName === 'print') {
                    this.currentView = printComponent
                } else if (pageName === 'privacy') {
                    this.readOnly = false
                    this.currentView = privacyComponent
                } else if (pageName === 'privacy-readonly') {
                    this.readOnly = true
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
    });
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
