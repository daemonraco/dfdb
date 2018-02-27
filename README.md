[![Build Status](https://travis-ci.org/daemonraco/dfdb.svg?branch=master)](https://travis-ci.org/daemonraco/dfdb)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/26894a2e6acc457386dc500559c23f9b)](https://www.codacy.com/app/daemonraco/dfdb?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=daemonraco/dfdb&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/821ae90c8840339c310f/maintainability)](https://codeclimate.com/github/daemonraco/dfdb/maintainability)

# DocsOnFileDB
This is a very simple noSQL database stored in a zipped file.

__Warning__: This module is not intended for heavy usage, but rather a simple
solution for quick application in which you need a noSQL database, but you don't
want use a complete solution like MongoDB or others like it.

# Contents
<!-- TOC updateOnSave:true -->

- [DocsOnFileDB](#docsonfiledb)
- [Contents](#contents)
- [Installation](#installation)
- [How to use](#how-to-use)
    - [Connection](#connection)
    - [Collection](#collection)
    - [Insert a document](#insert-a-document)
    - [Update a document](#update-a-document)
    - [Remove document](#remove-document)
    - [Adding a field index](#adding-a-field-index)
    - [Search](#search)
- [More documentation](#more-documentation)
- [Licence](#licence)

<!-- /TOC -->

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
const { DocsOnFileDB } = require('dfdb');
let db = false;
DocsOnFileDB.connect('mydb', __dirname).then(conn => {
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
myCollection.search({ name: 'Jane Doe', age: { $gt: 37 } }).then(docs => {
    // . . .
});

// Or
myCollection.searchOne({ name: 'Jane Doe', age: { $gt: 37 } }).then(doc => {
    // . . .
});
```
When searching for mixed index and unindexed fields, __DocsOnFileDB__ will first
look for documents that match indexed field conditions, and then filter by
unindexed conditions.

# More documentation
Here's some other documentation you may want to visit:
* [Manager](docs/manager.md)
* [Connections](docs/connections.md)
* [Collections](docs/collections.md)

# Licence
MIT &copy; 2018 [Alejandro Dario Simi](http://daemonraco.com)
