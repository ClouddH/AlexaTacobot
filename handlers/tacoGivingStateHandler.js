var Alexa = require('alexa-sdk')
var axios = require('axios')
var querystring = require('querystring')
var constants = require('../constants/constants')

var AccessToken = {
  garfieldchh: process.env.garfieldchh_token,
  james: process.env.james_token,
  davidsteckel: process.env.davidsteckel_token,
  gio: process.env.gio_token,
  derynh: process.env.derynh_token,
  amanda: process.env.amanda_token,
}

var tacoGivingStateHandler = Alexa.CreateStateHandler(constants.states.TACO_GIVING, {

  'LaunchRequest': function () {
    this.emit(':ask', `Sure, I can help with that. who are you? Let me know your name by saying: My name is : then your name`, 'Dude, what is your name')
  },
  'SenderNameCapture': function () {
    var capturedName = this.event.request.intent.slots.SenderName.value

    if (GetHomigoEmployee(capturedName) !== 'unknown') {
      this.attributes['SenderName'] = capturedName
      var guack
      if (GetHomigoEmployee(capturedName) === 'gio') {
        guack = '<audio src="https://s3.amazonaws.com/myAlexaSoundEffect/guack.mp3" />'
      }
      this.emit(':ask', `ok, ${guack} ${capturedName} who do you want to give taco to today ? Let me know by saying : I want to give taco to : then the person's name`, `${capturedName} Who do you want to give taco to ?`)
    } else {
      this.emit(':ask', `Sorry, I don't know who ${capturedName} is. Who are you ?`, 'Who the fuck are you ?')
    }
  },
  'ReceiverNameCapture': function () {
    var capturedName = this.event.request.intent.slots.ReceiverName.value
    if (GetHomigoEmployee(capturedName) !== 'unknown') {
      this.attributes['ReceiverName'] = capturedName
      this.emit(':ask', `I see.  How many tacos would you like to give to ${capturedName}`, `${this.attributes['SenderName']}, how many tacos do you want to give to ${capturedName} `)
    } else {
      this.emit(':ask', `Sorry, I don't know who ${capturedName} is. Who is that ?`, 'Who the fuck is that ?')
    }
  },
  'TacoQuantityCapture': function () {
    var tacoCount = this.event.request.intent.slots.TacoCount.value

    if (IsNum(tacoCount)) {
      tacoCount = Number(tacoCount)
      this.attributes['TacoCount'] = tacoCount
      var speechOutput
      if (tacoCount >= 2) {
        console.log(tacoCount)
        speechOutput = `${tacoCount} taco for ${this.attributes['ReceiverName']} This is a lot of tacos. Would you like give real tacos or fake tacos ?`
      } else {
        speechOutput = `${tacoCount} taco for ${this.attributes['ReceiverName']} Would you like to give real tacos or fake tacos ?`
      }
      this.emit(':ask', speechOutput, speechOutput)
    } else {
      this.emit(':ask', 'Dumbass, I ask for a number what are you giving me ?', 'I need a number')
    }
  },

  'RealOrFakeCapture': function () {
    var RealOrFake = this.event.request.intent.slots.RealOrFake.value.toLowerCase()

    if (RealOrFake === 'real taco' || RealOrFake === 'real tacos') {
      this.attributes['RealOrFake'] = true
      this.emit(':ask', `${this.attributes['SenderName']}, This is a honorable move. Why would you like to give ${this.attributes['ReceiverName']} tacos. Let me know by saying I want to give taco because: then your reason`, `Why would you like to give tacos ?`)
    } else if (RealOrFake === 'fake taco' || RealOrFake === 'fake tacos') {
      this.attributes['RealOrFake'] = false
      this.emit(':ask', `${this.attributes['SenderName']}, This is smart. After all , taco is precious resource. Now, Why would you like to give ${this.attributes['ReceiverName']} tacos. Let me know by saying I want to give taco because: then your reason`, `Why would you like to give tacos ?`)
    } else {
      this.emit(':ask', `Sorry, I can't understand that. Indicate your preference by saying : Real tacos or fake tacos`, 'Would you like to give real tacos or fake tacos')
    }
  },
  'TacoGivingReasonCapture': function () {
    var tacoReason = this.event.request.intent.slots.TacoReason.value
    this.attributes['TacoReason'] = tacoReason
    var handler = this
    var Token = this.event.session.user.accessToken
    GiveTacoHandler(Token, this.attributes['ReceiverName'], this.attributes['TacoCount'], this.attributes['TacoReason'], this.attributes['RealOrFake'])
      .then(function (response) {
        Done(handler)
      })
      .catch(function (error) {
        Err(handler, error)
      })
  },
  'AMAZON.HelpIntent': function () {
    if (!('SenderName' in this.attributes)) {
      this.emit(':ask', 'Please indicate your name by saying : My name is:  then your name', 'Please indicate your name by saying : My name is:  then your name')
    } else if (!('ReceiverName' in this.attributes)) {
      this.emit(':ask', 'Please indicate who do you want give taco to by saing : I want to give taco to : the receiver\' s name', 'Please indicate who do you want give taco to by saing : I want to give taco to : the receiver\' s name')
    } else if (!('TacoCount' in this.attributes)) {
      this.emit(':ask', 'How many tacos do you want to give out ?', 'How many tacos do you want to give out ?')
    } else if (!('RealOrFake' in this.attributes)) {
      this.emit(':ask', 'Would you like to give out real or fake tacos. Let me knowy by saying : read taco or fake taco', 'Would you like to give out real or fake tacos. Let me knowy by saying : read taco or fake taco')
    } else if (!('TacoReason' in this.attributes)) {
      this.emit(':ask', 'Why would you like to give out taco ? Let me know by saying because: then your reasons', 'Why would you like to give out taco ? Let me know by saying because: then your reasons')
    }
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
  'Unhandled': function () {
    this.emitWithState('AMAZON.HelpIntent')
  }
})

// Helpers
function Done (handler) {
  handler.handler.state = constants.states.MAIN
  handler.emit(':tell', `Done, ${handler.attributes['SenderName']} will give ${handler.attributes['ReceiverName']} ${handler.attributes['TacoCount']} taco for ${handler.attributes['TacoReason']}. <audio src="https://s3.amazonaws.com/myAlexaSoundEffect/voice_final.mp3"/>`)
}
function Err (handler, error) {
  handler.emit(':tell', `Something went wrong . Error message: ${error}`)
}

function FormatTacoText (Receiver, TacoCount, Reason, RealOrFake) {
  var tacos
  if (RealOrFake) {
    tacos = ':taco:'.repeat(TacoCount)
  } else {
    tacos = ':shit:'.repeat(TacoCount)
  }
  return `[AlexaTacoBot] ${tacos} @${Receiver} ${Reason}`
}

function GiveTacoHandler (Token, Receiver, TacoCount, Reason, RealOrFake) {
  Receiver = GetHomigoEmployee(Receiver)
  var tacoText = FormatTacoText(Receiver, TacoCount, Reason, RealOrFake)
  return axios.post('https://slack.com/api/chat.postMessage', querystring.stringify({
    token: Token,
    link_names: 1,
    channel: '#yumtacos',
    text: tacoText,
    as_user: true
  }))
}

function GetHomigoEmployee (value) {
  switch (value.toLowerCase().trim()) {
    case 'cloud':
      return 'garfieldchh'
    case 'roman':
      return 'roman'
    case 'marco slash':
    case 'marco valle':
      return 'marco'
    case 'marko':
      return 'marko'
    case 'gio':
    case 'giorgio':
      return 'gio'
    case 'gui':
    case 'guillaume':
      return 'guillaume'
    case 'david':
      return 'davidsteckel'
    case 'deryn':
      return 'derynh'
    case 'dave':
      return 'dave'
    case 'young greg':
      return 'gregory'
    case 'old greg':
    case 'senior greg':
      return 'gr3g'
    case 'amanda':
      return 'amanda'
    case 'james':
      return 'james'
    default:
      return 'unknown'
  }
}

function IsNum (str) {
  return /^\d+$/.test(str)
}

module.exports = tacoGivingStateHandler
