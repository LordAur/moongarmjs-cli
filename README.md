# MOONGARMJS-CLI DEVELOPMENT

## What is MoongarmJs-CLI?
MoongarmJs-CLI is the command-line interface like Artisan Console Laravel. It provides a number of helpful commands that can assist you while you build application. 

MoongarmJS-CLI still in the development phase.

## Requirements
*  NodeJS >= 8.9.0

## Features
*  Migration database (Mysql only for now)
*  Seeding database   (Mysql only for now)
*  Rollback database  (Mysql only for now)

## Installation

    npm install -g moongarmjs-cli

## How to use?

### Introduction Migration
Migrations are like version control for your database, allowing your team to easily modify and share the JSON database schema. If you have changes to the database structure, you can tell your team, and then you can see your migration log.

### Create configuration
To create Moongarm configuration, use the `datasource` MoongarmJS-CLI command
![](https://yudhapratama.com/files/render1542082808523.gif)

### Generating Migrations
To create a migration, use the `make:migration` MoongarmJS-CI command

    moongarm make:migration table_name

![](https://yudhapratama.com/files/render1542083370998.gif)
The new migration file will be placed in your database/migrations directory. Migration file name contains a milliseconds which allow to determine the order of the migrations.

### Running Migrations
To run all migration file, execute `migrate` command

    moongarm migrate
### Rolling Back Migrations
To rollback the latest migration, you can execute `migrate:rollback` command

    moongarm migrate:rollback
You may rollback with a step migration. You can look at table migrations on the database.

    moongarm migrate:rollback --step=3
### Rollback & Migrate Again
You can run migrate and will rollback all of your migration. This command effectively re-creates your entire database.

    moongarm migrate:refresh

 ### Introduction Seeders
Simple method of seeding your database with test data using seed JSON scheme. All seed scheme are stored in directory `database/seeds`. 
### Make Seeders
To generate a seeder, execute `make:seeder` command.

    moongarm make:seeder
![](https://yudhapratama.com/files/render1542083787170.gif)
### Run Seeders
You may use `run:seeder` command for run seeding and inserting to your database

    moongarm run:seeder





