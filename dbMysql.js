const fs = require('fs');
const mysql = require('mysql');

function Mysql() { }

Mysql.connection = function connection() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
      fs.readFile(`${process.cwd()}/moongarm-dbconfig.json`, 'utf8', (err, data) => {
        if (err) {
          process.stdout.write(`Sorry, dbconfig cannot read: ${err}`);
          reject();
        } else {
          const configJson = JSON.parse(data);
          mysql.createConnection({
            host: configJson.host,
            port: configJson.port,
            user: configJson.username,
            password: configJson.password,
            database: configJson.database,
          }).connect((status) => {
            resolve(status);
          });
        }
      });
    } else {
      process.stdout.write('Sorry, database config not exists.\nPlease create dbconfig with run command\n\'moongarm-cli make:config <db_type> <database_name>\'\n');
      reject();
    }
  });
};

module.exports = Mysql;
