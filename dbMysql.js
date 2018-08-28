const mysql = require('mysql');

function Mysql() { }

Mysql.connection = function connection() {
  return new Promise((resolve, reject) => {
    mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'ccpos',
    }).connect((err) => {
      if (err) {
        const errMessage = `Database connection error: ${err.stack}`;
        reject(errMessage);
      } else {
        resolve();
      }
    });
  });
};

module.exports = Mysql;
