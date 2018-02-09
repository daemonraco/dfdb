![TravisCI Master](https://api.travis-ci.org/daemonraco/dfdb.svg?branch=master)

# DocsOnFilesDB
This is a very simple noSQL database stored in a zipped file.

# Installation
To install this module you may run:
```
npm install --save dfdb
```

# How to use
These are some basic examples you can take to use this library.

## Connection
Getting connected to our database:
```js
const dfdb = require().DocsOnFileDB;
let db = false;
dfdb.connect('mydb', __dirname, conn => {
    db = conn;
});
```
If such database file doesn't exist, it will be created.

## Table
Retriving a table pointer:
```js
let myTable = false;
db.table('my_table', table => {
    myTable = table;
});
```
If such table does not exist, it's created and initialized.

## Insert a document
Adding a document to a table:
```js
myTable.insert({
    name: 'John Doe',
    age: 32,
    address: {
        street: 'Washington'
        number: '233'
    }
}, insertedDoc => {
    // . . .
});
```

## Update a document
Updating/replacing a document with ID `10` in a table:
```js
myTable.update(10, {
    name: 'Jane Doe',
    age: 45,
    address: {
        street: 'Paris'
        number: '1521'
    }
}, updatedDoc => {
    // . . .
});
```

## Remove document
Removing a document with ID `10`:
```js
myTable.remove(10, () => {
    // . . .
});
```

## Adding a field index
Adding an index for field `name`:
```js
myTable.addFieldIndex('name', () => {
    // . . .
});
```
This is required because only indexed fields can be search.

## Search
Searching for a document:
```js
myTable.find({ name: 'Jane Doe' }, docs => {
    // . . .
});

// Or
myTable.findOne({ name: 'Jane Doe' }, doc => {
    // . . .
});
```

# Licence
MIT &copy; 2018 [Alejandro Dario Simi](http://daemonraco.com)
