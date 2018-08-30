const fs = require('fs');
const mysql = require('mysql');

function buildGrammar(data, callback) {
  const tmpQuery = [];
  if (data.type === 'increments') {
    tmpQuery.push(`\`${data.name}\` int UNSIGNED PRIMARY KEY AUTO_INCREMENT`);
  } else if (data.type !== 'increments' && data.count === undefined) {
    tmpQuery.push(`\`${data.name}\` ${data.type}`);
  } else if (data.type === 'int') {
    tmpQuery.push(`\`${data.name}\` ${data.type}(10)`);
  } else if (data.type !== 'int' && data.count !== undefined) {
    tmpQuery.push(`\`${data.name}\` ${data.type}(${data.count})`);
  } else if (data.type === 'varchar' && data.count === undefined) {
    tmpQuery.push(`\`${data.name}\` ${data.type}(255)`);
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

function batchCount() {
  return new Promise((resolve, reject) => {
    global.dbConnection.query('SELECT * FROM `migrations` ORDER BY `batch` DESC LIMIT 1', (error, data) => {
      if (error) {
        reject(new Error(error));
      }
      resolve(data);
    });
  });
}

function batchList(batch) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`SELECT * FROM \`migrations\` WHERE \`batch\` = ${batch} ORDER BY \`migration\` DESC`, (error, data) => {
      if (error) {
        reject(new Error(error));
      }
      resolve(data);
    });
  });
}

function insertMigrationLog(migrationFile, batch) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`INSERT INTO \`migrations\` (\`id\`, \`migration\`, \`batch\`) VALUES (NULL, '${migrationFile}', ${batch})`, (err) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve();
      }
    });
  });
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

Mysql.checkMigrationNewer = function checkMigrationNewer(migrationFile) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`SELECT * FROM \`migrations\` WHERE \`migration\` = '${migrationFile}'`, (err, data) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(data);
    });
  });
};

Mysql.createMigrationDB = function createMigrationDB() {
  return new Promise((resolve) => {
    const moongarmConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/moongarm-dbconfig.json`, 'utf8'));
    global.dbConnection.query(`CREATE TABLE \`migrations\` (\`id\` int UNSIGNED PRIMARY KEY AUTO_INCREMENT, \`migration\` varchar(255) NOT NULL, \`batch\` int NOT NULL) ENGINE=${moongarmConfig.engine} DEFAULT CHARSET=${moongarmConfig.charset} COLLATE=${moongarmConfig.collation};`, (error) => {
      if (error) {
        process.stdout.write(`Migration failed with error: ${error.message}\n`);
        process.exit();
      } else {
        resolve();
      }
    });
  });
};

Mysql.createTable = function createTable(migrationFile) {
  return new Promise((resolve, reject) => {
    const moongarmConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/moongarm-dbconfig.json`, 'utf8'));

    fs.readFile(`${process.cwd()}/database/migrations/${migrationFile}`, 'utf8', (err, data) => {
      if (err) {
        process.stdout.write('Failed run create table.\n');
        reject();
      } else {
        const json = JSON.parse(data);
        stringField(json, (field) => {
          global.dbConnection.query(`CREATE TABLE \`${json.tableName}\` (${field.join(', ')}) ENGINE=${moongarmConfig.engine} DEFAULT CHARSET=${moongarmConfig.charset} COLLATE=${moongarmConfig.collation};`, (error) => {
            if (error) {
              process.stdout.write(`Migration failed with error: ${error.message}\n`);
              process.exit();
            } else {
              batchCount()
                .then((batch) => {
                  if (batch.length === 0) {
                    insertMigrationLog(migrationFile, 1)
                      .then(() => {
                        process.stdout.write(`Migration \`${json.tableName}\` success.\n`);
                        resolve();
                      })
                      .catch((migrateError) => {
                        process.stdout.write(`Sorry migration failed with error message : .${migrateError}\n`);
                        process.exit();
                      });
                  } else {
                    insertMigrationLog(migrationFile, (batch[0].batch + 1))
                      .then(() => {
                        process.stdout.write(`Migration \`${json.tableName}\` success.\n`);
                        resolve();
                      })
                      .catch((migrateError) => {
                        process.stdout.write(`Sorry migration failed with error message : .${migrateError}\n`);
                        process.exit();
                      });
                  }
                });
            }
          });
        });
      }
    });
  });
};

Mysql.removeBatchMigration = function removeBatchMigration(batchNewer) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`DELETE FROM \`migrations\` WHERE \`batch\` = ${batchNewer}`, (err) => {
      if (err) {
        reject();
      }
      resolve();
    });
  });
};

Mysql.rollbackNewer = function rollbackNewer() {
  return new Promise((resolve, reject) => {
    batchCount()
      .then((batchNewer) => {
        batchList(batchNewer[0].batch)
          .then((lists) => {
            if (lists.length !== 0) {
              lists.forEach((list) => {
                const arr = list.migration.split('_');
                arr.splice(0, 1);
                const tableName = arr.join('_').replace('.json', '');
                global.dbConnection.query(`DROP TABLE \`${tableName}\``, (err) => {
                  if (err) {
                    reject(new Error(err));
                  } else {
                    resolve(batchNewer[0].batch);
                  }
                });
              });
            }
          });
      });
  });
};

Mysql.rollbackWithStep = function rollbackWithStep(step) {
  return new Promise((resolve, reject) => {
    batchList(step)
      .then((lists) => {
        if (lists.length !== 0) {
          lists.forEach((list) => {
            const arr = list.migration.split('_');
            arr.splice(0, 1);
            const tableName = arr.join('_').replace('.json', '');
            global.dbConnection.query(`DROP TABLE \`${tableName}\``, (err) => {
              if (err) {
                reject(new Error(err));
              } else {
                resolve(step);
              }
            });
          });
        }
      });
  });
};

module.exports = Mysql;
