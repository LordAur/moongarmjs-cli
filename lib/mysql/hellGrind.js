const readline = require('readline');

const files = require('../files');
const mysql = require('../dbMysql');

<<<<<<< HEAD
hellGrind.all = function all(params) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`SELECT * FROM \`${params}\` `, (err, data) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(data);
    });
  });
};

hellGrind.first = function first(params) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`SELECT * FROM \`${params}\` LIMIT 1 `, (err, data) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(data);
    });
  });
};

hellGrind.test = function test() {
=======
function hellGrind() {}

function makeHellgrindFile() {
>>>>>>> 0ad9787f6654d3d4a8936d4274aa5c8b7c25dbb9
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
<<<<<<< HEAD
};
function printResult(query) {
  query.forEach((item) => {
    const len = Object.keys(item).length;
    Object.keys(item).forEach((key) => {
      const index = Object.keys(item).indexOf(key);
      if (index === 0) process.stdout.write('{\n');
      process.stdout.write(`  ${key}: ${item[key]}\n`);
      if (index + 1 === len) process.stdout.write('}\n\n');
    });
  });
}

hellGrind.main = function main() {
  Db.connection().then((data) => {
    if (data === null) {
      hellGrind.test().then((input) => {
        const hrstart = process.hrtime();
        hellGrind.first(input).then((query) => {
          printResult(query);
          const hrend = process.hrtime(hrstart);
          process.stdout.write(`Execution time : ${hrend[1] / 1000000}ms`);
          main();
        });
=======
}

hellGrind.main = function main() {
  mysql.connection()
    .then(() => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
>>>>>>> 0ad9787f6654d3d4a8936d4274aa5c8b7c25dbb9
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
