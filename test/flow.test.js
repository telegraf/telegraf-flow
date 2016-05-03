var Telegraf = require('telegraf')
var should = require('should')
var Flow = require('../lib/flow')

describe('Telegraf Flow', function () {
  describe('Handlebars', function () {
    it('should export Handlebars', function(done){
      Flow.should.have.property('Handlebars')
      done()
    })
  })
})
