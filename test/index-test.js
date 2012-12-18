
var assert = require('assert')
var getResource = require('../index').get
var _ = require('underscore')

var calls
function simpleAsync(delay, callback) {
  calls++
  setTimeout(function() {
    callback(null, 1)
  }, delay);
}

describe('async-resource', function() {
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
    calls = 0
    for (var i = 0; i < 10; i++) {
      getSimple(function(err, res) {
        assert.ifError(err)
        assert.equal(res, 1)
        assert.equal(calls, 1)
        step()
      })
    }
  })
})
