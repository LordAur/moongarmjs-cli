const fs = require('fs');
const program = require('commander');

const mysql = require('./dbMysql');

function checkDirExists(callback) {
  const path = process.cwd();
  if (!fs.existsSync(`${path}/database`)) {
    fs.mkdirSync(`${path}/database`);
  }

  if (!fs.existsSync(`${path}/database/migrations`)) {
    fs.mkdirSync(`${path}/database/migrations`);
  }

  if (!fs.existsSync(`${path}/database/seeders`)) {
    fs.mkdirSync(`${path}/database/seeders`);
  }

  return callback();
}

function makeConfigDB(driver, dbName) {
  if (driver !== 'mysql' && driver !== 'mongodb') {
    process.stdout.write('Sorry, moongarmjs-cli only support MySql or MongoDB\n');
  } else {
    const migrationText = {
      database: dbName,
      engine: driver,
      host: '127.0.0.1',
      port: '3306',
      username: 'root',
      password: '',
      migrationDir: `${process.cwd()}/database/migrations`,
      seederDir: `${process.cwd()}/database/seeders`,
    };

    if (fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
      process.stdout.write('Sorry, database config already exists.\n');
    } else {
      fs.writeFile(`${process.cwd()}/moongarm-dbconfig.json`, JSON.stringify(migrationText, null, 2), (err) => {
        if (err) {
          process.stdout.write('Sorry :(, database config has failed to be created.\n');
        } else {
          process.stdout.write('Database config was successfully created.\n');
        }
      });
    }
  }
}

function makeMigrationFile(name) {
  const migrationText = {
    tableName: name,
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

  checkDirExists(() => {
    if (fs.existsSync(`${process.cwd()}/database/migrations/${name}.json`)) {
      process.stdout.write('Sorry, migration file already exists.\n');
    } else if (!fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
      process.stdout.write('Sorry, database config not exists.\nPlease create dbconfig with run command\n\'moongarm-cli make:config <db_type> <database_name>\'\n');
    } else {
      fs.writeFile(`${process.cwd()}/database/migrations/${name}.json`, JSON.stringify(migrationText, null, 2), (err) => {
        if (err) {
          process.stdout.write('Sorry :(, migration file has failed to be created.\n');
        } else {
          process.stdout.write(`Migration ${name} was successfully created.\n`);
        }
      });
    }
  });
}

function migrateMysql() {
  // const files = fs.readdirSync(`${process.cwd()}/database/migrations`);
  // files.forEach((file) => {
  //   if (!fs.statSync(`${process.cwd()}/database/migrations/${file}`).isDirectory()) {
  //     fs.readFile(`${process.cwd()}/database/migrations/${file}`, 'utf8', (err, data) => {
  //       //
  //     });
  //   }
  // });
  mysql.connection();
}

program
  .command('make:config <driver> <dbName>')
  .description('Make database configuration file')
  .action((driver, dbName) => {
    makeConfigDB(driver, dbName);
  });

program
  .command('make:migration <name>')
  .description('Make migration file')
  .action((name) => {
    makeMigrationFile(name);
  });

program
  .command('migrate <driver>')
  .description('Make migration from newer')
  .action((driver) => {
    if (driver === 'mysql') {
      migrateMysql();
    }
  });

program.parse(process.argv);
