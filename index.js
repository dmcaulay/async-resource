
// waitForAsync queues up tasks behind one function
// for example:
// if you need to connect to a db before you can do any queries you would write something like
// if (!connected) {
//   waitForAsync(connect, function(err) {
//     // do whatever you want
//   });
// } // else your're connected so you can proceed normally
// you don't really want an async.queue because you're only waiting for the connection to
// complete before moving forward

var _ = require('underscore')

var waitForAsync = module.exports.waitForAsync = function () {
  var waiting = false,
      queuedTasks = [];

  return function(fn, callback) {
    queuedTasks.push(callback);
    if (waiting) return;
    waiting = true;
    fn(function() {
      waiting = false;
      var args = arguments;
      queuedTasks.forEach(function(task) { task.apply(null, args); });
      queuedTasks = [];
    });
  };
};

var get = module.exports.get = function (getResourceFn) {
  var wait = waitForAsync();
  var resource;
  return function (callback) {
    if (!resource) {
      return wait(getResourceFn, function(err, result) {
        if (err) return callback(err);
        resource = result;
        if(callback) callback(null, resource);
      });
    }
    if(callback) callback(null, resource);
  };
}

module.exports.ensure = function(object, getResource, methods) {
  if (!_.isArray(methods)) methods = [methods]
  methods.forEach(function(method) {
    var fn = object[method]
    object[method] = function() {
      var context = this
      var args = arguments;
      var callback = _.last(args);
      this[getResource](function(err) {
        if (err) return callback(err)
        fn.apply(context, args)
      })
    }
  })
}

module.exports.ensureFn = function(fn, getResourceFn) {
  var safeFn = function() {
    var context = this
    var args = arguments;
    var callback = _.last(args);
    get(getResourceFn)(function(err) {
      if (err) return callback(err)
      fn.apply(context, args)
    });
  };
  return safeFn;
};

