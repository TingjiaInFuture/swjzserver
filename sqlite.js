const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./swjc.db');

db.serialize(function () {
  db.run("CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
});

function checkUsername(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM Users WHERE username = ?", [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.id : null);
      }
    });
  });
}

function addUser(username, password) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO Users (username, password) VALUES (?, ?)", [username, password], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function login(username, password) {
  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM Users WHERE username = ? AND password = ?", [username, password], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.id : null);
      }
    });
  });
}




module.exports = {
  checkUsername,
  addUser,
  login
};
