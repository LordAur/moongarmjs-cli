const fs = require('fs');
const readline = require('readline');

const files = require('../files');
const mysql = require('../dbMysql');

function hellGrind() {}

function makeHellgrindFile() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  rl.question('Insert table name: ', (answer) => {
    const helgrindText = {
      tableName: answer,
      models: {
        all: `SELECT * FROM \`${answer}\``,
      },
    };
    files.writeHellgrind(answer, helgrindText)
      .then(() => {
        process.stdout.write('Hellgrind file has successfully created.\n');
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
    terminal: false,
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
          mysql.connection()
            .then(() => {
              mysql.runQuery(json.models[arr[1]])
                .then((dataModel) => {
                  process.stdout.write(`${json.tableName}: [\n`);
                  const jsonModel = JSON.parse(JSON.stringify(dataModel));
                  jsonModel.forEach((list) => {
                    process.stdout.write('{\n');
                    Object.keys(list).forEach((row) => {
                      process.stdout.write(`  ${row}: ${list[row]}\n`);
                    });
                    process.stdout.write('},\n');
                  });
                  process.stdout.write(']\n');
                  rl.close();
                  runModel();
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
  });
}

hellGrind.main = function main() {
  mysql.connection()
    .then(() => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });
      const prefix = 'HellGrind > ';
      rl.setPrompt(prefix, prefix.length);
      rl.prompt();
      rl.on('line', (input) => {
        if (input.toLowerCase() === 'exit') process.exit();
        if (input.toLowerCase() === 'make') makeHellgrindFile();
        if (input.toLowerCase() === 'model') {
          rl.close();
          runModel();
        }
      });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

module.exports = hellGrind;
