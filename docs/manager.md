# DocsOnFileDB: Manager

# Contents
<!-- TOC updateOnSave:true -->

- [DocsOnFileDB: Manager](#docsonfiledb-manager)
- [Contents](#contents)
- [Manager](#manager)
    - [Accessing the manager](#accessing-the-manager)
    - [Connection to a database](#connection-to-a-database)
    - [Dropping a database](#dropping-a-database)

<!-- /TOC -->

# Manager
All operations with __DocsOnFileDB__ start through its manager.

## Accessing the manager
```js
const { DocsOnFileDB } = require('dfdb');
```

## Connection to a database
```js
let myDB = null;
DocsOnFileDB.connect('my_database', '/path/where/my/dbs/are')
    .then(conn => {
        myDB = conn;
    })
    .catch(err => {
        console.error(`There was an error: ${err}`);
    });
```

## Dropping a database
If you want to get rid of a database and all its files. you may do this:
```js
DocsOnFileDB.dropDatabase('my_database', '/path/where/my/dbs/are')
    .then(() => {
        console.log('Database permanently removed');
    })
    .catch(err => {
        console.error(`There was an error: ${err}`);
    });
```
