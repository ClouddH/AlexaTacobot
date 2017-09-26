var constants = Object.freeze({
  // App-ID. TODO: Set Your App ID
  appId: '',

  //  DynamoDB Table Name
  dynamoDBTableName: 'TacoBot',

  // Skill States
  states: {
    INIT: '',
    MAIN: '_MAIN',
    TACO_GIVING: '_TACO_GIVING'
  }
})
module.exports = constants
