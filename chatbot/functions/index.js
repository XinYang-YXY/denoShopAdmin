const functions = require('firebase-functions');
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const cors = require('cors')({ origin: true});
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
const io = require("socket.io-client");
const socket = io.connect("http://localhost:8000",
	{reconnect: true}
);
const User = require("./models/User");
const Promo = require("./models/PromoCode")
const {rqs, client} = require("./config/recombee");
let filters = {};
    boosts = {};
    tempfilters = {};
    tempboosts = {};

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
const { password } = require('./config/db');
const HackingProduct = require('../../models/HackingProduct');

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

    // async function test(agent) {
    //   agent.add('<div class="card m-3" style="width: 18rem;"> <div class="productPic content"><div class="content-overlay"></div><img class="card-img-top content-image" src="https://res.cloudinary.com/xenonic/image/upload/c_scale,h_300,w_300/v1/denoshop/products/1596525506128_amoss3" alt="Nike Shoes"><div class="content-details fadeIn-bottom"><a href="/product/6" class="btn btn-light content-title">View More</a></div></div><div class="card-body"><div style="display:flex; justify-content:space-between"><h5 class="card-title">Nike Shoes</h5><div class="wishlist_btn"></div><span class="itemID" hidden="">6</span></div><p class="card-text">nike shoes</p><div class="addToCart"><span id="priceTag" class="pt-2">S$90</span><button type="button" class="btn btn-outline-primary addToCartN">Add to Cart</button></div> </div> </div>')
    // }

    async function recommend(agent) {
      let sessionID = agent.session.split("/")[4]
      if(filters[sessionID] == undefined){
        filters[sessionID] = []
        boosts[sessionID] = []
      }

      let recommendations = await client.send(new rqs.RecommendItemsToUser(sessionID, 3, { 'scenario': 'homepage', 'cascadeCreate': true, 'returnProperties': true , 'includedProperties': 'category', 'filter' : `'itemId' not in "${filters[sessionID]}"` , 'booster': `if 'category' in "${boosts[sessionID]}" then 0.5 else 1`})).then( data => {
        console.log(data)
        let recomms_id = [];
        let recomms_categories = [];
        for(let i in data.recomms){
          recomms_id.push(data.recomms[i].id)
          recomms_categories.push(data.recomms[i].values.category)
        }
        tempfilters[sessionID] = Array.from(new Set (recomms_id))
        tempboosts[sessionID] = Array.from(new Set (recomms_categories))
        agent.add(String(recomms_id))
        console.log(String(recomms_id))
        return data.recomms;
      })
    }

    async function recommend2(agent) {
      let sessionID = agent.session.split("/")[4]
      filters[sessionID] = Array.from(new Set (filters[sessionID].concat(tempfilters[sessionID])))
      boosts[sessionID] = Array.from(new Set (boosts[sessionID].concat(tempboosts[sessionID])))
      console.log(tempfilters[sessionID])
      console.log(tempboosts[sessionID])
      console.log(filters[sessionID])
      console.log(boosts[sessionID])
      let recommendations = await client.send(new rqs.RecommendItemsToUser(sessionID, 3, { 'scenario': 'homepage', 'cascadeCreate': true, 'returnProperties': true , 'includedProperties': 'category', 'filter' : `'itemId' not in "${filters[sessionID]}"` , 'booster': `if 'category' in "${boosts[sessionID]}" then 0.5 else 1`})).then( data => {
        console.log(data)
        let recomms_id = [];
        let recomms_categories = [];
        for(let i in data.recomms){
          recomms_id.push(data.recomms[i].id)
          recomms_categories.push(data.recomms[i].values.category)
        }
        tempfilters[sessionID] = Array.from(new Set (recomms_id))
        tempboosts[sessionID] = Array.from(new Set (recomms_categories))
        agent.add(String(recomms_id))
        return data.recomms;
      })
    }

    async function updatePassword(agent) {
      const { currentPassword , newPassword } = result.parameters;
      let sessionID = agent.session.split("/")[4]
      let promise = new Promise((res,rej) => {
        User.findOne({ where: { id:sessionID } }).then((user) => {
          bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
            if (err) throw err; // If any unexpected err happened
            if (isMatch) {
              if(newPassword.length > 8) {
                let salt = bcrypt.genSaltSync(12);
                let password = bcrypt.hashSync(newPassword, salt);
                User.update(
                  { password: password },
                  { where: { id: sessionID } }
                )
                res('Password successfully changed')
              } else {
                res('Password must at least be 8 characters long')
              }
            } else {
              res('Password does not match current password')
            }
          });
        });
      });
      let resulted = await promise
      agent.add(resulted)
    }

    async function checkPromo(agent) {
      const { PCode } = result.parameters;
      let promise = new Promise((res,rej) => {
        Promo.findOne({ where: { code:PCode } }).then((code) => {
          if(code){
            if(code.status == 'Active'){
              res(`The promo code is for a ${code.discount}% discount !`)
            } else {
              res('The promo code is expired')
            }
          }
          res('The promo code does not exist')
        });
      });
      let resulted = await promise
      agent.add(resulted)
    }

    async function addtoCart(agent) {
      const { item } = result.parameters;
      let promise = new Promise((res,rej) => {
        HackingProduct.findOne({ where: { title:item } }).then((product) => {
          if(product){
            res(`CartYes,${item}`)
          } else {
            res('CartNo,')
          }
        });
      });
      let resulted = await promise
      agent.add(resulted)
    }

    async function addtoWish(agent) {
      const { item } = result.parameters;
      let promise = new Promise((res,rej) => {
        HackingProduct.findOne({ where: { title:item } }).then((product) => {
          if(product){
            res(`WishYes,${product.id}`)
          } else {
            res('WishNo,')
          }
        });
      });
      let resulted = await promise
      agent.add(resulted)
    }
    let intentMap = new Map();
    // intentMap.set('UserOnboarding', userOnboardingHandler);
    intentMap.set('CheckPromo' , checkPromo)
    intentMap.set('ChangeUsername - yes', updateUsername)
    intentMap.set('CreateChat', CreateChat)
    intentMap.set('Recommendations', recommend)
    intentMap.set('Recommendations - no', recommend2)
    intentMap.set('ChangePassword - yes', updatePassword)
    intentMap.set('AddToCart', addtoCart)
    intentMap.set('AddToWishlist', addtoWish)
    agent.handleRequest(intentMap);
});


