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
