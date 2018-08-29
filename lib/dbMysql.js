const fs = require('fs');
const mysql = require('mysql');

const moongarmConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/moongarm-dbconfig.json`, 'utf8'));

function buildGrammar(data, callback) {
  const tmpQuery = [];
  if (data.type === 'increments') {
    tmpQuery.push(`\`${data.name}\` int(10) UNSIGNED PRIMARY KEY AUTO_INCREMENT`);
  } else if (data.type !== 'increments' && data.count === undefined) {
    tmpQuery.push(`\`${data.name}\` ${data.type}`);
  } else if (data.type === 'int') {
    tmpQuery.push(`\`${data.name}\` ${data.type}(10)`);
  } else {
    tmpQuery.push(`\`${data.name}\` ${data.type}(${data.count})`);
  }

  if (data.type !== 'increments' && data.primaryKey === true) {
    tmpQuery.push('PRIMARY KEY');
  }

  if (data.unique !== undefined && data.unique === true) {
    tmpQuery.push('UNIQUE');
  }

  if (data.foreign !== undefined) {
    tmpQuery.push(`UNSIGNED NOT NULL, FOREIGN KEY (\`${data.name}\`) REFERENCES \`${data.foreign[0].on}\`(\`${data.foreign[0].reference}\`)`);

    if (data.foreign[0].onDelete === true || data.foreign[0].onDelete === undefined) {
      tmpQuery.push('ON DELETE CASCADE');
    }

    if (data.foreign[0].onUpdate === true) {
      tmpQuery.push('ON UPDATE CASCADE');
    }
  }

  if (data.default !== undefined && data.default !== null) {
    tmpQuery.push(`DEFAULT '${data.default}'`);
  }

  if (data.type !== 'increments' && data.nullable !== undefined && data.nullable !== true) {
    tmpQuery.push('NOT NULL');
  }

  return callback(tmpQuery.join(' '));
}

function stringField(data, callback) {
  const arrayField = [];
  data.field.forEach((field) => {
    buildGrammar(field, (grammar) => {
      arrayField.push(grammar);
    });
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
