const readline = require('readline');
const fs = require('fs');
const mysql = require('mysql');
const Db = require('../dbMysql');

function hellGrind() {}

hellGrind.connection = function connection() {
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
            if (status !== null) process.stdout.write(status.code);
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

hellGrind.all = function all(params) {
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

hellGrind.test = function test() {
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

hellGrind.main = function main() {
  Db.connection().then((data) => {
    if (data === null) {
      hellGrind.test().then((input) => {
        hellGrind.all(input).then((query) => {
          query.forEach((item) => {
            const len = Object.keys(item).length;
            Object.keys(item).forEach((key) => {
              const index = Object.keys(item).indexOf(key);
              if (index === 0) process.stdout.write('{\n');
              process.stdout.write(`  ${key}: ${item[key]}\n`);
              if (index + 1 === len) process.stdout.write('}\n\n');
            });
          });
          main();
        });
      });
    } else {
      process.stdout.write('Database Can\'t Connect\n\n');
    }
  }).catch(() => {
    process.exit();
  });
};

module.exports = hellGrind;
