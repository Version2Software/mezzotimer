import {DatabaseService} from "../../../electron/database-service";
const db = new DatabaseService();

describe('DatabaseService', () => {
    it('isValid', async () => {
        const result = await db.isValid()
        expect(result).toBe(true);
    });

    it('find in range', async () => {
        db.init(':memory:');

        const saveResult = await db.save({
            rowId: 0,
                eventTimestamp: 99,
                description: "test",
                eventType: "COMPLETE"
        });

        const saveResult2 = await db.save({
            rowId: 0,
            eventTimestamp: 101,
            description: "test",
            eventType: "COMPLETE"
        });

        const docs = await db.findAll({
            period: {startkey: 0, endkey: 100},
            completedOnly: false
        })

        db.shutdown();

        expect(docs.length).toBe(1);

        expect(saveResult).toBe(true);
        expect(saveResult2).toBe(true);
    });

    it('delete', async () => {
        db.init(':memory:');

        await db.save({
            rowId: 0,
            eventTimestamp: 99,
            description: "test",
            eventType: "COMPLETE"
        });

        await db.save({
            rowId: 0,
            eventTimestamp: 101,
            description: "test",
            eventType: "COMPLETE"
        });

        const docs = await db.findAll({
            period: {startkey: 0, endkey: 1000},
            completedOnly: true
        })

        const firstCount = await db.completedCount({
            startkey: 0, endkey: 1000
        });

        await db.delete(docs[0].rowId);

        const secondCount = await db.completedCount({
            startkey: 0, endkey: 1000
        });

        db.shutdown();

        expect(firstCount - secondCount).toBe(1);
    });

    it('completed count', async () => {
        db.init(':memory:');

        await db.save({
            rowId: 0,
            eventTimestamp: 99,
            description: "test",
            eventType: "COMPLETE"
        });

        await db.save({
            rowId: 0,
            eventTimestamp: 101,
            description: "test",
            eventType: "COMPLETE"
        });

        const count = await db.completedCount({
            startkey: 0, endkey: 100
        });

        db.shutdown();
        expect(count).toBe(1);
    });

    it('calculatePurgeTimestamp', () => {
        const now = new Date("2021-07-06").getTime();
        expect(db.calculatePurgeTimestamp(2, now)).toBe(new Date("2021-07-04").getTime());
    });
})
