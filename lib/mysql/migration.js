const prompts = require('prompts');

const files = require('../files');
const mysql = require('../dbMysql');
const query = require('./query');

function Migration() { }

Migration.makeDatabaseConfiguration = function makeDatabaseConfiguration() {
  files.checkConfigurationExist()
    .then(() => {
      const questions = [
        {
          type: 'text',
          name: 'connection',
          message: 'Enter the data-source name:',
        },
        {
          type: 'text',
          name: 'database',
          message: 'Database name:',
        },
        {
          type: 'text',
          name: 'host',
          message: 'Host:',
          initial: '127.0.0.1',
        },
        {
          type: 'text',
          name: 'port',
          message: 'Port:',
          initial: '3306',
        },
        {
          type: 'text',
          name: 'user',
          message: 'User:',
          initial: 'root',
        },
        {
          type: 'text',
          name: 'password',
          message: 'Password:',
        },
        {
          type: 'text',
          name: 'engine',
          message: 'Engine:',
          initial: 'InnoDB',
        },
        {
          type: 'text',
          name: 'charset',
          message: 'Charset:',
          initial: 'utf8',
        },
        {
          type: 'text',
          name: 'collation',
          message: 'collation:',
          initial: 'utf8_unicode_ci',
        },
        {
          type: 'confirm',
          name: 'value',
          message: 'Create configuration?',
          initial: true,
        },
      ];

      async function response() {
        const answer = await prompts(questions);

        if (answer.value === true) {
          const configurationText = {
            connection: answer.connection,
            database: answer.database,
            host: answer.host,
            port: answer.port,
            username: answer.user,
            password: answer.password,
            engine: answer.engine,
            charset: answer.charset,
            collation: answer.collation,
            migrationDir: `${process.cwd()}/database/migrations`,
            seederDir: `${process.cwd()}/database/seeders`,
          };

          files.writeConfiguration(configurationText)
            .then(() => {
              mysql.connection()
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
                  process.stdout.write('Sorry, database cannot connected.\n');
                  process.exit();
                });
            })
            .catch(() => {
              process.exit();
            });
        }
      }
      response();
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

Migration.showList = function showList() {
  mysql.connection()
    .then(() => {
      query.getAllBatch()
        .then((list) => {
          process.stdout.write('Migrations log: \n\n');
          list.forEach((text, index) => {
            process.stdout.write(`${(index + 1)}.  ==> ${text.migration}\n`);
            if (index === (list.length - 1)) {
              process.exit();
            }
          });
        })
        .catch((err) => {
          process.stdout.write(`Show migration failed with error: ${err}\n`);
          process.exit();
        });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};


module.exports = Migration;
