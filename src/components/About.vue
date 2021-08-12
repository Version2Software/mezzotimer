<template>
    <div id="about">
        <h1>Mezzo Timer</h1>
        <h2>What can <span class="you">you</span> do in thirty minutes?</h2>
        <br>
        <p>Version {{version}}</p>
        <p v-if="availableVersion === null" class="you">Could not check for available version.<br><br>
            <button @click="download()">Go to download site</button>
        </p>
        <p v-else-if="version !== availableVersion" class="you">New Version Available: {{availableVersion}}<br><br>
            <button @click="download()">Go to download site</button>
        </p>
        <p v-else>You are using the latest version.
        </p>
        <footer>
            Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
        </footer>
    </div>
</template>

<script lang="ts" setup>

import axios from 'axios';
import {ref, onMounted} from 'vue';

const version = ref("3.1.0");
const availableVersion = ref(null as string | null);

onMounted(() => {
    // Use ts to avoid any potential caching issues
    axios.get("https://mezzotimer.com/version.json?ts="+new Date().getTime())
        .then(response => availableVersion.value = response.data.version)
        .catch((err: any) => {
            console.error(err);
        });
});

</script>

<style scoped>
    #about {
        background-color: white;
        text-align: center;
        font-family: "Times New Roman";
        /*width: 90%;*/
        /*height: 90%;*/
        margin: 1em;
    }

    h1 {
        font-size: 16pt;
        /*margin-top: 2em;*/
    }

    h2 {
        font-family: "Arial";
        font-size: 12pt;
    }

    p {
        font-size: 12pt;
    }

    .you {
        color: red;
    }

    footer {
        font-size: 10pt;
        color: gray;
        bottom: 5px;
    }

    .center {
        text-align: center;
    }
</style>
