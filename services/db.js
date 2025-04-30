
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./zsport.db', (err) => {
    if (err) console.log(`[DATABASE]: Connection failed. \n ${err.message}`);
    else console.log('[DATABASE]: Connected to the SQLite database.');
});

// Create tables

db.serialize(() => {
    db.run("BEGIN TRANSACTION;");

    db.run(`CREATE TABLE IF NOT EXISTS tbl_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        location TEXT,
        organizer TEXT,
        date TEXT, -- Bisa dalam format ISO 8601 (YYYY-MM-DD HH:MM:SS)
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS tbl_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        name TEXT,
        gender INTEGER,
        age VARCHAR(255),
        category TEXT,
        contingent TEXT,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES tbl_events(id) ON DELETE CASCADE
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS tbl_matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        winner_id INTEGER,
        match_type TEXT,
        category TEXT,
        time TEXT, -- Bisa dalam format jam (HH:MM:SS)
        arena TEXT,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES tbl_events(id) ON DELETE CASCADE,
        FOREIGN KEY (winner_id) REFERENCES tbl_participants(id)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS tbl_match_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER,
        participant_id INTEGER,
        grade TEXT,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES tbl_matches(id) ON DELETE CASCADE,
        FOREIGN KEY (participant_id) REFERENCES tbl_participants(id)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS tbl_brackets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        category TEXT,
        bracket TEXT,
        rangking TEXT,
        create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES tbl_events(id) ON DELETE CASCADE
    );`);

    db.run("COMMIT;", (err) => {
        if (err) return console.error(err.message);
        console.log("Tables created or updated successfully!");
    });
});


process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('[DATABASE]: Connection closed.');
        process.exit(0);
    });
});

module.exports = db