const readline = require('readline');

const mysql = require('../dbMysql');

function hellGrind() {}

function makeHellgrindFile() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Table name: ', (answer) => {
    // console.log(`Thank you for your valuable feedback: ${answer}`);
    // process.stdout.write(``)
    rl.close();
  });
}

hellGrind.main = function main() {
  mysql.connection()
    .then(() => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
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
