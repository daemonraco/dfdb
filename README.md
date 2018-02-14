![TravisCI Master](https://api.travis-ci.org/daemonraco/dfdb.svg?branch=master)

# DocsOnFileDB
This is a very simple noSQL database stored in a zipped file.

# Installation
To install this module you may run:
```
npm install --save dfdb
```

# How to use
These are some basic examples you can take to use this library.

## Connection
Getting connected to a database:
```js
const dfdb = require().DocsOnFileDB;
let db = false;
dfdb.connect('mydb', __dirname).then(conn => {
    db = conn;
});
```
If such database file doesn't exist, it will be created.

## Collection
Retriving a collection pointer:
```js
let myCollection = false;
db.collection('my_collection').then(collection => {
    myCollection = collection;
});
```
If such collection does not exist, it's created and initialized.

## Insert a document
Adding a document to a collection:
```js
myCollection.insert({
    name: 'John Doe',
    age: 32,
    address: {
        street: 'Washington'
        number: '233'
    }
}).then(insertedDoc => {
    // . . .
});
```

## Update a document
Updating/replacing a document with ID `10` in a collection:
```js
myCollection.update(10, {
    name: 'Jane Doe',
    age: 45,
    address: {
        street: 'Paris'
        number: '1521'
    }
}).then(updatedDoc => {
    // . . .
});
```

## Remove document
Removing a document with ID `10`:
```js
myCollection.remove(10).then(() => {
    // . . .
});
```

## Adding a field index
Adding an index for field `name`:
```js
myCollection.addFieldIndex('name').then(() => {
    // . . .
});
```
This is required because only indexed fields can be search without incurring in
long response time.

## Search
Searching for a document using only indexed fields:
```js
myCollection.find({ name: 'Jane Doe' }).then(docs => {
    // . . .
});

// Or
myCollection.findOne({ name: 'Jane Doe' }).then(doc => {
    // . . .
});
```

Searching for a document using indexed and unindexed fields:
```js
myCollection.search({ name: 'Jane Doe' }).then(docs => {
    // . . .
});

// Or
myCollection.searchOne({ name: 'Jane Doe' }).then(doc => {
    // . . .
});
```
When searching for mixed index and unindexed fields, __DocsOnFileDB__ will first
look for documents that match indexed field conditions, and then filter by
unindexed conditions.

# Licence
MIT &copy; 2018 [Alejandro Dario Simi](http://daemonraco.com)
