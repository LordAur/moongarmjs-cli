const files = require('../files');

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

module.exports = Seeder;
