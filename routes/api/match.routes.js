const conf = require('./api.config')
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const db = require('../../services/db')
const abs_path = conf.base_path + '/match'

const sql_query_matches = `
        SELECT 
            e.id, 
            e.event_id,
            e.category,
            e.match_type,
            e.winner_id,
            e.arena,
            e.time,
            e.create_at,
            (
                SELECT COALESCE(
                    json_group_array(
                        json_object(
                            'id', b.id,
                            'name', b.name,
                            'contingent', b.contingent,
                            'grade', mp.grade
                        )
                    ),
                    '[]'
                )
                FROM tbl_match_participants mp
                JOIN tbl_participants b ON b.id = mp.participant_id
                WHERE mp.match_id = e.id
            ) AS participants
        FROM tbl_matches e
    `;

// Handlers

const handlerGetMatches = async (req, res) => {

    const eventId = req.params.eventId;

    const sql_matches = `${sql_query_matches} WHERE e.event_id = ? ORDER BY e.create_at DESC`;
    const matches = await new Promise((resolve, reject) => {
        db.all(sql_matches, [eventId], function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            const result = rows.map(row => {
                return {
                    id: row.id,
                    event_id: row.event_id,
                    category: row.category,
                    match_type: row.match_type,
                    winner_id: row.winner_id,
                    arena: row.arena,
                    time: row.time,
                    create_at: row.create_at,
                    participants: JSON.parse(row.participants),
                }
            })
            resolve(result);
        });
    })

    return res.response(RES_TYPES[200](matches));
}

const handlerGetMatchByCategory = async (req, res) => {

    const eventId = req.params.eventId;
    const category = decodeURIComponent(req.params.category || '');

    const sql_matches = `${sql_query_matches} WHERE e.event_id = ? AND e.category = ? ORDER BY e.create_at DESC`;
    const matches = await new Promise((resolve, reject) => {
        db.all(sql_matches, [eventId, category], function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            const result = rows.map(row => {
                return {
                    id: row.id,
                    event_id: row.event_id,
                    category: row.category,
                    match_type: row.match_type,
                    winner_id: row.winner_id,
                    arena: row.arena,
                    time: row.time,
                    create_at: row.create_at,
                    participants: JSON.parse(row.participants),
                }
            })
            resolve(result);
        });
    })

    return res.response(RES_TYPES[200](matches));
}

const handlerCreateMatch = async (req, res) => {

    const { event_id, category, match_type, winner_id, arena, time, participants } = req.payload;

    console.log(req.payload)

    const sql_match = `INSERT INTO tbl_matches (event_id, category, match_type, winner_id, arena, time) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql_match, [event_id, category, match_type, winner_id, arena, time], function (err) {
        console.log(this.lastID)
        if (err) console.log(err);
        else {
            for (let i = 0; i < participants?.length || 0; i++) {
                const sql_participants = `INSERT INTO tbl_match_participants (match_id, participant_id, grade) VALUES (?, ?, ?)`;
                db.run(sql_participants, [this.lastID, participants[i]?.id, participants[i]?.grade], function (err) {
                    if (err) {
                        console.log(err);
                    } else console.log(`inserted match participant`);
                });
            }

        }
    });

    return res.response(RES_TYPES[200](null, "Match created successfully"));
}

const handlerDeleteMatch = async (req, res) => {

    const id = req.params.id;

    const sql_match = `SELECT * FROM tbl_matches WHERE id = ?`;
    const match = await new Promise((resolve, reject) => {
        db.get(sql_match, [id], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            // Delete match participants
            const sql_delete_match_participants = `DELETE FROM tbl_match_participants WHERE match_id = ?`;
            db.run(sql_delete_match_participants, [id], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database deletion error'));
                }
            })
            resolve(row);
        });
    })

    if (!match) return res.response(RES_TYPES[404]("Match not found"));

    const sql_delete_match = `DELETE FROM tbl_matches WHERE id = ?`;
    await new Promise((resolve, reject) => {
        db.run(sql_delete_match, [id], function (err) {
            if (err) {
                console.log(err);
                return reject(new Error('Database deletion error'));
            }
            resolve(true);
        });
    })
    
    return res.response(RES_TYPES[200](null, "Match deleted successfully"));
}

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/create',
        handler: handlerCreateMatch
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path + '/{eventId}',
        handler: handlerGetMatches
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path + '/category/{eventId}/{category}',
        handler: handlerGetMatchByCategory
    },
    {
        method: FETCH_REQUEST_TYPES.DELETE,
        path: abs_path + '/delete/{id}',
        handler: handlerDeleteMatch
    },
]

module.exports = routes