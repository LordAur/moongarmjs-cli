const fs = require('fs');
const program = require('commander');

function makeConfigDB(driver, dbName, dir) {
  if (driver !== 'mysql' && driver !== 'mongodb') {
    console.log('Sorry, moongarmjs-cli only support MySql or MongoDB');
  } else {
    const migrationText = {
      database: dbName,
      engine: driver,
      host: '127.0.0.1',
      port: '3306',
      username: 'root',
      password: '',
      migrationDir: dir,
    };

    if (fs.existsSync(`${dir}/${dbName}.json`)) {
      console.log('Sorry, database config already exists.');
    } else {
      fs.writeFile(`${dir}/moongarm-dbconfig.json`, JSON.stringify(migrationText, null, 2), (err) => {
        if (err) {
          console.log('Sorry :(, database config has failed to be created.');
        } else {
          console.log('Database config was successfully created.');
        }
      });
    }
  }
}

function makeMigrationFile(name, dir) {
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

  if (fs.existsSync(`${dir}/${name}.json`)) {
    console.log('Sorry, migration file already exists.');
  } else if (!fs.existsSync(`${dir}/moongarm-dbconfig.json`)) {
    console.log('Sorry, database config not exists.\nPlease create dbconfig with run command\n\'moongarm-cli make:config <db_type> <database_name> <directory_path>\'');
  } else {
    fs.writeFile(`${dir}/${name}.json`, JSON.stringify(migrationText, null, 2), (err) => {
      if (err) {
        console.log('Sorry :(, migration file has failed to be created.');
      } else {
        console.log(`Migration ${name} was successfully created.`);
      }
    });
  }
}

program
  .command('make:migration <name> <dir>')
  .description('Make migration file')
  .action((name, dir) => {
    makeMigrationFile(name, dir);
  });

program
  .command('make:config <driver> <dbName> <dir>')
  .description('Make database configuration file')
  .action((driver, dbName, dir) => {
    makeConfigDB(driver, dbName, dir);
  });

program.parse(process.argv);
