const Database = require('better-sqlite3');
const db = new Database('diwata.db');

db.prepare(`CREATE TABLE IF NOT EXISTS gold (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT UNIQUE NOT NULL,
  value REAL NOT NULL
)`).run();

const worldGold = db.prepare('SELECT * FROM gold WHERE type = \'world-gold\'').get();
if (!worldGold) {
  db.prepare('INSERT INTO gold (type, value) VALUES (\'world-gold\', 0)').run();
}

const potGold = db.prepare('SELECT * FROM gold WHERE type = \'pot-gold\'').get();
if (!potGold) {
  db.prepare('INSERT INTO gold (type, value) VALUES (\'pot-gold\', 0)').run();
}

function updateWorldGold(amount) {
  const stmt = db.prepare('UPDATE gold SET value = value + ? WHERE type = \'world-gold\'');
  stmt.run(amount);
  const updatedRow = db.prepare('SELECT value FROM gold WHERE type = \'world-gold\'').get();
  return updatedRow.value;
}

function updatePotGold(amount) {
  const stmt = db.prepare('UPDATE gold SET value = value + ? WHERE type = \'pot-gold\'');
  stmt.run(amount);
  const updatedRow = db.prepare('SELECT value FROM gold WHERE type = \'pot-gold\'').get();
  return updatedRow.value;
}

module.exports = { db, updateWorldGold, updatePotGold };