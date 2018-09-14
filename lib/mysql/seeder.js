const chalk = require('chalk');

const files = require('../files');
const mysql = require('../dbMysql');
const question = require('../question');

function Seeder() { }

Seeder.make = function make() {
  mysql.connection()
    .then(() => {
      const batchData = [];
      mysql.getTableList()
        .then((data) => {
          const tables = [];
          data.forEach((table, index) => {
            const tmpTable = {
              title: table.Tables_in_moongarm,
              value: table.Tables_in_moongarm,
            };
            tables.push(tmpTable);
            if (index === (data.length - 1)) {
              const questionList = [
                {
                  type: 'select',
                  name: 'table',
                  message: 'Select table:',
                  choices: tables,
                },
                {
                  type: 'select',
                  name: 'type',
                  message: 'Choose type inserting:',
                  choices: [
                    { title: 'Manually', value: 'manual' },
                    { title: 'Automatic', value: 'auto' },
                  ],
                },
              ];
              question.on(questionList)
                .then((answer) => {
                  mysql.getFieldList(answer.table)
                    .then((dataField) => {
                      if (answer.type === 'manual') {
                        const fields = [];
                        dataField.forEach((field, indexField) => {
                          const tmpField = {
                            type: 'text',
                            name: field.Field,
                            message: `Insert value to field ${chalk.blue.bold(field.Field)}:`,
                          };
                          fields.push(tmpField);
                          if (indexField === (dataField.length - 1)) {
                            const tmpFieldContinue = {
                              type: 'toggle',
                              name: 'continue',
                              message: 'Continue inserting batch?',
                              initial: true,
                              active: 'true',
                              inactive: 'false',
                            };
                            fields.push(tmpFieldContinue);
                            const recursiveInsertingBatch = () => {
                              question.on(fields)
                                .then((answer2) => {
                                  const tmpBatch = {};
                                  dataField.forEach((tmp, batchIndex) => {
                                    if (answer2[tmp.Field] !== '') {
                                      tmpBatch[tmp.Field] = answer2[tmp.Field];
                                    }
                                    if (batchIndex === (dataField.length - 1)) {
                                      batchData.push(tmpBatch);
                                    }
                                  });
                                  if (answer2.continue === true) {
                                    process.stdout.write('\n\n');
                                    recursiveInsertingBatch();
                                  } else {
                                    files.checkSeederExist(`${answer.table}.json`)
                                      .then(() => {
                                        const seedingText = {
                                          tableName: answer.table,
                                          batch: batchData,
                                          autoSeeding: 1,
                                        };

                                        files.writeSeeder(`${answer.table}.json`, seedingText)
                                          .then(() => {
                                            process.exit();
                                          })
                                          .catch(() => {
                                            process.exit();
                                          });
                                      })
                                      .catch(() => {
                                        process.stdout.write('Seeder file has alredy exist.\n');
                                        process.exit();
                                      });
                                  }
                                });
                            };
                            recursiveInsertingBatch();
                          }
                        });
                      } else {
                        const fields = [];
                        dataField.forEach((field, indexField) => {
                          const tmpField = {
                            type: 'select',
                            name: field.Field,
                            message: `Insert random value to field ${chalk.blue.bold(field.Field)}:`,
                            choices: [
                              { title: 'NULL', value: 'null' },
                              { title: 'Random String', value: 'string' },
                              { title: 'Random Integer', value: 'integer' },
                            ],
                          };
                          fields.push(tmpField);
                          if (indexField === (dataField.length - 1)) {
                            const recursiveInsertingBatch = () => {
                              question.on(fields)
                                .then((answer2) => {
                                  const tmpBatch = {};
                                  dataField.forEach((tmp, batchIndex) => {
                                    if (answer2[tmp.Field] !== 'null' || answer2[tmp.Field] !== null) {
                                      if (answer2[tmp.Field] === 'string') {
                                        tmpBatch[tmp.Field] = {
                                          randomStringValue: true,
                                        };
                                      }
                                      if (answer2[tmp.Field] === 'integer') {
                                        tmpBatch[tmp.Field] = {
                                          randomIntegerValue: true,
                                        };
                                      }
                                    }
                                    if (batchIndex === (dataField.length - 1)) {
                                      batchData.push(tmpBatch);
                                    }
                                  });
                                  files.checkSeederExist(`${answer.table}.json`)
                                    .then(() => {
                                      const tmpFieldLoop = {
                                        type: 'number',
                                        name: 'loop',
                                        message: 'How much looping seeder?',
                                        initial: 1,
                                      };
                                      question.on(tmpFieldLoop)
                                        .then((answer3) => {
                                          const seedingText = {
                                            tableName: answer.table,
                                            batch: batchData,
                                            autoSeeding: answer3.loop,
                                          };
                                          files.writeSeeder(`${answer.table}.json`, seedingText)
                                            .then(() => {
                                              process.exit();
                                            })
                                            .catch(() => {
                                              process.exit();
                                            });
                                        });
                                    })
                                    .catch(() => {
                                      process.stdout.write('Seeder file has alredy exist.\n');
                                      process.exit();
                                    });
                                });
                            };
                            recursiveInsertingBatch();
                          }
                        });
                      }
                    });
                });
            }
          });
        });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

Seeder.run = function run() {
  mysql.connection()
    .then(() => {
      const dir = files.readDirectorySeeder();
      dir.forEach((seeder, index) => {
        mysql.seeding(seeder)
          .then(() => {
            if (index === (dir.length - 1)) {
              process.stdout.write('Seeding database success.\n');
              process.exit();
            }
          })
          .catch(() => {
            process.exit();
          });
      });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

module.exports = Seeder;
