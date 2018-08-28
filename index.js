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
    process.exit();
  } else {
    const migrationText = {
      connection: driver,
      database: dbName,
      host: '127.0.0.1',
      port: '3306',
      username: 'root',
      password: '',
      engine: 'InnoDB',
      charset: 'utf8',
      collation: 'utf8_unicode_ci',
      migrationDir: `${process.cwd()}/database/migrations`,
      seederDir: `${process.cwd()}/database/seeders`,
    };

    if (fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
      process.stdout.write('Sorry, database config already exists.\n');
      process.exit();
    } else {
      fs.writeFile(`${process.cwd()}/moongarm-dbconfig.json`, JSON.stringify(migrationText, null, 2), (err) => {
        if (err) {
          process.stdout.write('Sorry :(, database config has failed to be created.\n');
          process.exit();
        } else {
          process.stdout.write('Database config was successfully created.\n');
          process.exit();
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
      process.exit();
    } else if (!fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
      process.stdout.write('Sorry, database config not exists.\nPlease create dbconfig with run command\n\'moongarm-cli make:config <db_type> <database_name>\'\n');
      process.exit();
    } else {
      fs.writeFile(`${process.cwd()}/database/migrations/${name}.json`, JSON.stringify(migrationText, null, 2), (err) => {
        if (err) {
          process.stdout.write('Sorry :(, migration file has failed to be created.\n');
          process.exit();
        } else {
          process.stdout.write(`Migration ${name} was successfully created.\n`);
          process.exit();
        }
      });
    }
  });
}

function migrateMysql() {
  mysql.connection()
    .then((data) => {
      if (data === null) {
        checkDirExists(() => {
          if (!fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
            process.stdout.write('Sorry, database config not exists.\nPlease create dbconfig with run command\n\'moongarm-cli make:config <db_type> <database_name>\'\n');
            process.exit();
          } else {
            fs.readdirSync(`${process.cwd()}/database/migrations/`).forEach((file) => {
              mysql.createTable(file)
                .then(() => {
                  process.stdout.write('Migration finished.\n');
                  process.exit();
                })
                .catch((err) => {
                  process.stdout.write(`Migration failed with error: ${err.message}`);
                  process.exit();
                });
            });
          }
        });
      }
    })
    .catch(() => {
      process.exit();
    });
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
