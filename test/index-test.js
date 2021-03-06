
var assert = require('assert')
var getResource = require('../index').get
var ensureResource = require('../index').ensure
var ensureFn = require('../index').ensureFn
var _ = require('underscore')

var calls
function simpleAsync(delay, callback) {
  calls++
  setTimeout(function() {
    callback(null, 1)
  }, delay);
}

describe('async-resource', function() {
  beforeEach(function() {
    calls = 0;
  });
  it ('handles initializing the resource and calls back with the resource', function(done) {
    var getSimple = getResource(simpleAsync.bind(null, 1000))
    getSimple(function(err, res) {
      assert.ifError(err)
      assert.equal(res, 1)
      done()
    })
  })
  it ('only gets called once', function(done) {
    var step = _.after(10, done)
    var getSimple = getResource(simpleAsync.bind(null, 1000))
    for (var i = 0; i < 10; i++) {
      getSimple(function(err, res) {
        assert.ifError(err)
        assert.equal(res, 1)
        assert.equal(calls, 1)
        step()
      })
    }
  })
  describe('ensure', function() {
    it ('guarantees the resource is initialized before calling the class function', function(done) {
      var Class = function() {
        this.getSimple = getResource(simpleAsync.bind(null, 1000))
      }
      Class.prototype.safe = function(a, b, callback) {
        assert.equal(calls, 1)
        assert.equal(a, 10)
        assert.equal(b, 100)
        callback()
      }
      ensureResource(Class.prototype, 'getSimple', 'safe')

      var test = new Class()
      test.safe(10, 100, function(err) {
        assert.ifError(err)
        done()
      })
    })
  })
  describe('ensureFn', function() {
    it('guarantees the resource is initialized before calling the function', function(done) {
      var safe = function(a, b, callback) {
        assert.equal(calls, 1)
        assert.equal(a, 10)
        assert.equal(b, 100)
        callback()
      }
      var getSimple = getResource(simpleAsync.bind(null, 1000))
      safe = ensureFn(safe, getSimple);
      safe(10, 100, function(err) {
        assert.ifError(err)
        safe(10, 100, function(err) {
          assert.ifError(err)
          done()
        });
      });
    });
  });
})
