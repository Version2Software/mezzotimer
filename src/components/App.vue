<template>
    <component v-bind:is="currentView" :readOnly="readOnly"></component>
</template>

<script lang="ts">
    import {defineComponent, ref, onMounted} from 'vue'
    import {Component} from "@vue/runtime-core";

    import timerComponent from './Timer.vue';
    import eventsComponent from './Events.vue';
    import printComponent from './Print.vue';
    import aboutComponent from './About.vue';
    import privacyComponent from './Privacy.vue';

    export default defineComponent({
        setup() {
            const readOnly = ref(false);  // Used by privacy windows
            const currentView = ref(null as Component);

            onMounted(() => {
              window.api.register('page', (pageName:string) => {
                if (pageName === 'about') {
                  currentView.value = aboutComponent
                } else if (pageName === 'timer') {
                  currentView.value = timerComponent
                } else if (pageName === 'events') {
                  currentView.value = eventsComponent
                } else if (pageName === 'print') {
                  currentView.value = printComponent
                } else if (pageName === 'privacy') {
                  readOnly.value = false
                  currentView.value = privacyComponent
                } else if (pageName === 'privacy-readonly') {
                  readOnly.value = true
                  currentView.value = privacyComponent
                }
              })
            })
            return {
                readOnly,
                currentView
            };
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
