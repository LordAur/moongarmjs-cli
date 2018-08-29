const fs = require('fs');
const mysql = require('mysql');

const moongarmConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/moongarm-dbconfig.json`, 'utf8'));

function stringField(data, callback) {
  const arrayField = [];
  data.field.forEach((field) => {
    if (field.type === 'increments') {
      const tmp = `\`${field.name}\` int(10) UNSIGNED PRIMARY KEY AUTO_INCREMENT`;
      arrayField.push(tmp);
    }

    if (field.type !== 'increments' && field.nullable !== true) {
      if (field.default === undefined) {
        const tmp = `\`${field.name}\` ${field.type}(${field.count}) NOT NULL`;
        arrayField.push(tmp);
      } else if (field.default !== undefined && field.unique !== true) {
        const tmp = `\`${field.name}\` ${field.type}(${field.count}) DEFAULT '${field.default}'`;
        arrayField.push(tmp);
      } else if (field.unique === true) {
        const tmp = `\`${field.name}\` ${field.type}(${field.count}) UNIQUE`;
        arrayField.push(tmp);
      }
    } else if (field.type !== 'increments' && field.nullable === true) {
      const tmp = `\`${field.name}\` \`${field.type}\`(${field.count})`;
      arrayField.push(tmp);
    }
  });

  return callback(arrayField);
}

function Mysql() { }

Mysql.connection = function connection() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
      fs.readFile(`${process.cwd()}/moongarm-dbconfig.json`, 'utf8', (err, data) => {
        if (err) {
          process.stdout.write('Sorry, dbconfig cannot read.\n');
          reject();
        } else {
          const configJson = JSON.parse(data);
          global.dbConnection = mysql.createConnection({
            host: configJson.host,
            port: configJson.port,
            user: configJson.username,
            password: configJson.password,
            database: configJson.database,
          });
          global.dbConnection.connect((status) => {
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

Mysql.createTable = function createTable(migrationFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${process.cwd()}/database/migrations/${migrationFile}`, 'utf8', (err, data) => {
      if (err) {
        process.stdout.write('Failed run create table.');
        reject();
      } else {
        const json = JSON.parse(data);
        stringField(json, (field) => {
          global.dbConnection.query(`CREATE TABLE \`${json.tableName}\` (${field.join(', ')}) ENGINE=${moongarmConfig.engine} DEFAULT CHARSET=${moongarmConfig.charset} COLLATE=${moongarmConfig.collation};`, (error) => {
            if (error) {
              process.stdout.write(`Migration failed with error: ${error.message}\n`);
              process.exit();
            } else {
              resolve();
            }
          });
        });
      }
    });
  });
};

module.exports = Mysql;
