const fs = require('fs');

function Files() { }

Files.checkDirectoryExist = function checkDirectoryExist() {
  return new Promise((resolve) => {
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
    resolve();
  });
};

Files.checkConfigurationExist = function checkConfigurationExist() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${process.cwd()}/moongarm-dbconfig.json`)) {
      reject();
    }
    resolve();
  });
};

Files.checkMigrationFileExist = function checkMigrationFileExist(migrationName) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${process.cwd()}/database/migrations/${migrationName}.json`)) {
      reject();
    }
    resolve();
  });
};

Files.writeConfiguration = function writeConfiguration(configurationText) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${process.cwd()}/moongarm-dbconfig.json`, JSON.stringify(configurationText, null, 2), (err) => {
      if (err) {
        process.stdout.write('Sorry :(, database config has failed to be created.\n');
        reject();
      } else {
        process.stdout.write('Database config was successfully created.\n');
        resolve();
      }
    });
  });
};

Files.writeMigration = function writeMigration(migrationName, migrationText) {
  return new Promise((resolve, reject) => {
    const milliseconds = new Date().getTime();
    fs.writeFile(`${process.cwd()}/database/migrations/${milliseconds}_${migrationName}.json`, JSON.stringify(migrationText, null, 2), (err) => {
      if (err) {
        process.stdout.write('Sorry :(, migration file has failed to be created.\n');
        reject();
      }
      resolve();
    });
  });
};

Files.readDirectoryMigration = function readDirectoryMigration() {
  const dir = fs.readdirSync(`${process.cwd()}/database/migrations/`);
  return dir;
};

module.exports = Files;