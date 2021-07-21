<template>
    <div id="timer">
        <component v-bind:is="currentView"></component>
    </div>

</template>

<script lang="ts">
    import {defineComponent, ref, inject, onMounted} from 'vue';
    import downloadComponent from './Download.vue';
    import timerFrontComponent from './TimerFront.vue';
    import timerMenuComponent from './TimerMenu.vue';
    import optionsComponent from './Options.vue';
    import {Emitter} from "mitt";

    export default defineComponent({
        setup() {
            const emitter = inject("emitter") as Emitter<any>
            const currentView = ref(timerFrontComponent);

            onMounted(() => {
              emitter.on('currentView', (e:any) => currentView.value = e.view)
            });

            return {
                  currentView
            };
        },
        components: {
            downloadComponent,
            timerFrontComponent,
            timerMenuComponent,
            optionsComponent
        }
    });
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
