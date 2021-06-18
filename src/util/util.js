/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const _ = require("lodash");

const ONE_DAY = 24 * 60 * 60 * 1000;

const summary = function (events) {

    const summaryRows = [];
    const descArray = [];

    events.forEach(e => {
        if (e.eventType === "COMPLETE") {

            let isPresent = false;
            descArray.forEach(d => {
                if (d === e.description) {
                    isPresent = true;
                }
            });
            if (!isPresent) {
                descArray.push(e.description);
            }
        }
    });

    descArray.forEach(d => {
        const count = _.filter(events, (e) => {
            if (e.eventType === "COMPLETE" && e.description === d) {
                return e;
            }
        }).length;

        summaryRows.push({
            taskDescription: d ? d : "No description",
            count: "X ".repeat(count)
        });
    });

    return summaryRows;
};

const getPeriod = (timePeriod, today) => {

    let start = new Date(today);
    start.setHours(0, 0, 0, 0);

    let end = new Date(today);
    end.setHours(23, 59, 59, 99);

    let month = start.getMonth();
    let year = start.getFullYear();

    switch (timePeriod) {
    case "today":
        break;
    case "yesterday":
        start = new Date(start.getTime() - ONE_DAY);
        end = new Date(end.getTime() - ONE_DAY);
        break;
    case "week":
        start = new Date(start.getTime() - start.getDay() * ONE_DAY);
        break;
    case "month":
        start = new Date(year, month, 1);
        start.setHours(0, 0, 0, 0);
        break;
    case "lastweek":
        start = new Date(start.getTime() - start.getDay() * ONE_DAY - 7 * ONE_DAY);
        end = new Date(start.getTime() - start.getDay() * ONE_DAY + 6 * ONE_DAY);
        end.setHours(23, 59, 59, 99);
        break;
    case "lastmonth":

        if (start.getMonth() === 0) {
            month = 11;
            year = year - 1;
        } else {
            month = month - 1;
        }

        start = new Date(year, month, 1);
        start.setHours(0, 0, 0, 0);

        end = new Date(year, month + 1, 0);
        end.setHours(23, 59, 59, 99);
        break;
    }

    return {startkey: start.getTime(), endkey: end.getTime()};
};

module.exports.summary = summary;
module.exports.getPeriod = getPeriod;
