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
