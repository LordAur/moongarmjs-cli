const fs = require('fs');
const readline = require('readline');

const files = require('../files');
const mysql = require('../dbMysql');

function hellGrind() {}

function makeHellgrindFile() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Insert table name: ', (answer) => {
    const helgrindText = {
      tableName: answer,
      models: {
        all: `SELECT * FROM \`${answer}\``,
      },
    };
    const hrstart = process.hrtime();
    files.writeHellgrind(answer, helgrindText)
      .then(() => {
        process.stdout.write('Hellgrind file has successfully created.\n');

        const hrend = process.hrtime(hrstart);
        process.stdout.write(`Execution time : ${hrend[1] / 1000000}ms\n\n`);
        process.exit();
      })
      .catch(() => {
        process.exit();
      });
  });
}

function runModel() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const prefix = 'HellGrind Model > ';
  rl.setPrompt(prefix, prefix.length);
  rl.prompt();
  rl.on('line', (input) => {
    if (input === 'stop') {
      rl.close();
      hellGrind.main();
    } else {
      const arr = input.split(':');
      fs.readFile(`${process.cwd()}/database/models/${arr[0]}.json`, 'utf8', (err, data) => {
        if (err) {
          process.stdout.write('Model cannot found.\n');
          process.exit();
        }
        const json = JSON.parse(data);
        if (json.models[arr[1]] !== undefined) {
          const hrstart = process.hrtime();
          mysql.connection()
            .then(() => {
              if (typeof json.models[arr[1]] === 'object') {
                let i = 0;
                let queryText = json.models[arr[1]].query;

                const recursiveAsyncReadLine = () => {
                  if (json.models[arr[1]].params.length !== i) {
                    const parameterArray = json.models[arr[1]].params[i].split(':');
                    const parameter = parameterArray[0];
                    rl.question(`${parameter} = `, (answer) => {
                      if (parameterArray[1] === 'field') {
                        queryText = queryText.replace(`{${parameter}}`, `\`${answer}\``);
                      }
                      if (parameterArray[1] === 'string') {
                        queryText = queryText.replace(`{${parameter}}`, `'${answer}'`);
                      }
                      if (parameterArray[1] === 'int' || parameterArray[1] === 'function') {
                        queryText = queryText.replace(`{${parameter}}`, `${answer}`);
                      }
                      i += 1;
                      recursiveAsyncReadLine();
                    });
                  }
                  if (json.models[arr[1]].params.length === i) {
                    mysql.runQuery(queryText)
                      .then((dataModel) => {
                        process.stdout.write('\n\nResults: [\n');
                        const jsonModel = JSON.parse(JSON.stringify(dataModel));
                        jsonModel.forEach((list) => {
                          process.stdout.write('{\n');
                          Object.keys(list).forEach((row) => {
                            process.stdout.write(`  ${row}: ${list[row]}\n`);
                          });
                          process.stdout.write('},\n');
                        });
                        process.stdout.write(']\n\n');
                        const hrend = process.hrtime(hrstart);
                        process.stdout.write(`Total Data: ${dataModel.length}\n`);
                        process.stdout.write(`Execution time : ${hrend[1] / 1000000}ms\n\n`);
                        rl.close();
                        runModel();
                      })
                      .catch((queryError) => {
                        process.stdout.write(`Query error: ${queryError}\n`);
                        process.exit();
                      });
                  }
                };
                recursiveAsyncReadLine();
              } else {
                mysql.runQuery(json.models[arr[1]])
                  .then((dataModel) => {
                    process.stdout.write(`\n\n${json.tableName}: [\n`);
                    const jsonModel = JSON.parse(JSON.stringify(dataModel));
                    jsonModel.forEach((list) => {
                      process.stdout.write('{\n');
                      Object.keys(list).forEach((row) => {
                        process.stdout.write(`  ${row}: ${list[row]}\n`);
                      });
                      process.stdout.write('},\n');
                    });
                    process.stdout.write(']\n\n');

                    const hrend = process.hrtime(hrstart);
                    process.stdout.write(`Total Data: ${dataModel.length}\n`);
                    process.stdout.write(`Execution time : ${hrend[1] / 1000000}ms\n\n`);
                    rl.close();
                    runModel();
                  })
                  .catch((queryError) => {
                    process.stdout.write(`Query error: ${queryError}\n`);
                    process.exit();
                  });
              }
            })
            .catch(() => {
              process.stdout.write('Sorry, database cannot connected.\n');
              process.exit();
            });
        }
      });
    }
  });
}
function liveQuery() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const prefix = 'HellGrind Live > ';
  rl.setPrompt(prefix, prefix.length);
  rl.prompt();
  rl.on('line', (input) => {
    if (input === 'stop') {
      rl.close();
      hellGrind.main();
    } else {
      mysql.connection()
        .then(() => {
          const hrstart = process.hrtime();
          mysql.runQuery(input)
            .then((dataModel) => {
              const jsonModel = JSON.parse(JSON.stringify(dataModel));
              process.stdout.write('\n\nResults: [\n');
              jsonModel.forEach((list) => {
                process.stdout.write(' {\n');
                Object.keys(list).forEach((row) => {
                  process.stdout.write(`  ${row}: ${list[row]}\n`);
                });
                process.stdout.write(' },\n');
              });
              process.stdout.write(']\n\n');
              const hrend = process.hrtime(hrstart);
              process.stdout.write(`Total Data: ${dataModel.length}\n`);
              process.stdout.write(`Execution time : ${hrend[1] / 1000000}ms\n\n`);
              rl.close();
              liveQuery();
            })
            .catch((queryError) => {
              process.stdout.write(`Query error: ${queryError}\n`);
              process.exit();
            });
        })
        .catch(() => {
          process.stdout.write('Sorry, database cannot connected.\n');
          process.exit();
        });
    }
  });
}

hellGrind.main = function main() {
  mysql.connection()
    .then(() => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const prefix = 'HellGrind > ';
      rl.setPrompt(prefix, prefix.length);
      rl.prompt();
      rl.on('line', (input) => {
        if (input.toLowerCase() === 'exit') process.exit();
        else if (input.toLowerCase() === 'make') makeHellgrindFile();
        else if (input.toLowerCase() === 'model') {
          rl.close();
          runModel();
        } else if (input.toLowerCase() === 'live') {
          rl.close();
          liveQuery();
        } else {
          process.stdout.write('Sorry, command not found :(\n');
          rl.close();
          hellGrind.main();
        }
      });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

module.exports = hellGrind;
