const conf = require('./api.config')
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types');
const db = require('../../services/db')
const abs_path = conf.base_path + '/participant'

// Handlers

const handlerGetAllParticipants = async (req, res) => {
    
    const sql_participants = `SELECT * FROM tbl_participants ORDER BY category ASC`;
    const participants = await new Promise((resolve, reject) => {
        db.all(sql_participants, function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(rows);
        });
    })

    return res.response(RES_TYPES[200](participants));
}

const handlerGetParticipantByEventId = async (req, res) => {

    const eventId = req.params.id;
    const sql_participants = `SELECT * FROM tbl_participants WHERE event_id = ? ORDER BY category ASC`;
    const participants = await new Promise((resolve, reject) => {
        db.all(sql_participants, [eventId], function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(rows);
        });
    })

    try {

        const sql_categories = `
            SELECT DISTINCT category 
            FROM tbl_participants 
            WHERE event_id = ?
            ORDER BY category ASC
        `;

        const categories = await new Promise((resolve, reject) => {
            db.all(sql_categories, [eventId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        const results = await Promise.all(
            categories.map(async (cat) => {
                const sql_check_bracket = `
                    SELECT 1 FROM tbl_brackets 
                    WHERE event_id = ? AND category = ? 
                    LIMIT 1
                `;
                const hasBracket = await new Promise((resolve, reject) => {
                    db.get(sql_check_bracket, [eventId, cat.category], (err, row) => {
                        if (err) return reject(err);
                        resolve(!!row);
                    });
                });

                return {
                    category: cat.category,
                    hasBracket,
                };
            })
        );

        return res.response(RES_TYPES[200]({
            participants,
            categories: results
        }));
    } catch (error) {
        console.error(error);
        return res.response(RES_TYPES[500]("Server error saat mengambil kategori & bracket"));
    }
}

const handlerGetParticipantByCategory = async (req, res) => {

    const eventId = req.params?.eventId;
    const category = decodeURIComponent(req.params?.category || '');
    
    const sql_participants = `SELECT * FROM tbl_participants WHERE event_id = ? AND category = ? ORDER BY create_at DESC`;
    const participants = await new Promise((resolve, reject) => {
        db.all(sql_participants, [eventId, category], function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(rows);
        });
    })

    return res.response(RES_TYPES[200](participants));
}

const handlerAddParticipant = async (req, res) => {

    const { event_id, data } = req.payload;

    const sql_participant = `INSERT INTO tbl_participants (event_id, name, contingent, category, gender) VALUES (?, ?, ?, ?, ?)`;
    for (let i = 0; i < data?.length || 0; i++) {
        db.run(sql_participant, [event_id, data[i].name, data[i].contingent, data[i].category, data[i].gender], function (err) {
            if (err) {
                console.log(err);
            } else console.log(`inserted ${i+1} participant`);
        });        

    }

    return res.response(RES_TYPES[200](null, `${data?.length} participants added successfully`));
} 

const handlerDeleteParticipant = async (req, res) => {

    const id = req.params.id;

    const sql_participant = `SELECT * FROM tbl_participants WHERE id = ?`;
    const participant = await new Promise((resolve, reject) => {
        db.get(sql_participant, [id], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (!participant) return res.response(RES_TYPES[404]("Participant not found"));

    const sql_delete_participant = `DELETE FROM tbl_participants WHERE id = ?`;
    await new Promise((resolve, reject) => {
        db.run(sql_delete_participant, [id], function (err) {
            if (err) {
                console.log(err);
                return reject(new Error('Database deletion error'));
            }
            resolve(true);
        });
    })
    
    return res.response(RES_TYPES[200](null, "Participant deleted successfully"));
}

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path,
        handler: handlerGetAllParticipants
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path + '/category/{eventId}/{category}',
        handler: handlerGetParticipantByCategory
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path+'/event/{id}',
        handler: handlerGetParticipantByEventId
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/add',
        handler: handlerAddParticipant
    },
    {
        method: FETCH_REQUEST_TYPES.DELETE,
        path: abs_path + '/delete/{id}',
        handler: handlerDeleteParticipant
    }
]

module.exports = routes