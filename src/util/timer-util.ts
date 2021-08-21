/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

export const lengthOfTickMark = function(tickIndex: number, remainingMinutes: number) {
    if ((remainingMinutes % 5) === (tickIndex % 5)) {
        return 60;
    } else {
        return 40;
    }
};

export const tickTime = function(tickIndex: number, remainingMinutes: number) {
    const t = 10 + remainingMinutes - tickIndex;
    if (t < 0) {
        return 60 + t;
    } else {
        return t;
    }
};

export const nextTimeout = (ellapsed: number) => {
    const drift = ellapsed % 1000;
    const nextTimeout = 1000 - drift;
    return nextTimeout;
};

export const ellapsedTime = (mStart: number, now: number, paused: number) => mStart ? (now - mStart - paused) : 0;

export const pausedTime = (pauseArray: any) => pauseArray.reduce((sum: number, value: number) => sum + value, 0);
