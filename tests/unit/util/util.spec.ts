/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const {getPeriod, summary, dateFormat} = require("../../../src/util/util");

describe("summary", () => {
    test("empty events", () => {
        expect(summary([])).toEqual([]);
    });

    test("one event", () => {
        const events = [{description: "a", eventType: "COMPLETE"}];
        const result = [{taskDescription: "a", count: "X "}];

        expect(summary(events)).toEqual(result);
    });

    test("one complete event", () => {
        const events = [{description: "a", eventType: "START"}, {description: "a", eventType: "COMPLETE"}, {description: "a", eventType: "XYZ"}];
        const result = [{taskDescription: "a", count: "X "}];

        expect(summary(events)).toEqual(result);
    });

    test("two events", () => {

        const events = [{description: "a", eventType: "COMPLETE"}, {description: "a", eventType: "COMPLETE"}];
        const result = [{taskDescription: "a", count: "X X "}];

        expect(summary(events)).toEqual(result);
    });

    test("two events no description", () => {

        const events = [{eventType: "COMPLETE"}, {eventType: "COMPLETE"}];
        const result = [{taskDescription: "No description", count: "X X "}];

        expect(summary(events)).toEqual(result);
    });

    test("two different events", () => {

        const events = [{description: "a", eventType: "COMPLETE"}, {description: "b", eventType: "COMPLETE"}];
        const result = [{taskDescription: "a", count: "X "}, {taskDescription: "b", count: "X "}];

        expect(summary(events)).toEqual(result);
    });
});

describe("getPeriod", () => {

    const today = new Date();

    test("today", () => {

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 99);

        const period = getPeriod("today", today);

        expect(period.startkey).toEqual(start.getTime());
        expect(period.endkey).toEqual(end.getTime());
    });

    test("yesterday", () => {

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 1);

        const end = new Date();
        end.setHours(23, 59, 59, 99);
        end.setDate(end.getDate() - 1);

        const period = getPeriod("yesterday", today);

        expect(period.startkey).toEqual(start.getTime());
        expect(period.endkey).toEqual(end.getTime());
    });

    test("week", () => {

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - start.getDay());

        const end = new Date();
        end.setHours(23, 59, 59, 99);

        const period = getPeriod("week", today);

        expect(period.startkey).toEqual(start.getTime());
        expect(period.endkey).toEqual(end.getTime());
    });

    test("lastweek", () => {

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - start.getDay() - 7);

        const end = new Date();
        end.setHours(23, 59, 59, 99);
        end.setDate(end.getDate() - end.getDay() - 1);

        const period = getPeriod("lastweek", today);

        expect(period.startkey).toEqual(start.getTime());
        expect(period.endkey).toEqual(end.getTime());
    });

    test("month", () => {

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(1);

        const end = new Date();
        end.setHours(23, 59, 59, 99);

        const period = getPeriod("month", today);

        expect(period.startkey).toEqual(start.getTime());
        expect(period.endkey).toEqual(end.getTime());
    });

    test("lastmonth", () => {

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(-1);
        start.setDate(1);

        const end = new Date();
        end.setHours(23, 59, 59, 99);
        end.setDate(0);

        const period = getPeriod("lastmonth", today);

        expect(period.startkey).toEqual(start.getTime());
        expect(period.endkey).toEqual(end.getTime());
    });

    test("lastmonth of last year", () => {

        const todayJanuary = new Date(2018, 0, 15);

        const start = new Date(todayJanuary);
        start.setHours(0, 0, 0, 0);
        start.setDate(-1);  // Move to Dec 31th, the -1st day of the month
        start.setDate(1);   // Now that we are in Dec, move to Dec 1st

        const end = new Date(todayJanuary);
        end.setHours(23, 59, 59, 99);
        end.setDate(0); // Move to the beginning of Jan

        const period = getPeriod("lastmonth", todayJanuary);

        expect(period.startkey).toEqual(start.getTime());
        expect(period.endkey).toEqual(end.getTime());
    });
});

describe("dateFormat", () => {

    test("1625094927254", () => {

        const ts = 1625094927254;
        const s = dateFormat(ts);

        const dt = new Date(ts);
        const hm = dt.toLocaleTimeString().slice(0, 4);

        expect(s).toContain("2021-06-30");
        expect(s).toContain(hm);
    });

    test("1625581890487", () => {

        const ts = 1625581890487;
        const s = dateFormat(ts);

        const dt = new Date(ts);
        const hm = dt.toLocaleTimeString().slice(0, 4);

        expect(s).toContain("2021-07-06");
        expect(s).toContain(hm);
    });
});
