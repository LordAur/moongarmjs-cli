const program = require('commander');

const migration = require('./lib/mysql/migration');

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
  .description('Execution migration file again and re-creates database')
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

program.parse(process.argv);
