var Alexa = require('alexa-sdk')

var constants = require('./constants/constants')
var tacoGivingStateHandler = require('./handlers/tacoGivingStateHandler')
var mainStateHandler = require('./handlers/mainStateHandler')
var initStateHandler = require('./handlers/initStateHandler')

exports.handler = function (event, context, callback) {
  var alexa = Alexa.handler(event, context)
  alexa.registerHandlers(
    tacoGivingStateHandler,
    mainStateHandler,
    initStateHandler
  )
  alexa.execute()
}
