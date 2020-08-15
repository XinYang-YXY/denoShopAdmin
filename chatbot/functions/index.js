const functions = require('firebase-functions');
const cors = require('cors')({ origin: true});
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
const io = require("socket.io-client");
const socket = io.connect("http://localhost:8000",
	{reconnect: true}
);
const User = require("./models/User");
const {rqs, client} = require("./config/recombee");
let options = {
  timeZone: 'Singapore',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false,
};
var formatter = new Intl.DateTimeFormat(('en-US'), options);

// Chat.findOne({
//   where: {
//       id : 17 ,
//   }
// }).then((chat) => {
//     console.log(chat)
//   })

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://denoshop-aucqns.firebaseio.com"
  });
  
const { SessionsClient } = require('dialogflow');


exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionId } = request.body;


    const sessionClient = new SessionsClient({ credentials: serviceAccount });
    const session = sessionClient.sessionPath('denoshop-aucqns',sessionId);

    const responses = await sessionClient.detectIntent({ session, queryInput});

    const result = responses[0].queryResult;

    console.log(result);

    response.send(result);
  });
});

const { WebhookClient } = require('dialogflow-fulfillment');

exports.dialogflowWebhook = functions.https.onRequest(async (request, response) => {
    const agent = new WebhookClient({ request, response });

    const result = request.body.queryResult;

    // async function userOnboardingHandler(agent) {
    //   const { name, color } = result.parameters;
    //   console.log(name)
    // // Do backend stuff here
    // //  const db = admin.firestore();
    // //  const profile = db.collection('users').doc('jeffd23');

    // //  const { name, color } = result.parameters;

    // //   await profile.set({ name, color })
    //   agent.add(`Welcome aboard my friend!`);

    //   let IDREEE = agent.session;
    //   console.log(IDREEE);
    // }

    async function updateUsername(agent) {
      const { newUsername } = result.parameters;
      console.log(newUsername)
      let sessionID = agent.session.split("/")[4]
      console.log(sessionID)
      User.update(
        { username: newUsername },
        { where: { id: sessionID } }
    )
      agent.add("Username successfully changed !")
    }

    async function CreateChat(agent) {
      let { PNum , Department , Problem , Urgent } = result.parameters;
      if (Department > 6 || Department < 1) {
        agent.add("Invalid Department !")
      } else {
        console.log(PNum,Department,Problem,Urgent)
        let sessionID = agent.session.split("/")[4]
        console.log(sessionID)
        User.findOne({
          where: {
              id : sessionID,
          }
        }).then((user) => {
          const name = user.username
          const email = user.email
          if(PNum == 0) {
            PNum = ""
          }
          if(Urgent == "true"){
            Urgent= true
          } else {
            Urgent = false
          }
          var date = formatter.format(new Date());
          socket.emit('new-room',sessionID,name,email,PNum,Department,Problem,Urgent,date)
        })
        let promise = new Promise((res,rej) => {
          socket.on('redirectRoom',roomid => {
            console.log('YEAAAAAA')
            res(`Live support chat successfully created ! <br> <a href="http://www.localhost:3000/chat/room/${roomid}" style="color:black">Click here to join room</a>`)
          });
          socket.on('oneroom',function(){
            console.log('NOOOOOO')
            res("Only one live support chat can be active at one time !")
          });
        });

        let result = await promise
        console.log(result)
        agent.add(result)
      }
    }

    let intentMap = new Map();
    // intentMap.set('UserOnboarding', userOnboardingHandler);
    intentMap.set('ChangeUsername', updateUsername)
    intentMap.set('CreateChat', CreateChat)
    agent.handleRequest(intentMap);
});
