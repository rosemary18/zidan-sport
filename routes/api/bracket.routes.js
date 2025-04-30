const conf = require('./api.config')
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const db = require('../../services/db')
const abs_path = conf.base_path + '/bracket'

// Handlers

const handlerGetBracket = async (req, res) => {

    const eventId = req.params.eventId;
    const category = decodeURIComponent(req.params.category || '');

    const sql_bracket = `SELECT * FROM tbl_brackets WHERE event_id = ? AND category = ?`;
    const bracket = await new Promise((resolve, reject) => {
        db.get(sql_bracket, [eventId, category], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        })
    })

    return res.response(RES_TYPES[200](bracket));
}

const handlerCreateBracket = async (req, res) => {

    const { event_id, category, bracket } = req.payload;

    const sql_bracket = `INSERT INTO tbl_brackets (event_id, category, bracket) VALUES (?, ?, ?)`;
    db.run(sql_bracket, [event_id, category, bracket], function (err) {
        if (err) {
            console.log(err);
        } else console.log(`inserted bracket`);
    });

    return res.response(RES_TYPES[200](null, "Bracket created successfully"));
};

const handlerUpdateBracket = async (req, res) => {

    const id = req.params.id;
    const { bracket, rangking } = req.payload;

    console.log(rangking)

    const sql_bracket = `UPDATE tbl_brackets SET bracket = ?, rangking = ? WHERE id = ?`;
    db.run(sql_bracket, [bracket, rangking, id], function (err) {
        if (err) {
            console.log(err);
        } else console.log(`updated bracket`);
    });

    return res.response(RES_TYPES[200](null, "Bracket updated successfully"));
};

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path + '/{eventId}/{category}',
        handler: handlerGetBracket
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path,
        handler: handlerCreateBracket
    },
    {
        method: FETCH_REQUEST_TYPES.PUT,
        path: abs_path + '/{id}',
        handler: handlerUpdateBracket
    }
]

module.exports = routes