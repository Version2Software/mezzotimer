/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

class MezzoraEvent {
    constructor(rowid, eventTimestamp, description, type) {
        this.rowid = rowid;
        this.eventTimestamp = eventTimestamp;
        this.description = description;
        this.eventType = type;
    }
}

module.exports.MezzoraEvent = MezzoraEvent;
