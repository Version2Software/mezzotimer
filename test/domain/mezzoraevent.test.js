/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const {MezzoraEvent} = require("../../src/domain/mezzoraevent.js");

describe("MezzoraEvent", () => {
    test("constructor", () => {
        const me = new MezzoraEvent(0, 1, "desc", "COMPLETE");

        expect(me.rowid).toBe(0);
        expect(me.eventTimestamp).toBe(1);
        expect(me.description).toBe("desc");
        expect(me.eventType).toBe("COMPLETE");
    });
});
