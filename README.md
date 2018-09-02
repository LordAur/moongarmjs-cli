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

## How to use?

### Introduction Migration
Migrations are like version control for your database, allowing your team to easily modify and share the JSON database schema. If you have changes to the database structure, you can tell your team, and then you can see your migration log.

### Generating Migrations
To create a migration, use the `make:migration` MoongarmJS-CI command

    moongarmjs-cli make:migration database_name

The new migration file will be placed in your database/migrations directory. Migration file name contains a milliseconds which allow to determine the order of the migrations.

### Migration Structure
A migration file JSON structure has a object like this:
```json
{
  "tableName": "your table name",
  "field": [
    {
      "name": "id",
      "type": "increments",
      "count": null,
      "autoIncrement": true,
      "nullable": false,
    }
  ]
}
```
|Command  |Description  |
|--|--|
| name | Table name  |
| type | Field database type like increments, int or varchar ... |
| count | Field length, you can use `null` for default length
| autoIncrement | Make your field auto-incrementing with UNSIGNED (primary key)
| nullable | Allowed field to have null value, use `true` or `false`
| unique | Make field have a unique value, use `true` or `false`
| foreign | Make a field connected with another table with a key

#### Migration foreign key JSON structure
```json
{
  "tableName": "your table name",
  "field": [
    {
      "name": "user_id",
      "type": "int",
      "count": null,
      "foreign": [
        {
          "refrence": "field name key",
          "on": "tableName",
          "onDelete": true,
          "onUpdate": false,
        }
      ]
    }
  ]
}
```
|  Command| Description  |
|--|--|
|  refrence| Field relation on another table |
|on | The table name relation|
|onDelete| Value will be deleted after relation key deleted|
| onUpdate | Value will be updated after relation key value updated




