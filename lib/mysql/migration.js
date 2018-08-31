const files = require('../files');
const mysql = require('../dbMysql');

function Migration() { }

Migration.makeDatabaseConfiguration = function makeDatabaseConfiguration(databaseName) {
  const configurationText = {
    connection: 'mysql',
    database: databaseName,
    host: '127.0.0.1',
    port: '3306',
    username: 'root',
    password: '',
    engine: 'InnoDB',
    charset: 'utf8',
    collation: 'utf8_unicode_ci',
    migrationDir: `${process.cwd()}/database/migrations`,
    seederDir: `${process.cwd()}/database/seeders`,
  };

  files.checkConfigurationExist()
    .then(() => {
      files.writeConfiguration(configurationText)
        .then(() => {
          mysql.createMigrationDB()
            .then(() => {
              process.exit();
            })
            .catch(() => {
              process.exit();
            });
        })
        .catch(() => {
          process.exit();
        });
    })
    .catch(() => {
      process.stdout.write('Sorry, database config already exists.\n');
      process.exit();
    });
};

Migration.makeMigrationFile = function makeMigrationFile(migrationName) {
  const migrationText = {
    tableName: migrationName,
    field: [
      {
        name: 'id',
        type: 'increments',
        count: null,
        autoIncrement: true,
        nullable: false,
      },
    ],
  };

  files.checkDirectoryExist()
    .then(() => {
      files.checkMigrationFileExist(migrationName)
        .then(() => {
          files.writeMigration(migrationName, migrationText)
            .then(() => {
              process.stdout.write('File migration successfully created.\n');
              process.exit();
            })
            .catch(() => {
              process.exit();
            });
        })
        .catch(() => {
          process.stdout.write('Sorry, migration file already exists.\n');
          process.exit();
        });
    })
    .catch(() => {
      process.stdout.write('Sorry, create migration file failed because directory database not exist.');
      process.exit();
    });
};

Migration.run = function run() {
  mysql.connection()
    .then(() => {
      files.checkDirectoryExist()
        .then(() => {
          const dir = files.readDirectoryMigration();
          dir.forEach((migration, index) => {
            files.checkMigrationFileExist(migration)
              .then(() => {
                mysql.checkMigrationNewer(migration)
                  .then((check) => {
                    if (check.length === 0) {
                      mysql.createTable(migration)
                        .then(() => {
                          if (index === (dir.length - 1)) {
                            process.stdout.write('Migration success.\n');
                            process.exit();
                          }
                        })
                        .catch((err) => {
                          process.stdout.write(`Migration failed with error: ${err.message}\n`);
                          process.exit();
                        });
                    }
                  })
                  .catch((err) => {
                    process.stdout.write(`Sorry migration failed with error: ${err}\n`);
                  });
              })
              .catch(() => {
                process.stdout.write('Sorry, migration failed. We couldn\'t find migration file.\n');
                process.exit();
              });
          });
        })
        .catch(() => {
          process.stdout.write('Sorry, create migration file failed because directory database not exist.\n');
          process.exit();
        });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

Migration.refresh = function refresh() {
  mysql.connection()
    .then(() => {
      mysql.migrationRefresh()
        .then(() => {
          Migration.run();
        })
        .catch((err) => {
          process.stdout.write(`Migration refresh failed with error: ${err.message}\n`);
          process.exit();
        });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

Migration.rollback = function rollback() {
  mysql.connection()
    .then(() => {
      mysql.rollbackNewer()
        .then((batchNewer) => {
          mysql.removeBatchMigration(batchNewer)
            .then(() => {
              process.stdout.write('Rollback success.\n');
              process.exit();
            })
            .catch(() => {
              process.stdout.write('Rollback success but failed to remove migration log.\n');
              process.exit();
            });
        })
        .catch((rollbackError) => {
          process.stdout.write(`Sorry, rollback failed with error: ${rollbackError.message}\n`);
          process.exit();
        });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

Migration.rollbackWithStep = function rollbackWithStep(step) {
  mysql.connection()
    .then(() => {
      mysql.rollbackWithStep(step)
        .then((batchNewer) => {
          mysql.removeBatchMigration(batchNewer)
            .then(() => {
              process.stdout.write(`Rollback step ${step} success.\n`);
              process.exit();
            })
            .catch(() => {
              process.stdout.write(`Rollback step ${step} success but failed to remove migration log.\n`);
              process.exit();
            });
        });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};


module.exports = Migration;
