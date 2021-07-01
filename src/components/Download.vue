/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

<template>
    <div id="app">
        Mandatory update available. Please download and install.<br>
        Thank you!<br><br>
        <div class="center">
            <button class="button" @click="download">Go to download site</button>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            download() {
                window.api.download();
            }
        }
    }
</script>

<style>
    /*div {*/
    /*    margin: 1em;*/
    /*    text-align: center;*/
    /*}*/
</style>

