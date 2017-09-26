var Alexa = require('alexa-sdk')
var constants = require('../constants/constants')
var axios = require('axios')

var TacoFact = [
  'October 3rd is National Taco Day',
  'Taco Bell uses at least 600,000 cows’ worth of beef per year. According to Taco Bell’s own website, they serve an average of 295 million pounds of ground beef every year',
  'The biggest taco ever made was constructed on November 20th, 2011 in Queretaro, Mexico. It was 246 feet long and was made with carnitas as the filling.'
]
var TacoHistory = [
  'The first mention of a taco in the United States can be found in 1905 in a newspaper. Then, tacos were associated with pushcarts in Los Angeles and a group of women called the Chili Queens, in San Antonio. These women were seen as “available”, according to one historian, and customers would flirt the Chili Queens and buy tacos. This also fed into the stereotype of Mexican food as hot and spicy, in more than way.',
  'Tacos predate the Europeans in Mexico and were discovered to be the food of choice by the indigenous folk in the Valley of Mexico. Obviously the Spanish wanted to stake their claim on such fine fare, and dubbed them “tacos.”'
]

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function randomElementFromArray (arr) {
  var len = arr.length
  var randIndex = getRandomInt(0, len - 1)
  return arr[randIndex]
}

function LeaderboardInfoText (handler) {
  QueryTacoApi()
    .then(function (response) {
      var text = parseTacoApiResponse(response.data)
      handler.emit(':tell', text)
    })
    .catch(function (err) {
      console.log(err)
    })
}
function parseTacoApiResponse (response) {
  console.log(response)
  var leaders = response['leaderboard']
  if (leaders.length >= 1) {
    var name = leaders[0]['username']
    var tacoCount = leaders[0]['count']
    return `${name} currently is leading the taco leaderboard. He gots  ${tacoCount} taco today.`
  } else {
    return 'No one has given taco today'
  }
}
function QueryTacoApi () {
  return axios.get('https://www.heytaco.chat/api/v1/json/leaderboard/T0L0D540Z?days=1')
}
var mainStateHandler = Alexa.CreateStateHandler(constants.states.MAIN, {
  'TacoFact': function () {
    var speechOutput = randomElementFromArray(TacoFact)
    this.emit(':tell', speechOutput)
  },

  'TacoHistory': function () {
    var speechOutput = randomElementFromArray(TacoHistory)
    this.emit(':tell', speechOutput)
    this.handler.state = constants.states.TACO_GIVING.INIT
    this.emitWithState('LaunchRequest')
  },

  'TacoRecipe': function () {
    this.emit(':tell', `Taco Recipe Stub`)
    this.handler.state = constants.states.TACO_GIVING.INIT
    this.emitWithState('LaunchRequest')
  },
  'QueryTacoLeaderBoard': function () {
    var handler = this
    LeaderboardInfoText(handler)
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', 'I will stop now. Farewell')
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', 'I will stop now. Farewell')
  },
  'SessionEndedRequest': function () {
    this.emit(':tell', 'I will stop now. Farewell')
    this.handler.state = constants.states.TACO_GIVING.INIT
    this.emitWithState('LaunchRequest')
  }
})
module.exports = mainStateHandler
