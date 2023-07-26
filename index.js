if(process.env.NODE_END !== "production"){
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const multer  = require('multer');
const upload = multer({dest: __dirname+'/public/data/uploads/'});
const uploadProf = multer({dest: __dirname+'/public/data/uploads/profilePictures/'});
const db=require(__dirname+"/db.js");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
var session = require('express-session');
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
const MongoDBStore = require('connect-mongodb-session')(session);
const initializePassport = require(__dirname+"/passport-config.js");
const methodOverride = require("method-override");
const Time = require("time-passed").default;
const fs = require('fs-extra');
const path = require("path");
const Chart = require("chart.js")
const cookieParser = require('cookie-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PORT=process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
initializePassport(passport);

app.use(cookieParser());

app.use((req, res, next) => {
  db.trackVisitor(req,res); 
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
    saveUninitialized: false,
    store: new MongoDBStore({
      uri: process.env.MONGODB_URI,
      collection: "sessions",
      mongooseConnection: mongoose.connection,
    }),
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.use((req,res,next)=>{
  user=req.user;
  next();
})

app.get("/", function(req,res){
  res.render("home");
    
  })

app.get("/event", function(req,res){
  res.redirect('/events');
})

app.get("/events", function(req,res){
  db.findALLEvents().then(function(foundEvents){
    res.render("events", {newEvents: foundEvents});
  })
})

app.get("/event/:eventID", function(req,res){
  db.findEventByID(req.params.eventID).then(async function(event){
    event.comments.forEach(async function (comment){
      comment.picture= await db.findUserImage(comment.username);
    })
        let mainCardFighters= await db.findFightersByName(event.mainCard.map(({fighterName})=> fighterName));
        let mainCardOpponents= await db.findFightersByName(event.mainCard.map(({opponentName})=> opponentName));
        let prelimFighters= await db.findFightersByName(event.prelims.map(({fighterName})=> fighterName));
        let prelimOpponents= await db.findFightersByName(event.prelims.map(({opponentName})=> opponentName));
        let prelimResults= await db.findFightResults(event.prelims.map(({fightID})=> fightID));
        let mainResults= await db.findFightResults(event.mainCard.map(({fightID})=> fightID));
        res.render("event", {mainResults:mainResults,prelimResults:prelimResults,event: event, fighters:mainCardFighters,opponents:mainCardOpponents,prelimFighters:prelimFighters,prelimOpponents:prelimOpponents,Time:Time.getRelativeTime});
  })
})


app.get("/user", function(req,res){
  res.redirect('/');
})

app.get("/user/:username", async function(req,res){
  try{
    const foundUser = await db.findUserByUsername(req.params.username);
    for (const comment of foundUser.comments) {
      comment.picture = await db.findUserImage(comment.username);
    }
    let userPredictions=await db.findPredictionsByUserID(foundUser.id);
    const currentDate = new Date();
    let userTrackedBets = await db.getUserTrackedBetInfo(foundUser.id);
let userChartData = userTrackedBets.filter((bet) => bet.eventDate <= currentDate);

    const rank = await db.findRanking(foundUser.id,"ALL");
    res.render("user", {profileUser:foundUser, predictions:userPredictions,rank:rank,trackedBets:userTrackedBets,userChartData:userChartData,Time:Time.getRelativeTime});
  } catch (error) {
    console.error(error);
    res.render("error-page");
  }
})


app.get("/fighter", function(req,res){
  res.render("fighter");
})

app.get("/fighter-error", function(req,res){
  res.render("fighter");
})

app.get("/signup",checkNotAuthenticated, function(req,res){
  res.render("signup");
});


app.post("/signup", checkNotAuthenticated, async function(req, res) {
  try {
    const userFoundByUsername = await db.findUserByUsername(req.body.username);
    const userFoundByEmail = await db.findUserByEmail(req.body.email);


    if (userFoundByUsername) {
      req.flash("error", "Username is taken.");
      return res.redirect("/signup");
    }

    if (userFoundByEmail) {
      req.flash("error", "An account with that email already exists.");
      return res.redirect("/signup");
    }

    if (req.body.password === req.body.confirmPassword) {
      const customer = await stripe.customers.create({
        email: req.body.email,
      });
      await db.saveUser(req.body.username.toLowerCase(), req.body.password, req.body.email,customer.id);
      return res.redirect('/login');
    } else {
      return res.redirect('/signup');
    }
  } catch (error) {
    req.flash("error", error.message);
    console.error(error);
    return res.redirect('/signup');
  }
});
  

// app.js
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err}`);
    return res.sendStatus(400);
  }


  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const customerId = paymentIntent.customer;   

    await db.updatePremiumStatusByCustomerId(customerId,true);


    return res.sendStatus(200);
  }
  return res.sendStatus(200);
};

app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);



app.get("/login",checkNotAuthenticated, function(req,res){
  res.render("login");
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
  keepSessionInfo: true
}));

app.get("/fighter/:fighterName", async function(req, res) {
  try {
    const fighter = await db.findFighterByName(_.upperFirst((req.params.fighterName).replace(/-/g, ' ').replace(/_/g, ' ')));

    if (fighter === null) {
      res.render("fighter-error");
    } else {
      for (const comment of fighter.comments) {
        comment.picture = await db.findUserImage(comment.username);
      }

      let lowFighterName = _.lowerCase(req.params.fighterName);
      let lowFName = _.lowerCase(fighter.name);

      if (lowFighterName === lowFName) {
        res.render("fighter", { fighter: fighter, Time: Time.getRelativeTime });
      } else {
        res.render("fighter-error");
      }
    }
  } catch (error) {
    console.error(error);
    res.render("error-page");
  }
});

app.get("/compose-event",checkAdmin, function(req,res){
  res.render("compose-event");
  
})

app.get("/approve-photos",checkAdmin, function(req,res){
  db.getUnapprovedPhoto().then(function(document){
    res.render("approve-photos",{document:document});
  })
})

app.get("/betting-hub", async function(req,res){
  let events = await db.findEventsWithBettingLines();
  res.render("betting-hub",{events:events});
})

app.post("/approve-photos",function(req,res){
  const documentId = req.body.documentId;
  if (req.body.submitButton ==="approve") {
    db.approvePhoto(documentId).then(function(){
      res.redirect("/approve-photos")
    })
  } else if (req.body.submitButton ==="changeImage") {
    db.changePhoto(documentId,req.body.newImageURL).then(function(){
      res.redirect("/approve-photos")
    })
  } else {
    console.log("error, no button recognized by server")
    res.redirect("/approve-photos")
  }
})

app.get("/predict",checkAuthenticated, function(req,res){
  res.render("predict");
  
})

app.get("/predict/:eventID",checkAuthenticated, function(req,res){
  db.findEventByID(req.params.eventID).then(async function(event){
    let fullCard=event.mainCard.concat(event.prelims);
    db.findFightsByIDSortedComments(fullCard.map(({fightID})=>fightID)).then(async function(fights){
      db.getFightersByID(fights.map(({fighterID})=>fighterID)).then(async function(fighters){
        db.getFightersByID(fights.map(({opponentID})=>opponentID)).then(async function(opponents){
          res.render("predict",{fighters:fighters,opponents:opponents,event:event,fights:fights,Time:Time.getRelativeTime});
        })
      })
    })
  })
  
  
})

app.get("/tape-index", checkPremiumUser, function(req,res){
  db.getUpcomingEvents().then(function(events){
    res.render("tape-index",{events:events});
  })
})

app.get("/premium", function(req,res){
    res.render("premium");
})

app.post("/premium", async (req, res) => {
  try {
    if (!user) {
      req.flash("error", "Please login or signup before subscribing");
      res.redirect("/login");
    } else {
      let customerId= await db.getUserCustomerId(user._id);

      // Create a Checkout Session with the customer ID
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: "price_1NTFu9FNZa19A5cWVtMeqAnX",
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'https://fighthub.club/',
        cancel_url: 'https://fighthub.club/',
        customer: customerId,
      });
      res.redirect(stripeSession.url);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});




app.get("/leaderboards", function(req,res){
  //get top 25 ranked -including username,user image, wins/losses  
  db.getTop25Rankings("all").then(function(rankings){
    res.render("leaderboards",{p4pTop25:rankings[0],ufcTop25:rankings[1],bellatorTop25:rankings[2],pflTop25:rankings[3]});
  })
  
  
})

app.get("/fight/:fightID", function(req,res){
  db.findFightByID(req.params.fightID).then(async function(fight){
    fight.comments.forEach(async function (comment){
      comment.picture= await db.findUserImage(comment.username);
    })
    db.findFighterByid(fight.fighterID).then(async function(fighter){
      db.findFighterByid(fight.opponentID).then(async function(opponent){
        db.findEventByID(fight.eventID).then(async function(event){
          db.findPredictionsByFight(fight.id).then(function(predictions){
            let fighterCount=0;
            let opponentCount=0;
            predictions.forEach(async function(prediction){
              if (prediction.fighterID===fight.fighterID){
                fighterCount++;
                prediction.fighterName = fighter.name;
              } else{
                opponentCount++;
                prediction.fighterName = opponent.name;
              }
            })
            res.render("fight", {predictions: predictions,fighterCount: fighterCount, opponentCount: opponentCount,fighter:fighter,opponent:opponent,fight:fight,event:event,Time:Time.getRelativeTime})
          })
          
        })
        
      })
    })
  })
})

app.post("/predict", function(req,res){
  res.redirect("/");
  
})

app.post("/event", function(req,res){
  res.redirect("/");
})

app.post("/ajaxComment", async function(req,res){
  if(req.body.contentType ==="fight"){
    db.saveFightComment(req.body.fightID,req.body.comment).then(async function(comments){
    res.json({comments});
  });
  } else if (req.body.contentType ==="event"){
    db.saveEventComment(req.body.eventID,req.body.comment).then(async function(comments){
      res.json({comments});
    })
  }else if (req.body.contentType ==="fighter"){
    db.saveFighterComment(req.body.fighterID,req.body.comment).then(async function(comments){
      res.json({comments});
    })
  }else if (req.body.contentType ==="user"){
    db.saveUserComment(req.body.profileUserID,req.body.comment).then(async function(comments){
      res.json({comments});
    })
  }
  
  
  
})

app.post("/ajaxPredict", async function(req,res){
  db.saveFightPrediction(req.body.fightID,req.body.prediction).then(async function(outcome){
    await db.getFighterByID(req.body.prediction.fighterID).then(function(predictedFighter){
      const fighterName=predictedFighter.name;
      res.json({outcome,fighterName});
    });
    
  });
  
  
})

app.post("/ajaxTrackBet", async function(req,res){
  db.trackUserBet(req.body.userID,req.body.betSlip,req.body.wager,req.body.odds).then(async function(outcome){
      res.json({outcome});
  });
  
  
})

app.post("/ajaxLikeOrDislike", async function(req,res){
  if (req.body.action==="like"){
    const outcome = await db.likeComment(req.body.commentUsername,req.body.timePosted,req.body.username,req.body.contentType);
      res.json({outcome});
    
  } else{
    const outcome = await db.dislikeComment(req.body.commentUsername,req.body.timePosted,req.body.username,req.body.contentType);
      res.json({outcome});
  }
  
  
  
})


app.post("/ajaxEditProfile",uploadProf.single('file'), async function(req,res){
  if (req.body.action==="update profile"){
    db.updateProfileInfo(req.body.username,req.body.aboutMe,req.body.favFighter,req.body.favOrg,req.body.currentTheme).then( async function(updated){
    if(req.file){
      const userID= await db.findUserIdByUsername(req.body.username);
      await db.updateProfileImage(userID,req.file.filename);
    }
      res.json(updated);
  })
  } else if (req.body.action==="update profile image"){

    db.updateProfileImage(req.body.userID,req.file.filename).then(function(updated){
      res.json(updated);
    })

  } else if (req.body.action==="update cover image"){

    db.updateProfileCoverImage(req.body.userID,req.file.filename).then(function(updated){
      res.json(updated);
    })

  }

})
app.get("/ajaxFetchProfilePredictions", async function(req,res){
db.getUserPredictionInfo(req.query.userID,req.query.orgName).then(function(outcome){
  res.json(outcome);
})
})

app.get("/ajaxFetchEventInfo", async function(req,res){
  if(req.query.action==="get event fights"){
    let event = await db.findEventByID(req.query.eventID);
    let mainCardFighters= await db.findFightersByName(event.mainCard.map(({fighterName})=> fighterName));
    let mainCardOpponents= await db.findFightersByName(event.mainCard.map(({opponentName})=> opponentName));
    let prelimFighters= await db.findFightersByName(event.prelims.map(({fighterName})=> fighterName));
    let prelimOpponents= await db.findFightersByName(event.prelims.map(({opponentName})=> opponentName));
    let outcome = {
      eventName:event.name,
      fighters:mainCardFighters.concat(prelimFighters),
      opponents:mainCardOpponents.concat(prelimOpponents)
    }
    res.json(outcome);
  }
  })

app.get("/ajaxFetchLeaderboardData", async function(req,res){
  if(req.query.function==="getSubTable"){
    db.getLeaderboardSubTable(req.query.userID,req.query.leaderboardType).then(function(outcome){
    res.json(outcome);
  })
  }
  
  })

app.post("/ajaxAdminFightActions", async function(req,res){
  let user= await db.findUserProfileType(req.body.userID);
  if(user.admin){
    if(req.body.action==="submitFightOutcome"){
    db.updateFightOutcome(req.body.fightID,req.body.winner,req.body.method,req.body.round,req.body.time).then(function(outcome){
    db.resolvePredictions(req.body.fightID,req.body.winner).then(function(resolved){
      db.resolveTrackedBets(req.body.fightID).then(function(outcome){
        res.json(outcome);
      })
    })
  })
  } else if (req.body.action==="closeFightPredictions"){
    db.closeFightPredictions(req.body.fightID).then(function(outcome){
      res.json(outcome);
    })
  } else if (req.body.action==="openFightPredictions"){
    db.openFightPredictions(req.body.fightID).then(function(outcome){
      res.json(outcome);
    })
  } else if (req.body.action==="submitTapeIndex"){
    db.addFightTapeindex(req.body.fighterID,req.body.fightName,req.body.tapeLink,req.body.tapeTime).then(function(outcome){
      res.json(outcome);
    })
  }
  } else{
    outcome={
      error:"user is not an admin"
    }
    res.json(outcome);
  }
  

})

app.post("/compose-event",checkAdmin, upload.single('eventPicture'), async function(req,res){
  let mainCard = [];
  let prelims=[];
  let j=0;


  async function saveFighters(){
  for(let i=0;i<req.body.mainFighter1Name.length;i++){    
    mainCard[i]={
    fighterName: req.body.mainFighter1Name[i],
    opponentName: req.body.mainFighter2Name[i],
    weightClass: req.body.mainWeightClass[i],
    isTitleFight: parseInt(req.body.isTitleFight[j])
  }
   db.saveFighterByNameAndAddFight(req.body.mainFighter1Name[i],req.body.eventName,req.body.date,req.body.mainFighter2Name[i],parseInt(req.body.isTitleFight[j]));
   db.saveFighterByNameAndAddFight(req.body.mainFighter2Name[i],req.body.eventName,req.body.date,req.body.mainFighter1Name[i],parseInt(req.body.isTitleFight[j]));
// await db.saveFighterByName(req.body.mainFighter1Name[i]);
// await db.saveFighterByName(req.body.mainFighter2Name[i]);
   if (req.body.isTitleFight[j]==="1"){
    j+=2;
  }else{
    j++;
  }
  }
  j=0;
  for(let i=0;i<req.body.prelimFighter1Name.length;i++){
    prelims[i]={
    fighterName: req.body.prelimFighter1Name[i],
    opponentName: req.body.prelimFighter2Name[i],
    weightClass: req.body.prelimWeightClass[i],
    prelimisTitleFight: parseInt(req.body.prelimisTitleFight[j])
  }
  db.saveFighterByNameAndAddFight(req.body.prelimFighter1Name[i],req.body.eventName,req.body.date,req.body.prelimFighter2Name[i],parseInt(req.body.isTitleFight[j]));
  db.saveFighterByNameAndAddFight(req.body.prelimFighter2Name[i],req.body.eventName,req.body.date,req.body.prelimFighter1Name[i],parseInt(req.body.isTitleFight[j]));
// await db.saveFighterByName(req.body.prelimFighter1Name[i]);
// await db.saveFighterByName(req.body.prelimFighter2Name[i]);
  if (req.body.isTitleFight[j]==="1"){
    j+=2;
  }else{
    j++;
  }
  }



}

  await saveFighters();

  let event = {
    name: req.body.eventName,
    picture: req.file.filename,
    org: req.body.orgName,
    location: req.body.location,
    date: req.body.date,
    mainCard: mainCard,
    posterURL: "",
    prelims: prelims
  }
  setTimeout(()=>{
    db.saveEvent(event);
  },"5000")
   
    

  // await db.saveEvent(event);

  db.findALLEvents().then(function(foundEvents){
    res.render("events", {newEvents: foundEvents});
  })
  })

  
app.delete("/logout", function(req,res){
  req.logOut(function(err){
    if (err){return next(err);}
    res.redirect("back");
  });
  
})

function checkAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.session.returnTo=req.url;
  req.flash('error', 'Must login to see that page');
  res.redirect('/login');
}

function checkPremiumUser(req, res, next) {
  if (req.isAuthenticated() && req.user.premium) {
    return next();
  }
  
  req.flash('error', 'Become a premium user to access that page');
  res.redirect('/premium'); 
}

function checkAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.admin) {
    return next();
  }
  
  req.flash('error', 'error');
  res.redirect('/'); 
}

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect("/")
  }
  next()
}

mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});