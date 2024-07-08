const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database
const db = new sqlite3.Database('diwata.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

// Create gold table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS gold (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT UNIQUE NOT NULL,
        value REAL NOT NULL
    )`);

    // Initialize world-gold and pot-gold if they don't exist
    db.get('SELECT * FROM gold WHERE type = ?', 'world-gold', (err, row) => {
        if (!row) {
            db.run('INSERT INTO gold (type, value) VALUES (?, ?)', 'world-gold', 0);
        }
    });

    db.get('SELECT * FROM gold WHERE type = ?', 'pot-gold', (err, row) => {
        if (!row) {
            db.run('INSERT INTO gold (type, value) VALUES (?, ?)', 'pot-gold', 0);
        }
    });
});

function updateGold(type, amount) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE gold SET value = value + ? WHERE type = ?', [amount, type], function(err) {
            if (err) {
                reject(err);
            } else {
                db.get('SELECT value FROM gold WHERE type = ?', type, (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row.value);
                    }
                });
            }
        });
    });
}

function updateBothGold(worldAmount, potAmount) {
  return Promise.all([
      updateGold('world-gold', worldAmount),
      updateGold('pot-gold', potAmount)
  ]);
}

function getGoldValueByType(type) {
  return new Promise((resolve, reject) => {
      db.get('SELECT value FROM gold WHERE type = ?', type, (err, row) => {
          if (err) {
              reject(err);
          } else {
              resolve(row ? row.value : null);
          }
      });
  });
}

module.exports = { db, updateGold, updateBothGold, getGoldValueByType };