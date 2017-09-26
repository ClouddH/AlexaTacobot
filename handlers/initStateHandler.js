var Alexa = require('alexa-sdk')
var constants = require('../constants/constants')

var initStateHandler = Alexa.CreateStateHandler(constants.states.INIT, {
  'NewSession': function () {
    this.emit(':ask', 'Hello I am tacobot v2! <audio src="https://s3.amazonaws.com/myAlexaSoundEffect/voice2_final.mp3" /> What can I do for your today ? If you are unsure say help to get more info', 'How can I help you today? If you are unsure say help to get more info')
  },
  'LaunchRequest': function () {
    this.emit(':ask', `Tacobot v2 is at your service. What can I do for you ?`, 'Tacobot v2 is at your service. What can I do for you ?')
  },
  'InitOptionCapture': function () {
    var capturedOption = this.event.request.intent.slots.InitOption.value
    if (capturedOption === 'a') {
      this.handler.state = constants.states.TACO_GIVING
      this.emitWithState('LaunchRequest')
    } else if (capturedOption === 'b') {
      this.handler.state = constants.states.MAIN
      this.emitWithState('TacoFact')
    } else if (capturedOption === 'c') {
      this.handler.state = constants.states.MAIN
      this.emitWithState('TacoHistory')
    } else if (capturedOption === 'd') {
      this.handler.state = constants.states.MAIN
      this.emitWithState('TacoRecipe')
    } else if (capturedOption === 'e') {
      this.handler.state = constants.states.MAIN
      this.emitWithState('QueryTacoLeaderBoard')
    } else {
      this.emit(':ask', 'I do not recognize this option. You can choose among A B C  D and E. If unsure,Ask for help to get more info', 'Please pick a valid option among A B C D and E')
    }
  },
  'GivingTaco': function () {
    this.handler.state = constants.states.TACO_GIVING
    this.emitWithState('LaunchRequest')
  },
  'TacoFact': function () {
    this.handler.state = constants.states.MAIN
    this.emitWithState('TacoFact')
  },
  'TacoHistory': function () {
    this.handler.state = constants.states.MAIN
    this.emitWithState('TacoHistory')
  },
  'TacoRecipe': function () {
    this.handler.state = constants.states.MAIN
    this.emitWithState('TacoRecipe')
  },
  'QueryTacoLeaderBoard': function () {
    this.handler.state = constants.states.MAIN
    this.emitWithState('QueryTacoLeaderBoard')
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', 'I will stop now. Farewell')
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', 'I will stop now. Farewell')
  },
  'SessionEndedRequest': function () {
    this.emit(':tell', 'Bye now , see you later')
  },
  'AMAZON.HelpIntent': function () {
    this.emit(':ask', 'I am very powerful. I am capable of : A) Sending taco : B) providing fun facts about taco :C) Educating you on taco history : D) Providing traditional taco Recipe. :E) Update you abou the state of taco LeaderBoard Tell me what would you like to do by saying Option : then the letter', 'Tell me what you would like to do by indicating the letter')
  },
  'Unhandled': function () {
    this.emitWithState('AMAZON.HelpIntent')
  }
})

module.exports = initStateHandler
