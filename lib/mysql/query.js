const randomstring = require('randomstring');

function Query() { }

Query.build = function build(data, callback) {
  const tmpQuery = [];
  if (data.type === 'increments') {
    tmpQuery.push(`\`${data.name}\` int UNSIGNED PRIMARY KEY AUTO_INCREMENT`);
  } else if (data.type !== 'increments' || data.count === undefined) {
    tmpQuery.push(`\`${data.name}\` ${data.type}`);
  } else if (data.type === 'int') {
    tmpQuery.push(`\`${data.name}\` ${data.type}(10)`);
  } else if (data.type === 'varchar' && data.count === undefined) {
    tmpQuery.push(`\`${data.name}\` ${data.type}(255)`);
  } else if (data.type === 'varchar' && data.count !== undefined) {
    tmpQuery.push(`\`${data.name}\` ${data.type}(${data.count})`);
  }

  if (data.type !== 'increments' && data.primaryKey === true) {
    tmpQuery.push('PRIMARY KEY');
  }

  if (data.unique !== undefined && data.unique === true) {
    tmpQuery.push('UNIQUE');
  }

  if (data.foreign !== undefined) {
    tmpQuery.push(`UNSIGNED NOT NULL, FOREIGN KEY (\`${data.name}\`) REFERENCES \`${data.foreign[0].on}\`(\`${data.foreign[0].refrence}\`)`);

    if (data.foreign[0].onDelete === true || data.foreign[0].onDelete === undefined) {
      tmpQuery.push('ON DELETE CASCADE');
    }

    if (data.foreign[0].onUpdate === true) {
      tmpQuery.push('ON UPDATE CASCADE');
    }
  }

  if (data.default !== undefined && data.default !== null && data.default !== '') {
    tmpQuery.push(`DEFAULT '${data.default}'`);
  }

  if (data.type !== 'increments' && data.nullable !== undefined && data.nullable !== true) {
    tmpQuery.push('NOT NULL');
  }

  return callback(tmpQuery.join(' '));
};

Query.buildSeeder = function buildSeeder(json, data, callback) {
  const arrayQuery = [];

  let index = json.autoSeeding;
  if (index === undefined) {
    index = 0;
  }
  const insertQuery = [];
  Object.keys(data).forEach((field, fieldIndex) => {
    insertQuery.push(`\`${field}\``);
    if (fieldIndex === Object.keys(data).length) {
      for (let i = 0; i < index; i += 1) {
        const valueQuery = [];

        insertQuery.push(`\`${Object.keys(data)}\``);
        Object.keys(data).forEach((key) => {
          if (typeof data[key] === 'object') {
            Object.keys(data[key]).forEach((batchKey) => {
              if (batchKey === 'randomStringValue' && data[key][batchKey] === true && data[key].randomLength === undefined) {
                const stringRandom = randomstring.generate(7);
                valueQuery.push(`'${stringRandom}'`);
              }

              if (batchKey === 'randomStringValue' && data[key][batchKey] === true && data[key].randomLength !== undefined) {
                const stringRandom = randomstring.generate(data[key].randomLength);
                valueQuery.push(`'${stringRandom}'`);
              }

              if (batchKey === 'randomIntegerValue' && data[key][batchKey] === true) {
                const integerRandom = Math.random();
                valueQuery.push(`${integerRandom}`);
              }
            });
          } else if (typeof data[key] !== 'object' && Number.isInteger(data[Object.keys(data)])) {
            valueQuery.push(`${data[Object.keys(data)]}`);
          } else if (typeof data[key] !== 'object' && !Number.isInteger(data[Object.keys(data)])) {
            valueQuery.push(`'${data[Object.keys(data)]}'`);
          }
          arrayQuery.push(`INSERT INTO \`${json.tableName}\`(${insertQuery.join(', ')}) VALUES (${valueQuery.join(', ')});`);
        });
      }
    }
  });
  return callback(arrayQuery.join(' '));
};

Query.get = function get(data) {
  return new Promise((resolve, reject) => {
    const arrayField = [];
    if (data.field.length === 0 || data.field === undefined) {
      reject();
    }

    data.field.forEach((field, index) => {
      Query.build(field, (queryText) => {
        arrayField.push(queryText);
      });
      if (index === (data.field.length - 1)) {
        resolve(arrayField);
      }
    });
  });
};

Query.getAllBatch = function getAllBatch() {
  return new Promise((resolve, reject) => {
    global.dbConnection.query('SELECT * FROM `migrations` ORDER BY `id` ASC', (error, data) => {
      if (error) {
        reject(new Error(error));
      }
      resolve(data);
    });
  });
};

Query.getNewerBatch = function getNewerBatch() {
  return new Promise((resolve, reject) => {
    global.dbConnection.query('SELECT * FROM `migrations` ORDER BY `batch` DESC LIMIT 1', (error, data) => {
      if (error) {
        reject(new Error(error));
      }
      resolve(data);
    });
  });
};

Query.getListBatch = function getListBatch(batch) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`SELECT * FROM \`migrations\` WHERE \`batch\` = ${batch} ORDER BY \`migration\` DESC`, (error, data) => {
      if (error) {
        reject(new Error(error));
      }
      resolve(data);
    });
  });
};

Query.insertLogMigration = function insertLogMigration(migrationFile, batch) {
  return new Promise((resolve, reject) => {
    global.dbConnection.query(`INSERT INTO \`migrations\` (\`id\`, \`migration\`, \`batch\`) VALUES (NULL, '${migrationFile}', ${batch})`, (err) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve();
      }
    });
  });
};

Query.truncateLogMigration = function truncateLogMigration() {
  return new Promise((resolve, reject) => {
    global.dbConnection.query('TRUNCATE TABLE `migrations`', (err) => {
      if (err) {
        reject(new Error(err));
      }
      resolve();
    });
  });
};

module.exports = Query;
