/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const lengthOfTickMark = function (tickIndex, remainingMinutes) {
    if ((remainingMinutes % 5) === (tickIndex % 5)) {
        return 60;
    } else {
        return 40;
    }
};

const tickTime = function (tickIndex, remainingMinutes) {
    const t = 10 + remainingMinutes - tickIndex;
    if (t < 0) {
        return 60 + t;
    } else {
        return t;
    }
};

const nextTimeout = (ellapsed) => {
    const drift = ellapsed % 1000;
    const nextTimeout = 1000 - drift;
    return nextTimeout;
};

const ellapsedTime = (mStart, now, paused) => mStart ? (now - mStart - paused) : 0;

const pausedTime = (pauseArray) => pauseArray.reduce((sum, value) => sum + value, 0);

module.exports.nextTimeout = nextTimeout;
module.exports.ellapsedTime = ellapsedTime;
module.exports.pausedTime = pausedTime;
module.exports.lengthOfTickMark = lengthOfTickMark;
module.exports.tickTime = tickTime;
