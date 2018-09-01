const readline = require('readline');
const fs = require('fs');
const mysql = require('mysql');

function Grind() {}

Grind.connection = function connection() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
      fs.readFile(`${process.cwd()}/moongarm-dbconfig.json`, 'utf8', (err, data) => {
        if (err) {
          process.stdout.write('Sorry, dbconfig cannot read.\n');
          reject(err);
        } else {
          const configJson = JSON.parse(data);
          global.dbConnection = mysql.createConnection({
            host: configJson.host,
            port: configJson.port,
            user: configJson.username,
            password: configJson.password,
            database: configJson.database,
          });
          global.dbConnection.connect((status) => {
            if (status !== null) console.log(status.code);
            else resolve(status);
          });
        }
      });
    } else {
      process.stdout.write('Sorry, database config not exists.\nPlease create dbconfig with run command\n\'moongarm-cli make:config <db_type> <database_name>\'\n');
      reject();
    }
  });
};

Grind.all = function all(params) {
  // const params = 'Users';
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`SELECT * FROM \`${params}\` `, (err, data) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(data);
    });
  });
};

Grind.test = function test() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const prefix = 'HellGrind ==> ';
  rl.setPrompt(prefix, prefix.length);
  rl.prompt();
  return new Promise((resolve) => {
    rl.on('line', (input) => {
      if (input === 'Exit' || input === 'exit') process.exit();
      else {
        resolve(input);
        rl.close();
      }
    });
  });
};

module.exports = Grind;
