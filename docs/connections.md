# DocsOnFileDB: Connections

# Contents
<!-- TOC updateOnSave:true -->

- [DocsOnFileDB: Connections](#docsonfiledb-connections)
- [Contents](#contents)
- [Accessing collections](#accessing-collections)
    - [Checking a collection](#checking-a-collection)
    - [Listing all collections](#listing-all-collections)
    - [Accessing a collection](#accessing-a-collection)
- [Connection management](#connection-management)
    - [Checking if it's connected](#checking-if-its-connected)
    - [Closing a connection](#closing-a-connection)
- [Errors](#errors)
- [Initializers](#initializers)
    - [Reinitializing](#reinitializing)

<!-- /TOC -->

# Accessing collections
## Checking a collection
```js
console.log(myConnection.hasCollection('my_collection'));
```

## Listing all collections
```js
console.log(JSON.stringify(myConnection.collections(), null, 2));
```

## Accessing a collection
```js
myConnection.collection('my_collection')
    .then(col => {
        console.log(col.name()); // Prompts: my_collection
    })
    .catch(err => {
        console.error(`There was an error: ${err}`);
    });
```

# Connection management
## Checking if it's connected
```js
console.log(myConnection.connected());
```

## Closing a connection
Saving changes and freeing memory:
```js
myConnection.close('my_collection')
    .then(() => {
        console.log('Connection closed');
    })
    .catch(err => {
        console.error(`There was an error: ${err}`);
    });
```

# Errors
Every operation on a connection that throw errors will set an internal error
message naming the error. If you want, you can access such error through these
methods:
```js
console.log(`Were there an error?`, myConnection.error());
console.log(`What did it say?`, myConnection.lastError());
```

# Initializers
__DocsOnFileDB__ provides a way to specify a required initial structure on a
database.
The next example how to specify a initialization structure on a database so it contains certain required assets:
```js
const specs = {
    collections: [{
        name: 'my_collections',
        indexes: [
            { field: 'username' },
            { field: 'age' }
        ],
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                age: { type: 'number' },
                data: { type: 'string', default: 'pending...' }
            },
            required: ['username', 'age']
        },
        data: [
            { username: 'daemon', age: 60 },
            { username: 'raco', age: 25 }
        ]
    }, {
        name: 'my_other_collections'
    }]
};
myConnection.setInitializerFromJSON(specs)
    .then(() => {
        console.log(`Database initializer set and applied.`);
    });
```

As you may imagine, this creates two collections called `my_collections` and
`my_other_collections`.
Also the collection `my_collections` will have:
* Two indexes assigned to fields `username` and `age`.
* A validation schema.
* Two initial documents.

## Reinitializing
If at any time you think something had been lost, you may ask a database to check and reapply the initialization running something like this:
```js
myConnection.reinitialize()
    .then(() => {
        console.log(`Database initializer set and applied.`);
    });
```