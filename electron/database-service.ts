/*
 *  Copyright (C) 2021 Version 2 Software, LLC. All rights reserved.
 */

const sqlite3 = require('sqlite3');
import {MezzoEvent, Period, QueryOptions} from "./mezzo-types";

export class DatabaseService {

    db:any = null

    init(dbfilename:string) {
        this.db = new sqlite3.Database(dbfilename);

        let db = this.db // need to preserve reference when inside the following function
        this.db.serialize(function () {

            let sql = `
            CREATE TABLE IF NOT EXISTS mz_event (
                event_ts INTEGER,
                description TEXT,
                event_type TEXT                
            )
            `

            db.prepare(sql).run().finalize();
        })
    }

    shutdown() {
        console.log('Dbservice shutdown')
        this.db.close();
    }

    isValid() {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

    findAll(queryOptions:QueryOptions) {
        const startkey = queryOptions.period.startkey;
        const endkey = queryOptions.period.endkey;
        const completedOnly = queryOptions.completedOnly;

        return new Promise<MezzoEvent[]>((resolve, reject) => {
            try {

                let sql = "select rowid, * from mz_event where event_ts >= ? and event_ts <= ?";
                if (completedOnly) {
                    sql += " and event_type = 'COMPLETE'";
                }
                sql += " order by event_ts";

                this.db.all(sql, [startkey, endkey], function(err:any, arr:any) {
                    resolve(arr.map((row:any) => {
                            return {
                                rowId: row.rowid,
                                eventTimestamp: row.event_ts,
                                description: row.description,
                                eventType: row.event_type
                            }
                        }))
                });
            } catch (err) {
                reject("remoteService.findAll, " + err);
            }
        });
    }

    completedCount(period: Period) {
        const startkey = period.startkey;
        const endkey = period.endkey;

        return new Promise<number>((resolve, reject) => {
            try {

                let sql = `select count(*) as cnt from mz_event
                           where event_ts >= ? and event_ts <= ?
                           and event_type = 'COMPLETE'`;

                this.db.all(sql, [startkey, endkey], function(err:any, ary:any) {
                    resolve(ary[0].cnt);
                });
            } catch (err) {
                reject("remoteService.findAll, " + err);
            }
        });
    }

    save(me:MezzoEvent) {
        return new Promise((resolve, reject) => {
            try {
                let stmt = this.db.prepare("insert into mz_event values (?, ?, ?)");
                stmt.run(me.eventTimestamp, me.description, me.eventType).finalize();
                resolve(true);
            } catch (ex) {
                reject("remoteService.save," + ex);
            }
        });
    }

    update(me:MezzoEvent) {
        return new Promise((resolve, reject) => {
            try {
                let stmt = this.db.prepare("update mz_event set description = ? where rowid = ?");
                stmt.run(me.description, me.rowId).finalize();
                resolve(true);
            } catch (ex) {
                reject("remoteService.update," + ex);
            }
        });
    }

    delete(rowid:number) {
        return new Promise((resolve, reject) => {
            try {
                let stmt = this.db.prepare("delete from mz_event where rowid = ?");
                stmt.run(rowid).finalize();

                resolve(true);
            } catch (ex) {
                reject("remoteService.delete," + ex);
            }
        });
    }
}

