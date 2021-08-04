export type MezzoEvent = {
    rowId: number,
    eventTimestamp: number,
    description: string,
    eventType: string
}

export type Period = {
    startkey: number,
    endkey: number
}

export type QueryOptions = {
    period: Period,
    completedOnly: boolean
}

export type Props = {
    minutes:string,
    longBreak: string,
    shortBreak: string,
    tick: string,
    gong: string,
    alarm: string,
    notification: string,
    timerColor: string,
    gongStyle: string
}
