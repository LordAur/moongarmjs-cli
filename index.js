#! /usr/bin/env node

const program = require('commander');

const migration = require('./lib/mysql/migration');
const seeder = require('./lib/mysql/seeder');
const hellGrind = require('./lib/mysql/hellGrind');


program
  .command('make:config <driver> <databaseName>')
  .description('Make database configuration file')
  .action((driver, databaseName) => {
    migration.makeDatabaseConfiguration(databaseName);
  });

program
  .command('make:migration <name>')
  .description('Make migration file')
  .action((name) => {
    migration.makeMigrationFile(name);
  });

program
  .command('migrate')
  .description('Migrate from newer file migration')
  .action(() => {
    migration.run();
  });

program
  .command('migrate:refresh')
  .description('Run migration file again and re-creates database')
  .action(() => {
    migration.refresh();
  });

program
  .command('migrate:rollback')
  .description('To rollback the latest migration operation')
  .option('--step <step>', 'To rollback limited migration by providing the step')
  .action((options) => {
    if (options.step === undefined) {
      migration.rollback();
    } else if (options.step !== undefined) {
      migration.rollbackWithStep(options.step);
    }
  });

program
  .command('show:migration')
  .description('Help you to show your migration history')
  .action(() => {
    migration.showList();
  });

program
  .command('make:seeder <tableName>')
  .description('To help you seeding database with test data')
  .action((tableName) => {
    seeder.make(`${tableName}.json`);
  });

program
  .command('run:seeder')
  .description('Run seeder for inserting to database')
  .action(() => {
    seeder.run();
  });

program
  .command('hellgrind')
  .description('Run query for testing')
  .action(() => {
    const x = process.stdout.write('Hellgrind is run:\n\n');
    x.close();
    hellGrind.main(1);
  });

program.parse(process.argv);