// function idk(recommendations) {
//   let recomms_id = [];
//   var returned = ""
//   for(let i in recommendations){
//     recomms_id.push(recommendations[i].id)
//   }
//   var i;
//   for (i = 0; i < recomms_id.length; i++) {
//     HackingProduct.findOne({
//       where:{
//         id:recomms_id[i]
//       }
//     }).then((PDuct)=>{
//       if(PDuct){
//         returned += PDuct.title
//       }
//     })
//   }
//   return returned
// }

// function createProduct(PId) {
//   HackingProduct.findOne({
//     where:{
//       id:PId
//     }
//   }).then((Product) =>{
//     const returno = `<div class="card m-3" style="width: 18rem;"> <div class="productPic content"><div class="content-overlay"></div><img class="card-img-top content-image" src="${JSON.parse(Product.imageFile)[0]}" alt="${Product.title}"><div class="content-details fadeIn-bottom"><a href="/product/${Product.id}" class="btn btn-light content-title">View More</a></div></div><div class="card-body"><div style="display:flex; justify-content:space-between"><h5 class="card-title">${Product.title}</h5><div class="wishlist_btn"></div><span class="itemID" hidden="">6</span></div><p class="card-text">${Product.description}</p><div class="addToCart"><span id="priceTag" class="pt-2">S$${Product.price}</span><button type="button" class="btn btn-outline-primary addToCartN">Add to Cart</button></div> </div> </div>`
//     console.log(returno)
//     return String(returno)
//   })
// }

// function createProduct(PId) {
//   HackingProduct.findOne({
//     where:{
//       id:PId
//     }
//   }).then((Product) =>{
//     const wrapper = ReactDOM.render(document.createElement("div"));
//     wrapper.className = "card m-3"
//     wrapper.style = "width: 18rem"
//     const pic = document.createElement('div')
//     pic.className = "productPic content"
//     const contentOverlay = document.createElement('div')
//     contentOverlay.className = "content-overlay"
//     const image = document.createElement('img')
//     image.src = Product.imageFile[0]
//     const contentDetails = document.createElement('div')
//     contentDetails.className = "content-details fadeIn-bottom"
//     const viewButton = document.createElement('a')
//     viewButton.href = `/product/${PId}`
//     viewButton.className = 'btn btn-light content-title'
//     contentDetails.append(viewButton)
//     pic.append(contentOverlay)
//     pic.append(image)
//     pic.append(contentDetails)
//     wrapper.append(pic)

//     const cardBody = document.createElement('div')
//     cardBody.className = "card-body"
//     const titleWrapper = document.createElement('div')
//     titleWrapper.style = "display:flex; justify-content:space-between"
//     const Title = document.createElement("h5")
//     Title.className = "card-title"
//     Title.innerText = Product.title
//     const Wishlist = document.createElement('div')
//     Wishlist.className = 'wishlist_btn'
//     const hiddenSpan = document.createElement('span')
//     hiddenSpan.className = "itemID"
//     hiddenSpan.setAttribute("type","hidden")
//     hiddenSpan.innerText = PId
//     titleWrapper.append(Title)
//     titleWrapper.append(Wishlist)
//     titleWrapper.append(hiddenSpan)

//     const cardText = document.createElement('p')
//     cardText.className = "card-text"
//     cardText.innerText = Product.description

//     const AddCart = document.createElement('div')
//     AddCart.className = "addToCart"
//     const Price = document.createElement('span')
//     Price.id = "priceTag"
//     Price.className  = "pt-2"
//     Price.innerText = `S$ ${Product.price}`
//     const buyBtn = document.createElement('button')
//     buyBtn.setAttribute('type','button')
//     buyBtn.className = "btn btn-outline-primary addToCartN" 
//     buyBtn.innerText = "Add to Cart"
//     AddCart.append(Price)
//     AddCart.append(buyBtn)
    
//     cardBody.append(titleWrapper)
//     cardBody.append(cardText)
//     cardBody.append(AddCart)

//     wrapper.append(cardBody)
//     console.log(wrapper)
//     })
// }