const Joi = require('joi');
const conf = require('./api.config')
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const db = require('../../services/db')
const ExcelJS = require('exceljs')
const path = require('path')
const os = require('os')
const fs = require('fs')
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

const handlerExportRecapitulation = async (req, res) => {

    const eventId = req.params.eventId;

    try {

        const medalByCategory = {}
        const medalByContingent = {}
        const matchesByCategory = {}

        const event = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM tbl_events WHERE id = ?`, [eventId], (err, row) => {
                if (err) {
                    console.log(err);
                    return reject(res.response(RES_TYPES[500](err)));
                }
                resolve(row);
            });
        })

        if (!event) return res.response(RES_TYPES[404]("Event not found!"));

        const contingents = await new Promise((resolve, reject) => {
            db.all(`SELECT DISTINCT contingent FROM tbl_participants WHERE event_id = ?`, [eventId], (err, rows) => {
                if (err) {
                    console.log(err);
                    return reject(res.response(RES_TYPES[500](err)));
                }
                resolve(rows);
            });
        })

        contingents.forEach(contingent => {
            medalByContingent[contingent.contingent] = {
                gold: 0,
                silver: 0,
                bronze: 0
            }
        })

        const matches = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    e.id, 
                    e.event_id,
                    e.category,
                    e.match_type,
                    e.winner_id,
                    w.name AS winner_name,
                    w.contingent AS contingent,
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
                LEFT JOIN tbl_participants w ON w.id = e.winner_id
                WHERE e.event_id = ?
                ORDER BY e.create_at DESC;
            `, [eventId], (err, rows) => {
                if (err) {
                    console.log(err);
                    return reject(res.response(RES_TYPES[500](err)));
                }

                const matchesWithWinner = rows.map(row => {
                    const { winner_id, winner_name, contingent, participants, ...matchData } = row;
                    return {
                        ...matchData,
                        winner_id,
                        participants: JSON.parse(participants),
                        winner: winner_id ? {
                            id: winner_id,
                            name: winner_name,
                            contingent: contingent
                        } : null
                    };
                });

                resolve(matchesWithWinner);
            });
        });

        matches.forEach(match => {
            if (match.winner != null) {
                if (matchesByCategory[match.category]) matchesByCategory[match.category].push(match)
                else matchesByCategory[match.category] = [match]
            }
        })

        Object.keys(matchesByCategory).forEach((category) => {
            const matches = matchesByCategory[category]
            medalByCategory[category] = []
            matches?.forEach(match => {
                if (medalByCategory[category]?.length < 4) {
                    if (!medalByCategory[category]?.find(m => match?.winner_id == m.id)) medalByCategory[category].push(match.winner)
                    match?.participants?.forEach(participant => {
                        if (participant?.id != match?.winner_id && !medalByCategory[category]?.find(m => participant?.id == m.id)) medalByCategory[category].push(participant)
                    })
                }
            })
        })

        Object.keys(medalByCategory).forEach((category) => {
            const winners = medalByCategory[category]
            winners?.forEach((winner, index) => {
                if (medalByContingent[winner.contingent]) {
                    if (index == 0) medalByContingent[winner.contingent].gold = medalByContingent[winner.contingent].gold + 1
                    else if (index == 1) medalByContingent[winner.contingent].silver = medalByContingent[winner.contingent].silver + 1
                    else if (index > 1) medalByContingent[winner.contingent].bronze = medalByContingent[winner.contingent].bronze + 1
                } else medalByContingent[winner.contingent] = {
                    gold: index == 0 ? 1 : 0,
                    silver: index == 1 ? 1 : 0,
                    bronze: index > 1 ? 1 : 0
                }
            })
        })

        const workbook = new ExcelJS.Workbook();

        const setCellStyle = (cell, options = {}, index) => {
            cell.font = options.font || { size: 12 };
            cell.alignment = options.alignment || { vertical: 'middle', horizontal: 'center', wrapText: true };
            if (index > 1) cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            if (options.fill) cell.fill = options.fill;
        };

        const worksheetMedalByContingent = workbook.addWorksheet('REKAPITULASI PER KONTINGEN');
        worksheetMedalByContingent.columns = [
            { width: 10 },
            { width: 4 },
            { width: 40 },
            { width: 14 },
            { width: 14 },
            { width: 16 },
            { width: 10 },
        ];

        const titleSheet1 = worksheetMedalByContingent.addRow(['', 'PEROLEHAN MEDALI JUARA UMUM', '']);
        worksheetMedalByContingent.mergeCells(`B${titleSheet1.number}:F${titleSheet1.number}`);
        const titleMainCell1 = titleSheet1.getCell(2);
        titleMainCell1.font = { size: 16, bold: true };
        titleMainCell1.alignment = { horizontal: 'center', vertical: 'middle' };

        const titleSubtitle1 = worksheetMedalByContingent.addRow(['', event.name, '']);
        worksheetMedalByContingent.mergeCells(`B${titleSubtitle1.number}:F${titleSubtitle1.number}`);
        const subtitleCell1 = titleSubtitle1.getCell(2);
        subtitleCell1.font = { size: 14, bold: true };
        subtitleCell1.alignment = { horizontal: 'center', vertical: 'middle' };

        const imageBuffer = fs.readFileSync(path.join(__dirname, '../../public/icons/logo.png'));
        const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'png'
        });
        worksheetMedalByContingent.addImage(imageId, {
            tl: { col: 1, row: 0 },
            ext: { width: 80, height: 80 },
        });

        worksheetMedalByContingent.addRow([]);

        const headerRow1 = worksheetMedalByContingent.addRow(['', 'NO', 'KONTINGEN', 'EMAS', 'PERAK', 'PERUNGGU']);
        headerRow1.eachCell((cell, colNumber) => {
            if (colNumber === 1) setCellStyle(cell, { font: { size: 12 }, alignment: { horizontal: 'center', vertical: 'middle' } }, colNumber);
            else {
                setCellStyle(cell, {
                    font: { bold: true },
                    alignment: { horizontal: 'center', vertical: 'middle' },
                    fill: {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: colNumber == 4 ? 'FFFFD700' : colNumber == 5 ? 'FFC0C0C0' : colNumber == 6 ? 'FFCD7F32' : 'FF91C8E4' }
                    }
                }, colNumber);
            }
        });

        Object.keys(Object.fromEntries(Object.entries(medalByContingent).sort((a, b) => b[1].gold - a[1].gold))).map((contingent, index) => {
            const medals = medalByContingent[contingent];
            const row = worksheetMedalByContingent.addRow(['', index+1, contingent, medals.gold || '', medals.silver || '', medals.bronze || '']);
            row.eachCell((cell, colNumber) => {
                setCellStyle(cell, {
                    alignment: {
                        horizontal: 'center',
                        vertical: 'middle',
                        wrapText: true
                    }
                }, colNumber);
            });
        });

        worksheetMedalByContingent.addRow(['', '', '', '', '', '', '']);

        const worksheetMedalByCategory = workbook.addWorksheet('REKAPITULASI PER KATEGORI');
        worksheetMedalByCategory.columns = [
            { width: 10 },
            { width: 50 },
            { width: 30 },
            { width: 12 },
            { width: 10 },
        ];

        const titleSheet = worksheetMedalByCategory.addRow(['', 'REKAPITULASI MEDALI', '']);
        worksheetMedalByCategory.mergeCells(`B${titleSheet.number}:D${titleSheet.number}`);
        const titleMainCell = titleSheet.getCell(2);
        titleMainCell.font = { size: 16, bold: true };
        titleMainCell.alignment = { horizontal: 'center', vertical: 'middle' };

        const titleSubtitle = worksheetMedalByCategory.addRow(['', event.name, '']);
        worksheetMedalByCategory.mergeCells(`B${titleSubtitle.number}:D${titleSubtitle.number}`);
        const subtitleCell = titleSubtitle.getCell(2);
        subtitleCell.font = { size: 14, bold: true };
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheetMedalByCategory.addImage(imageId, {
            tl: { col: 1, row: 0 },
            ext: { width: 80, height: 80 },
        });

        worksheetMedalByCategory.addRow([]);

        Object.keys(medalByCategory).sort().forEach((category) => {

            const winners = medalByCategory[category];
    
            const titleRow = worksheetMedalByCategory.addRow(['', category]);
            worksheetMedalByCategory.mergeCells(`B${titleRow.number}:D${titleRow.number}`);
            const titleCell = titleRow.getCell(2);
            titleCell.font = { bold: true, size: 14 };
            titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

            const headerRow = worksheetMedalByCategory.addRow(['', 'NAMA', 'KONTINGEN', 'JUARA']);
            headerRow.eachCell((cell, colNumber) => {
                if (colNumber === 1) setCellStyle(cell, { font: { size: 12 }, alignment: { horizontal: 'center', vertical: 'middle' } }, colNumber);
                else {
                    setCellStyle(cell, {
                        font: { bold: true },
                        alignment: { horizontal: 'center', vertical: 'middle' },
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'ffffce00' }
                        }
                    }, colNumber);
                }
            });

            winners.forEach((winner, index) => {
                let juara = index === 0 ? 'EMAS' : index === 1 ? 'PERAK' : 'PERUNGGU';
                const row = worksheetMedalByCategory.addRow(['', winner.name, winner.contingent, juara]);
                row.eachCell((cell, colNumber) => {
                    const isNameColumn = colNumber === 2;
                    setCellStyle(cell, {
                        alignment: {
                            horizontal: isNameColumn ? 'left' : 'center',
                            vertical: 'middle',
                            wrapText: true
                        }
                    }, colNumber);
                });
            });

            worksheetMedalByCategory.addRow([]);
        });

        worksheetMedalByCategory.addRow(['', '', '', '', '']);

        const tmpFilePath = path.join(os.tmpdir(), `rekapitulasi-medali-${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(tmpFilePath);

        const fileStream = fs.createReadStream(tmpFilePath);

        return res.response(fileStream)
        .type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header(
            'Content-Disposition',
            `attachment; filename="rekap_medali_${event.name?.replace(/\s/g, '_')}.xlsx"`
        );
    } catch (error) {
        console.log(error)
        return res.response(RES_TYPES[500]())
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
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path + "/export-recap/{eventId}",
        handler: handlerExportRecapitulation
    },
    {
        method: FETCH_REQUEST_TYPES.DELETE,
        path: abs_path + '/delete/{eventId}',
        handler: handlerDeleteEvent
    }
]

module.exports = routes