<template>
<div id="privacy">
    <article>
        <h1>Mezzo Task Timer<br>Privacy Policy</h1>
        <h2>Effective: June 16, 2021</h2>

        <p>Mezzo Task Timer is copyrighted by Version 2 Software, LLC. This software is open source and free to use, released under the Apache License 2.0.</p>

        <h2>Data Privacy</h2>

        <p>We do not collect or store any data from you. Your data is only kept on your desktop.</p>

        <h2>Contact Us</h2>

        <p>
            Version 2 Software, LLC<br>
            Denver, CO<br>
            E-Mail: mezzotimer@version2software.com<br>
        </p>

        <div v-if="!readonly">
            <input type="checkbox" id="checkbox" v-model="checked">I accept this privacy policy
            <button type="button"  :disabled="!checked" :class="[checked ? activeClass : disabledClass]" @click="accepted">Accept</button>
            <button type="button" class="secondary-button" @click="declined">Decline</button>
        </div>

    </article>
</div>
</template>

<script>

    export default {
        props: {
            readonly: false
        },
        data() {
            return {
                checked: false,
                activeClass: "button",
                disabledClass: "disabled-button"
            }
        },
        methods: {
            accepted: function () {
                window.api.accepted()
                // ipcRenderer.send("accepted");
            },
            declined: function () {
                window.api.exit()
                // ipcRenderer.send("exit");
            }
        }
    }
</script>

<style>
    #privacy {
        color: black;
        background: white;
        width: 100%;
    }
    h1 {
        text-align: center;
        margin-bottom: 2em;
    }
    article {
        margin: 2em;
        font-size: 1em;
    }

    footer {
        font-size: 10pt;
        color: gray;
        bottom: 5px;
    }

    .button {
        background-color: dodgerblue;
        border: none;
        color: white;
        padding: 5px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 20px;
        margin-top: 5px;
    }

    .disabled-button {
        background-color: gray;
        border: none;
        color: white;
        padding: 5px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 20px;
        margin-top: 5px;
    }

    .secondary-button {
        background-color: black;
        border: solid dodgerblue 2px;
        color: white;
        padding: 5px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 20px;
        margin-top: 5px;
    }
</style>
