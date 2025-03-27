const Joi = require('joi');
const conf = require('./api.config')
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const db = require('../../services/db')
const abs_path = conf.base_path + '/event'

// Handlers

const handlerCreateEvent = async (req, res) => {

    const { name, location, organizer, date } = req.payload;

    try {

        // Masukkan event baru ke database
        const eventId = await new Promise((resolve, reject) => {
            const sql = `INSERT INTO tbl_events (name, location, organizer, date) VALUES (?, ?, ?, ?)`;
            db.run(sql, [name, location, organizer, date], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database insertion error'));
                }
                resolve(this.lastID);
            });
        });

        // Ambil data event yang baru dimasukkan
        const newEvent = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tbl_events WHERE id = ?`;
            db.get(sql, [eventId], (err, row) => {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(row);
            });
        });

        // Kembalikan respons dengan data event yang baru dimasukkan
        return res.response(RES_TYPES[200](newEvent, 'Event created successfully'));
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
};

const handlerGetEvents = async (req, res) => {

    try {
        const events = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM tbl_events`, [], (err, rows) => {
                if (err) {
                    console.log(err)
                    return reject(res.response(RES_TYPES[500](err)));
                }
                resolve(rows || []);
            });
        })

        return res.response(RES_TYPES[200](events));
    } catch (err) {
        console.log(err)
        return res.response(RES_TYPES[500]());
    }
};

const handlerDeleteEvent = async (req, res) => {

    const eventId = req.params.eventId;

    try {
        
        const sql = `DELETE FROM tbl_events WHERE id = ?`;
        const isDeleted = await new Promise((resolve, reject) => {
            db.run(sql, [eventId], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database deletion error'));
                }
                resolve(true);
            });
        })

        const sql_delete_participants = `DELETE FROM tbl_participants WHERE event_id = ?`;
        await new Promise((resolve, reject) => {
            db.run(sql_delete_participants, [eventId], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database deletion error'));
                }
                resolve(true);
            });
        })

        const sql_delete_counters = `DELETE FROM tbl_matches WHERE event_id = ?`;
        await new Promise((resolve, reject) => {
            db.run(sql_delete_counters, [eventId], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database deletion error'));
                }
                resolve(true);
            });
        })


        if (!isDeleted) return res.response(RES_TYPES[500]());
        return res.response(RES_TYPES[200](null, "Event deleted successfully"));
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
} 

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path,
        handler: handlerGetEvents
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/create',
        options: {
            validate: {
                payload: Joi.object({
                    name: Joi.string().required(),
                    location: Joi.string().required(),
                    organizer: Joi.string().required(),
                    date: Joi.string().required()
                })
            },
        },
        handler: handlerCreateEvent
    },
    {
        method: FETCH_REQUEST_TYPES.DELETE,
        path: abs_path + '/delete/{eventId}',
        handler: handlerDeleteEvent
    }
]

module.exports = routes