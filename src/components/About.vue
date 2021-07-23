<template>
    <div id="about">
        <h1>Mezzo Timer</h1>
        <h2>What can <span class="you">you</span> do in thirty minutes?</h2>
        <br>
        <p>Version {{version}}</p>
        <p v-if="version !== availableVersion" class="you">New Version Available: {{availableVersion}}<br><br>
            <button @click="download()">Go to download site</button>
        </p>
        <footer>
            Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
        </footer>
    </div>
</template>
<script lang="ts">
const mrp = require("minimal-request-promise");

import {defineComponent, ref, onMounted} from 'vue'

export default defineComponent({
    setup() {
        const version = ref("3.0.0");
        const availableVersion = ref(null as string | null);

        onMounted(() => {
            mrp.get("https://mezzotimer.com/version.json", {}).then((response: any) => {
                let body = JSON.parse(response.body);
                availableVersion.value = body.version;
            }).catch((err: any) => {
                console.error(err);
                availableVersion.value = "Could not check for available version.";
            });
        });

        return {
            version,
            availableVersion,
            download: () => window.api.download()
        }
    }
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
