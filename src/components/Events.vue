<template>
  <div id="events">
    Time Period:
    <select
      id="time-period"
      v-model="timePeriod"
      @change="selectPeriod"
    >
      <option value="today">
        Today
      </option>
      <option value="week">
        This Week
      </option>
      <option value="month">
        This Month
      </option>
      <option value="yesterday">
        Yesterday
      </option>
      <option value="lastweek">
        Last Week
      </option>
      <option value="lastmonth">
        Last Month
      </option>
    </select>

    <span id="completed-checkbox"><input
      v-model="completedOnly"
      type="checkbox"
    >Only include Completed</span>

    <button
      id="print-event"
      @click="print"
    >
      Printable Page
    </button>

    <br>
    <br>

    <div class="center">
      Completed Mezzos: {{ totalCount }}
    </div>

    <div id="completed-div">
      <table id="completed-table">
        <tr
          v-for="(sr, index) in summaryRows"
          :key="index"
        >
          <td width="70%">
            {{ sr.taskDescription }}
          </td>
          <td width="30%">
            {{ sr.count }}
          </td>
        </tr>
      </table>
    </div>

    <div class="center">
      Events
    </div>

    <div id="log-div">
      <table id="log-table">
        <tr
          v-for="(d, index) in docs"
          :key="index"
        >
          <td width="30%">
            {{ format(d.eventTimestamp) }}
          </td>
          <td width="45%">
            {{ d.description }}
          </td>
          <td
            width="20%"
            :style="{ color: textColor(d) }"
          >
            {{ d.eventType }}
          </td>
          <td width="5%">
            <button @click="editEvent(d)">
              edit
            </button>
          </td>
          <td width="5%">
            <button @click="deleteEvent(d)">
              del
            </button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>

import {dateFormat, summary, getPeriod} from "../util/util";
import {computed, ref, onMounted, watch} from "vue";

const docs = ref([] as MezzoEvent[]);
const timePeriod = ref("today");
const completedOnly = ref(false);

const summaryRows = computed(function (): { taskDescription: string, count: string }[] {
    return summary(docs.value);
});

const totalCount = computed(function (): number {
    return docs.value.filter((e: MezzoEvent) => e.eventType === "COMPLETE").length;
});

const print = function (): void {
    const queryOptions:QueryOptions = {
        period: getPeriod(timePeriod.value, new Date()),
        completedOnly: completedOnly.value
    };
    window.api.print(queryOptions);
};

const selectPeriod = () => refreshLog();

const textColor = function (e: MezzoEvent): string {
    return (e.eventType === "COMPLETE") ? "red" : "black";
};

const deleteEvent = async function (e: MezzoEvent) {
    if (await window.api.deleteTask(e.rowId, e.description)) {
        refreshLog();
    }
};

const editEvent = async function (e: MezzoEvent) {
    const desc = await window.api.changeDescription(e.description);
    if (desc) {
        e.description = desc;
        window.api.update(e);
    }
};

const refreshLog = function () {
    const queryOptions:QueryOptions = {
        period: getPeriod(timePeriod.value, new Date()),
        completedOnly: completedOnly.value
    };
    window.api.findAll(queryOptions)
        .then((items: MezzoEvent[]) => {
            docs.value = items;
        })
        .catch((err: any) => {
            window.api.log(err);
        });
};

const format = (ts:number) => dateFormat(ts);

onMounted(() => {
    refreshLog();

    window.api.register("refresh", () => {
        refreshLog();
    });
});

watch(completedOnly, (newValue, _) => refreshLog());

</script>

<style>

    #events {
        font-family: Helvetica;
        font-size: 10pt;
        width: 90%;
        height: 90%;
        margin-left: auto;
        margin-right: auto;
        margin-top: 1em;
        margin-bottom: 1em;
    }

    #completed-div, #log-div {
        width: 100%;
        height: 40%;
        margin-bottom: 1em;
        overflow: auto;
        border: 1px solid #DDDDDD;
        box-shadow: 2px 2px 2px #DDDDDD;
    }

    #completed-table, #log-table  {
        width: 100%;
    }

    #completed-checkbox {
        margin-left: 1em;
        margin-right: 1em;
    }

    tr:nth-child(even) {
        background: #FFF;
    }

    tr:nth-child(odd) {
        background: #EEE;
    }

    td {
        vertical-align: top;
    }

    .center {
        text-align: center;
    }
</style>
