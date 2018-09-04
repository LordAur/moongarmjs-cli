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

hellGrind.main = function main() {
  mysql.connection()
    .then(() => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });
      const prefix = 'HellGrind ==> ';
      rl.setPrompt(prefix, prefix.length);
      rl.prompt();
      rl.on('line', (input) => {
        if (input.toLowerCase() === 'exit') process.exit();
        if (input.toLowerCase() === 'make') makeHellgrindFile();
      });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

module.exports = hellGrind;
