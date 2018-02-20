# DocsOnFileDB: Collections
This document provides examples and some explanation on how to access and use
collections in __DocsOnFileDB__.

# Contents
<!-- TOC updateOnSave:true -->

- [DocsOnFileDB: Collections](#docsonfiledb-collections)
- [Contents](#contents)
- [Accessing a collection](#accessing-a-collection)
- [Manipulating data](#manipulating-data)
    - [Inserting a new document](#inserting-a-new-document)
    - [Updating/Replacing a document](#updatingreplacing-a-document)
    - [Partially updating a document](#partially-updating-a-document)
    - [Deleting a document](#deleting-a-document)
    - [Deleting all documents](#deleting-all-documents)
- [Searching documents](#searching-documents)
- [Indexes](#indexes)
    - [Checking a field index](#checking-a-field-index)
    - [Listing indexes](#listing-indexes)
    - [Adding an index to a field](#adding-an-index-to-a-field)
    - [Removing a field's index](#removing-a-fields-index)
    - [Rebuilding a field's index](#rebuilding-a-fields-index)
- [Schemas](#schemas)
    - [Accessing a collection's schema](#accessing-a-collections-schema)
    - [Setting/Replacing a collection's schema](#settingreplacing-a-collections-schema)
    - [Removing a collection's schema](#removing-a-collections-schema)
- [Errors](#errors)
- [Collection Administration](#collection-administration)
    - [Closing a collection](#closing-a-collection)
    - [Dropping collection](#dropping-collection)

<!-- /TOC -->

# Accessing a collection
Access to a certain collection can be obtained from a connection:
```js
let myCollection = false;
db.collection('my_collection').then(collection => {
    myCollection = collection;
    console.log(myCollection.name()); // prompts: 'my_collection'
});
```

# Manipulating data
## Inserting a new document
```js
let myDocData = {
    name: 'John Doe',
    age: 32,
    username: 'john.doe'
};
myCollection.insert(myDocData)
    .then(insertedDoc => {
        console.log(JSON.stringify(insertedDoc, null, 2));
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

## Updating/Replacing a document
```js
let newData = {
    name: 'Jane Doe',
    age: 34,
    username: 'jane.doe',
    tags: ['tag1', 'tag2']
};
myCollection.update(123, newData)
    .then(updatedDoc => {
        console.log(JSON.stringify(updatedDoc, null, 2));
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

## Partially updating a document
`partialUpdate()` is similar to `update()`, but instead of completely repacing
the current document, it merges with the provided data.
```js
let newPartialData = {
    age: 35,
    address: 'Some Street 234'
};
myCollection.partialUpdate(123, newPartialData)
    .then(updatedDoc => {
        console.log(JSON.stringify(updatedDoc, null, 2));
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

## Deleting a document
```js
myCollection.remove(123)
    .then(() => {
        console.log(`Document removed.`);
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

## Deleting all documents
```js
myCollection.truncate()
    .then(() => {
        console.log(`Collection emptied.`);
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

# Searching documents
To search documents by values in their fields you can use one of this examples,
even if those fields have no index associated:
```js
myCollection.search({
    age: 32
}).then(docs => {
    console.log(`Found documents: ${docs.length}`);
    console.log(`Findings:`);
    console.log(JSON.stringify(docs, null, 2));
}).catch(err => {
    console.err(`There was an error. ${err}`);
});
```

If you only want the first one (if there's any):
```js
myCollection.searchOne({
    age: 32
}).then(doc => {
    console.log(JSON.stringify(docs, null, 2));
}).catch(err => {
    console.err(`There was an error. ${err}`);
});
```

If you want to make sure that your search uses indexes and doesn't try to use a
heavy logic, try these examples:
```js
myCollection.find({
    age: 32
}).then(docs => {
    console.log(`Found documents: ${docs.length}`);
    console.log(`Findings:`);
    console.log(JSON.stringify(docs, null, 2));
}).catch(err => {
    console.err(`There was an error. ${err}`);
});
```

Or:
```js
myCollection.findOne({
    age: 32
}).then(doc => {
    console.log(JSON.stringify(docs, null, 2));
}).catch(err => {
    console.err(`There was an error. ${err}`);
});
```

Remember that using `find()` and `findOne()` with unindexed fields, this will cause a promise rejection.

# Indexes
## Checking a field index
```js
console.log(myCollection.hasIndex('age'));
```

## Listing indexes
```js
console.log(JSON.stringify(myCollection.indexes(), null, 2));
```

## Adding an index to a field
```js
myCollection.addFieldIndex('age')
    .then(() => {
        console.log('Index added.');
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```
__Note__: This usually takes a moment because it auto index current documents.

## Removing a field's index
```js
myCollection.dropFieldIndex('age')
    .then(() => {
        console.log('Index removed.');
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

## Rebuilding a field's index
```js
myCollection.rebuildFieldIndex('age')
    .then(() => {
        console.log('Index rebuilt.');
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

# Schemas
Schemas allows you to enforce that documents inside a collection follow certain
format.

__DocsOnFileDB__ internally uses [AJV](https://www.npmjs.com/package/ajv),
therefore it follows [JSON Schema](http://json-schema.org) specifications, check
them for more information on how to use specify schemas.

## Accessing a collection's schema
```js
console.log(myCollection.hasSchema());
console.log(JSON.stringify(myCollection.schema(), null, 2));
```

## Setting/Replacing a collection's schema
```js
const mySchema = {
    type: 'object',
    properties: {
        name: { type: 'boolean' },
        age: { type: 'integer' },
        username: { type: 'string' },
        tags: { type: 'array', default: [] }
    },
    required: ['name', 'age', 'username']
};
myCollection.setSchema(mySchema)
    .then(() => {
        console.log('Schema validated, assigned and applied.');
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

## Removing a collection's schema
```js
myCollection.removeSchema()
    .then(() => {
        console.log('Schema removed.');
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

# Errors
Every operation on a collection that throw errors will set an internal error
message naming the error. If you want, you can access such error through these
methods:
```js
console.log(`Were there an error?`, myCollection.error());
console.log(`What did it say?`, myCollection.lastError());
```

# Collection Administration
## Closing a collection
If you want to free some memory, you may close those collection you're not
currently using:
```js
myCollection.close()
    .then(() => {
        console.log('Collection closed.');
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```

## Dropping collection
Permanently removing a collection and all its data:
```js
myCollection.drop()
    .then(() => {
        console.log('Collection deleted.');
    })
    .catch(err => {
        console.err(`There was an error. ${err}`);
    });
```
