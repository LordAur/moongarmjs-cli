const chalk = require('chalk');

const files = require('../files');
const mysql = require('../dbMysql');
const query = require('./query');
const question = require('../question');

function Migration() { }

Migration.makeDatabaseConfiguration = function makeDatabaseConfiguration() {
  files.checkConfigurationExist()
    .then(() => {
      const questionList = [
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

      question.on(questionList)
        .then((answer) => {
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
                    process.stdout.write(chalk.red.bold('Sorry, database cannot connected.\n'));
                    process.exit();
                  });
              })
              .catch(() => {
                process.exit();
              });
          }
        });
    })
    .catch(() => {
      process.stdout.write(chalk.red.bold('Sorry, database config already exists.\n'));
      process.exit();
    });
};

Migration.makeMigrationFile = function makeMigrationFile(migrationName) {
  const fields = [];
  process.stdout.write(`Let's add some field at table ${chalk.blue.bold(migrationName)}.\n`);

  const recursiveMakeFile = () => {
    const migrationText = {
      tableName: migrationName,
      field: fields,
    };
    files.checkDirectoryExist()
      .then(() => {
        files.checkMigrationFileExist(migrationName)
          .then(() => {
            files.writeMigration(migrationName, migrationText)
              .then(() => {
                process.stdout.write(chalk.green.bold('File migration successfully created.\n'));
                process.exit();
              })
              .catch(() => {
                process.exit();
              });
          })
          .catch(() => {
            process.stdout.write(chalk.red.bold('Sorry, migration file already exists.\n'));
            process.exit();
          });
      })
      .catch(() => {
        process.stdout.write(chalk.red.bold('Sorry, create migration file failed because directory database not exist.\n'));
        process.exit();
      });
  };


  const recursiveQuestion = () => {
    const questionList = [
      {
        type: 'text',
        name: 'name',
        message: 'Field name:',
      },
      {
        type: 'select',
        name: 'type',
        message: 'Field type:',
        choices: [
          { title: 'INT', value: 'int' },
          { title: 'TINYINT', value: 'tinyint' },
          { title: 'SMALLINT', value: 'smallint' },
          { title: 'MEDIUMINT', value: 'mediumint' },
          { title: 'BIGINT', value: 'bigint' },
          { title: 'DECIMAL', value: 'decimal' },
          { title: 'FLOAT', value: 'float' },
          { title: 'DOUBLE', value: 'double' },
          { title: 'REAL', value: 'real' },
          { title: 'BIT', value: 'bit' },
          { title: 'BOOLEAN', value: 'boolean' },
          { title: 'CHAR', value: 'char' },
          { title: 'VARCHAR', value: 'varchar' },
          { title: 'TEXT', value: 'text' },
          { title: 'DATE', value: 'date' },
          { title: 'DATETIME', value: 'datetime' },
          { title: 'TIMESTAMP', value: 'timestamp' },
          { title: 'TIME', value: 'time' },
          { title: 'YEAR', value: 'year' },
          { title: 'TEXT', value: 'text' },
        ],
      },
    ];
    question.on(questionList)
      .then((answer) => {
        if (answer.type === 'int' || answer.type === 'tinyint' || answer.type === 'smallint' || answer.type === 'mediumint' || answer.type === 'bigint') {
          const questionList2 = [
            {
              type: 'toggle',
              name: 'autoIncrement',
              message: 'Auto Increment?',
              initial: false,
              active: 'true',
              inactive: 'false',
            },
          ];
          question.on(questionList2)
            .then((answer2) => {
              if (answer2.autoIncrement === false) {
                const questionList3 = [
                  {
                    type: 'toggle',
                    name: 'foreignKey',
                    message: 'Is related with another table?',
                    initial: false,
                    active: 'true',
                    inactive: 'false',
                  },
                ];
                question.on(questionList3)
                  .then((answer3) => {
                    if (answer3.foreignKey === true) {
                      const questionList4 = [
                        {
                          type: 'text',
                          name: 'on',
                          message: 'Related table name?',
                        },
                        {
                          type: 'text',
                          name: 'refrence',
                          message: 'Related field name?',
                        },
                        {
                          type: 'toggle',
                          name: 'onDelete',
                          message: 'Related on delete?',
                          initial: true,
                          active: 'true',
                          inactive: 'false',
                        },
                        {
                          type: 'toggle',
                          name: 'onUpdate',
                          message: 'Related on update?',
                          initial: false,
                          active: 'true',
                          inactive: 'false',
                        },
                        {
                          type: 'toggle',
                          name: 'continue',
                          message: 'Continue adding field?',
                          initial: true,
                          active: 'true',
                          inactive: 'false',
                        },
                      ];
                      question.on(questionList4)
                        .then((answer4) => {
                          const tmpField = {
                            name: answer.name,
                            type: answer.type,
                            autoIncrement: answer3.autoIncrement,
                            foreign: [
                              {
                                refrence: answer4.refrence,
                                on: answer4.on,
                                onDelete: answer4.onDelete,
                                onUpdate: answer4.onUpdate,
                              },
                            ],
                          };
                          fields.push(tmpField);
                          if (answer4.continue === true) {
                            process.stdout.write(chalk.white.bold('\n\nLet\'s added another field.\n'));
                            recursiveQuestion();
                          } else {
                            recursiveMakeFile();
                          }
                        });
                    } else {
                      const questionList4 = [
                        {
                          type: 'toggle',
                          name: 'continue',
                          message: 'Continue adding field?',
                          initial: true,
                          active: 'true',
                          inactive: 'false',
                        },
                      ];
                      question.on(questionList4)
                        .then((answer4) => {
                          if (answer4.continue === true) {
                            process.stdout.write(chalk.white.bold('\n\nLet\'s added another field.\n'));
                            recursiveQuestion();
                          } else {
                            recursiveMakeFile();
                          }
                        });
                    }
                  });
              } else {
                const questionList3 = [
                  {
                    type: 'toggle',
                    name: 'continue',
                    message: 'Continue adding field?',
                    initial: true,
                    active: 'true',
                    inactive: 'false',
                  },
                ];
                question.on(questionList3)
                  .then((answer3) => {
                    const tmpField = {
                      name: answer.name,
                      type: 'increments',
                      autoIncrement: answer2.autoIncrement,
                      nullable: false,
                    };
                    fields.push(tmpField);
                    if (answer3.continue === true) {
                      process.stdout.write(chalk.white.bold('\n\nLet\'s added another field.\n'));
                      recursiveQuestion();
                    } else {
                      recursiveMakeFile();
                    }
                  });
              }
            });
        } else {
          const questionList2 = [
            {
              type: 'number',
              name: 'length',
              message: 'Field length:',
            },
            {
              type: 'toggle',
              name: 'nullable',
              message: 'Allowed null value?',
              initial: false,
              active: 'true',
              inactive: 'false',
            },
          ];
          question.on(questionList2)
            .then((answer2) => {
              if (answer2.nullable === false) {
                const questionList3 = [
                  {
                    type: 'text',
                    name: 'default',
                    message: 'Field default value:',
                  },
                  {
                    type: 'toggle',
                    name: 'unique',
                    message: 'Activate unique value?',
                    initial: false,
                    active: 'true',
                    inactive: 'false',
                  },
                ];
                question.on(questionList3)
                  .then((answer3) => {
                    const questionList4 = [
                      {
                        type: 'toggle',
                        name: 'continue',
                        message: 'Continue adding field?',
                        initial: true,
                        active: 'true',
                        inactive: 'false',
                      },
                    ];
                    question.on(questionList4)
                      .then((answer4) => {
                        const tmpField = {
                          name: answer.name,
                          type: answer.type,
                          count: answer2.length,
                          default: answer3.default,
                          nullable: answer2.nullable,
                          unique: answer3.unique,
                        };
                        fields.push(tmpField);
                        if (answer4.continue === true) {
                          process.stdout.write(chalk.white.bold('\n\nLet\'s added another field.\n'));
                          recursiveQuestion();
                        } else {
                          recursiveMakeFile();
                        }
                      });
                  });
              } else {
                const questionList4 = [
                  {
                    type: 'toggle',
                    name: 'continue',
                    message: 'Continue adding field?',
                    initial: true,
                    active: 'true',
                    inactive: 'false',
                  },
                ];
                question.on(questionList4)
                  .then((answer4) => {
                    const tmpField = {
                      name: answer.name,
                      type: answer.type,
                      count: answer2.length,
                    };
                    fields.push(tmpField);
                    if (answer4.continue === true) {
                      process.stdout.write(chalk.white.bold('\n\nLet\'s added another field.\n'));
                      recursiveQuestion();
                    } else {
                      recursiveMakeFile();
                    }
                  });
              }
            });
        }
      });
  };
  recursiveQuestion();
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
