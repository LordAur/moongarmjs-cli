const files = require('../files');
const mysql = require('../dbMysql');

function Seeder() { }

Seeder.make = function make(seedingName) {
  files.checkSeederExist()
    .then(() => {
      const seedingText = {
        tableName: seedingName,
        batch: [
          {
            field: 'id',
          },
        ],
        autoSeeding: 1,
      };

      files.writeSeeder(seedingName, seedingText)
        .then(() => {
          process.exit();
        })
        .catch(() => {
          process.exit();
        });
    })
    .catch(() => {
      process.stdout.write('Seeder file has alredy exist.\n');
      process.exit();
    });
};

Seeder.run = function run() {
  mysql.connection()
    .then(() => {
      const dir = files.readDirectorySeeder();
      dir.forEach((seeder, index) => {
        mysql.seeding(seeder)
          .then(() => {
            if (index === (dir.length - 1)) {
              process.stdout.write('Seeding database success.\n');
              process.exit();
            }
          })
          .catch(() => {
            process.exit();
          });
      });
    })
    .catch(() => {
      process.stdout.write('Sorry, database cannot connected.\n');
      process.exit();
    });
};

module.exports = Seeder;
