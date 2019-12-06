const express = require('express');
const bodyParser = require('body-parser');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
const app = express();
const port = 3002;

const ZYCLYX_ASSISTANT_ID = 'c0f508b5-3d96-48ba-8497-5dfb3e42e832';
const VIRTECH_ASSISTANT_ID = 'aa4be038-5335-40a9-a851-e7b3a98ffd87';
let zyclyxSession = null;
let virtechSession = null;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// ZYCLYX - IBM Watson Assistant
const zyclyxAssistant = new AssistantV2({
  version: '2019-02-27',
  authenticator: new IamAuthenticator({
    apikey: '6CTEOjac_y_JO97NyPuMlbntwRPVa8tkFY8tmf05Oaiy',
  }),
  url: 'https://gateway-lon.watsonplatform.net/assistant/api',
  headers: {
    'X-Watson-Learning-Opt-Out': 'true'
  }
});
 
// ZYCLYX - IBM Watson Assistant
const virtechAssistant = new AssistantV2({
  version: '2019-03-14',
  authenticator: new IamAuthenticator({
    apikey: '6CTEOjac_y_JO97NyPuMlbntwRPVa8tkFY8tmf05Oaiy',
  }),
  url: 'https://gateway-lon.watsonplatform.net/assistant/api',
  headers: {
    'X-Watson-Learning-Opt-Out': 'true'
  }
});
 
// Create a New Session
function newZyclyxSession() {
  return zyclyxAssistant.createSession({ assistantId: ZYCLYX_ASSISTANT_ID });
}

function newVirtechSession() {
  return virtechAssistant.createSession({ assistantId: VIRTECH_ASSISTANT_ID });
}


// Get Response from IBM Watson Assistant
function getIBMWatsonOutput(assistant, inputText, IBMassistantId, assistantSession) {
  return assistant.message({
    assistantId: IBMassistantId,
    sessionId: assistantSession,
    input: {
      'message_type': 'text',
      'text': inputText
    }
  })
}

app.get('/', function (req, res) {
  res.send("Home Page");
})

app.get('/message', function (req, res) {
  // res.json({"id":sessionId});     
  if (!sessionId) {
    console.log('new session');
    let session = Promise.resolve(newSession());
    session.then(function (response) {
      sessionId = response.result.session_id
    })
      .then(function () {
        Promise.resolve(getIBMWatsonOutput())
          .then(response => {
            //console.log(res.result.output.generic[0].text);
            res.send({ "message": response.result.output.generic })
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  }
  else {
    console.log('old session')
    Promise.resolve(getIBMWatsonOutput())
      .then(response => {
        // console.log(res.result.output.generic[0].text);
        res.send({ "message": response.result.output.generic })
      })
      .catch(err => {
        console.log(err);
      });
  }
  // send message
});


// for Zyclyx chatbot
app.post('/zybot', function (req, res) {
  if (!zyclyxSession) {
    console.log('new session');
    let session = Promise.resolve(newZyclyxSession());

    session.then(function (response) {
      zyclyxSession = response.result.session_id
    })
      .then(function () {
        Promise.resolve(getIBMWatsonOutput(zyclyxAssistant,req.body.text,ZYCLYX_ASSISTANT_ID,zyclyxSession))
          .then(() => {
            Promise.resolve(getIBMWatsonOutput(zyclyxAssistant,req.body.text,ZYCLYX_ASSISTANT_ID,zyclyxSession))
            .then(function(response){
              res.status(200).send(response.result.output.generic)
            })             
          })
          .catch(err => {
            console.log(err.message);
          });
      })
      .catch(err => {
        console.log(err.message);
      });
  }
  else {
    console.log('old session')
    Promise.resolve(getIBMWatsonOutput(zyclyxAssistant,req.body.text,ZYCLYX_ASSISTANT_ID,zyclyxSession))
      .then(response => {
        res.status(200).send({
          response: response.result.output.generic
        })
      })
      .catch(err => {
        console.log(err.message); 
      });
  }
})


// for virtech chatbot
app.post('/virtech', function (req, res) {
  if (!virtechSession) {
    console.log('new session');
    let session = Promise.resolve(newVirtechSession());

    session.then(function (response) {
      virtechSession = response.result.session_id
    })
      .then(function () {
        Promise.resolve(getIBMWatsonOutput(virtechAssistant,req.body.text,VIRTECH_ASSISTANT_ID,virtechSession))
          .then(response => { 
            res.status(200).send(response.result.output.generic)
          })
          .catch(err => {
            console.log(err.message);
          });
      })
      .catch(err => {
        console.log(err.message);
      });
  }
  else {
    console.log('old session')
    Promise.resolve(getIBMWatsonOutput(virtechAssistant,req.body.text,VIRTECH_ASSISTANT_ID,virtechSession))
      .then(response => {
        res.status(200).send({
          response: response.result.output.generic
        })
      })
      .catch(err => {
        console.log(err.message); 
      });
  }
})

app.listen(port, () => console.log(`app listening on port ${port}!`));