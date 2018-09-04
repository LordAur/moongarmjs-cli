const fs = require('fs');
const mysql = require('mysql');

const query = require('./mysql/query');

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
            multipleStatements: true,
          });
          global.dbConnection.connect((status) => {
            if (status === null) resolve();
            else reject();
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
  return new Promise((resolve, reject) => {
    const moongarmConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/moongarm-dbconfig.json`, 'utf8'));
    global.dbConnection.query(`CREATE TABLE \`migrations\` (\`id\` int UNSIGNED PRIMARY KEY AUTO_INCREMENT, \`migration\` varchar(255) NOT NULL, \`batch\` int NOT NULL) ENGINE=${moongarmConfig.engine} DEFAULT CHARSET=${moongarmConfig.charset} COLLATE=${moongarmConfig.collation};`, (err) => {
      if (err) {
        process.stdout.write(`Migration failed with error: ${err.message}\n`);
        reject();
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
        query.get(json)
          .then((field) => {
            global.dbConnection.query(`CREATE TABLE \`${json.tableName}\` (${field.join(', ')}) ENGINE=${moongarmConfig.engine} DEFAULT CHARSET=${moongarmConfig.charset} COLLATE=${moongarmConfig.collation};`, (createTableError) => {
              if (createTableError) {
                process.stdout.write(`Migration failed with error: ${createTableError.message}\n`);
                resolve();
              } else {
                query.getNewerBatch()
                  .then((batch) => {
                    if (batch.length === 0) {
                      query.insertLogMigration(migrationFile, 1)
                        .then(() => {
                          resolve();
                        })
                        .catch((migrateError) => {
                          process.stdout.write(`Sorry migration failed with error message : .${migrateError}\n`);
                          reject();
                        });
                    } else {
                      query.insertLogMigration(migrationFile, (batch[0].batch + 1))
                        .then(() => {
                          resolve();
                        })
                        .catch((migrateError) => {
                          process.stdout.write(`Sorry migration failed with error message : .${migrateError}\n`);
                          reject();
                        });
                    }
                  });
              }
            });
          })
          .catch(() => {
            process.exit();
          });
      }
    });
  });
};

Mysql.dropAllTable = function dropAllTable(data) {
  return new Promise((resolve, reject) => {
    data.forEach((table, index) => {
      const arr = table.migration.split('_');
      arr.splice(0, 1);
      const tableName = arr.join('_').replace('.json', '');
      global.dbConnection.query(`DROP TABLE \`${tableName}\``, (err) => {
        if (err) {
          reject(new Error(err));
        }
        if (index === (data.length - 1)) {
          resolve();
        }
      });
    });
  });
};

Mysql.migrationRefresh = function migrationRefresh() {
  return new Promise((resolve, reject) => {
    global.dbConnection.query('SELECT * FROM `migrations` ORDER BY `id` DESC', (err, data) => {
      if (err) {
        reject(new Error(err));
      }
      Mysql.dropAllTable(data)
        .then(() => {
          query.truncateLogMigration()
            .then(() => {
              resolve();
            })
            .catch((truncateError) => {
              reject(new Error(truncateError));
            });
        })
        .catch((dropTableError) => {
          reject(new Error(dropTableError));
        });
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
    query.getNewerBatch()
      .then((batchNewer) => {
        query.getListBatch(batchNewer[0].batch)
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
    query.getListBatch(step)
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

Mysql.seeding = function seeding(seedingFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${process.cwd()}/database/seeders/${seedingFile}`, 'utf8', (err, data) => {
      if (err) {
        reject(new Error(err));
      }
      const json = JSON.parse(data);
      json.batch.forEach((seeder) => {
        query.buildSeeder(json, seeder, (queryText) => {
          global.dbConnection.query(queryText, (seederError) => {
            if (seederError) {
              process.stdout.write(`Seeding database failed with error: ${seederError}\n`);
              reject();
            }
            resolve();
          });
        });
      });
    });
  });
};

Mysql.runQuery = function runQuery(query) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(query, (err, data) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(data);
    });
  });
};

module.exports = Mysql;
