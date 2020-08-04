const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const port = 5000;
const sessionId = uuid.v4();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
  });




app.post('/send-msg', (req, res) => {
    // console.log(req);

    runSample(req.body.MSG).then(result => {
        console.log(result)
        res.send({Reply:result}).end();
        }).catch((err) => { 
        res.status(422).json(err).end();
        });
    });

    app.listen(port,()=>{
        console.log("running on port "+port);
    });



/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg,projectId = 'vhl-ins-bot-rsgi') {
  // A unique identifier for the given session

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
      keyFilename:"./vhl-ins-bot-rsgi-dcf97b256763.json"
  });
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: msg,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  console.log(result.fulfillmentMessages);

  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }

  return { 
        'msg': result.fulfillmentText,
        'payload': (result.fulfillmentMessages[1].payload.fields)?result.fulfillmentMessages[1].payload.fields:{}
    };
}

