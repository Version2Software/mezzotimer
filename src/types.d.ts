interface Window {
    api: any;
}

type MezzoEvent = {
    rowId: number,
    eventTimestamp: number,
    description: string,
    eventType: string
}

type Period = {
    startkey: number,
    endkey: number
}

type QueryOptions = {
    period: Period,
    completedOnly: boolean
}

type Props = {
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
