/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const timerutil = require("../../src/util/timerutil.js");

describe("nextTimeout", () => {
    it("should be 1000", () => {
        expect(timerutil.nextTimeout(2000)).toBe(1000);
    });
    it("should be 900", () => {
        expect(timerutil.nextTimeout(2100)).toBe(900);
    });
});

describe("ellapsedTime", () => {
    it("should be 0", () => {
        expect(timerutil.ellapsedTime(0,0,0)).toBe(0);
    });
    it("should be 1900", () => {
        expect(timerutil.ellapsedTime(1000,100000,100)).toBe(98900);
    });
});

describe("pausedTime", () => {
    it("should be 6000", () => {
        expect(timerutil.pausedTime([1000,2000,3000])).toBe(6000);
    });
    it("should be 0", () => {
        expect(timerutil.pausedTime([])).toBe(0);
    });
});
