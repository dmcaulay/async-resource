# async-resource

This is a simple interface for initializing async resources. Send it an init function and it will return a function that calls back with your initialized resource. It ensures that the resource will only be initialized once.

## Installation

```bash
$ npm install async-resource
```

## Usage

With a class.

``` js
// DB client has a bunch of setup that requires async calls
var DBClient = require('db').Client;


var getResource = require('async-resource').get
var ensureResource = require('async-resource').ensure

function DbWrapper(connectionUrl, config) {
  var self = this;

  // wrap the init method with getResource
  this.ensureConnected = getResource(function(callback) {
    DbClient.connect(connectionUrl, function(err, db) {
      if (err) return callback(err)
      self.db = db;

      // make sure to callback with true if the setup is successful
      if (!config.indexes) return callback(null, true);
      setupIndexes(db, config.indexes, function(err) {
        callback(err, true);
      });
    });
  })
};

// simple methods that depend on a connected db.
// a real wrapper would most likely have more complicted
// methods.
DbWrapper.prototype.select = function(query, callback) {
  this.db.select(query, callback);
};

DbWrapper.prototype.insert = function(query, callback) {
  this.db.insert(query, callback);
};

DbWrapper.prototype.update = function(query, callback) {
  this.db.update(query, callback);
};

DbWrapper.prototype.delete = function(query, callback) {
  this.db.delete(query, callback);
};

// wrap all the methods that depend on the connected DB
ensureResource(DbWrapper.prototype, 'ensureConnected', [ 'select', 'insert', 'update', 'delete' ]);
```

With a function.

``` js
// DB client has a bunch of setup that requires async calls
var DBClient = require('db').Client;


var getResource = require('async-resource').get
var ensureFn = require('async-resource').ensureFn

var db;

var init = function(callback) {
  DbClient.connect(connectionUrl, function(err, db) {
    if (err) return callback(err)
    db = db;

    // make sure to callback with true if the setup is successful
    if (!config.indexes) return callback(null, true);
    setupIndexes(db, config.indexes, function(err) {
      callback(err, true);
    });
  });
};
var ensureInit = getResource(init);

var select = function(query, callback) {
  db.select(query, callback);
};
// wrap select
select = ensureFn(select, ensureInit);
```
