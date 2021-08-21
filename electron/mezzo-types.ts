export interface MezzoEvent {
    rowId: number;
    eventTimestamp: number;
    description: string;
    eventType: string;
}

export interface Period {
    startkey: number;
    endkey: number;
}

export interface QueryOptions {
    period: Period;
    completedOnly: boolean;
}

export interface Props {
    minutes: string;
    longBreak: string;
    shortBreak: string;
    tick: string;
    gong: string;
    alarm: string;
    notification: string;
    timerColor: string;
    gongStyle: string;
}
