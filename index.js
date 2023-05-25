if(process.env.NODE_END !== "production"){
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const multer  = require('multer');
const upload = multer({dest: __dirname+'/public/data/uploads/'});
const db=require(__dirname+"/db.js");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require(__dirname+"/passport-config.js");
const methodOverride = require("method-override")

initializePassport(passport);




// saveFighterOpponents("Irene Aldana");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));


  // Event.deleteMany({name:"test"}).then(function(event){
  //   console.log("deleted tests");
  // })
app.get("/", function(req,res){
  res.render("home");
    
  })

app.get("/event", function(req,res){
  res.render("event");
})

app.get("/events", function(req,res){
  db.findALLEvents().then(function(foundEvents){
    res.render("events", {newEvents: foundEvents});
  })
})

app.get("/event/:eventName", function(req,res){
  db.findALLEvents().then(function(foundEvents){
    foundEvents.forEach(function(event){
      let lowEventID = _.lowerCase(req.params.eventName);
      let lowID=_.lowerCase(event._id);
      if (lowEventID===lowID){
        db.findALLFighters().then(function(foundFighters){
          res.render("event", {event: event, Fighters: foundFighters});
        })     
      }
    })
  })
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

app.post("/signup",checkNotAuthenticated,async function(req,res){
  if (req.body.password===req.body.confirmPassword){
    try{
    db.saveUser(req.body.username, req.body.password,req.body.email);
    res.redirect('/login');
  } catch{
    res.redirect("/signup");
  }
  db.findALLUsers().then(function(usersFound){
    console.log(usersFound);
  })
  } else{
    res.redirect('/signup');
  }
  
});


app.get("/login",checkNotAuthenticated, function(req,res){
  res.render("login");
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

  app.get("/fighter/:fighterName", function(req,res){
    db.findFighterByName(req.params.fighterName).then(function(fighter){
      if (fighter ===null){
        res.render("fighter-error");
      } else{
        let lowFighterName = _.lowerCase(req.params.fighterName);
        let lowFName=_.lowerCase(fighter.name);
        if (lowFighterName===lowFName){         
            res.render("fighter", {fighter: fighter});      
        } else{
          res.render("fighter-error");
        }
      }
      
    })
  
 
})

app.get("/compose-event", function(req,res){
  res.render("compose-event");
  
})

app.post("/", upload.single('eventPicture'), function(req,res){
  let mainCard = [];
  let prelims=[];
  let j=0;
  for(let i=0;i<req.body.mainFighter1Name.length;i++){    
    mainCard[i]={
    fighterName: req.body.mainFighter1Name[i],
    opponentName: req.body.mainFighter2Name[i],
    weightClass: req.body.mainWeightClass[i],
    isTitleFight: parseInt(req.body.isTitleFight[j])
  }
  if (req.body.isTitleFight[j]==="1"){
    j+=2;
  }else{
    j++;
  }
   db.saveFighterByName(req.body.mainFighter1Name[i]);
   db.saveFighterByName(req.body.mainFighter2Name[i]);
  }
  j=0;
  for(let i=0;i<req.body.prelimFighter1Name.length;i++){
    prelims[i]={
    fighterName: req.body.prelimFighter1Name[i],
    opponentName: req.body.prelimFighter2Name[i],
    weightClass: req.body.prelimWeightClass[i],
    prelimisTitleFight: parseInt(req.body.prelimisTitleFight[j])
  }
  if (req.body.isTitleFight[j]==="1"){
    j+=2;
  }else{
    j++;
  }
  db.saveFighterByName(req.body.prelimFighter1Name[i]);
  db.saveFighterByName(req.body.prelimFighter2Name[i]);
  }

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
  db.saveEvent(event);

  db.findALLEvents.then(function(foundEvents){
    res.render("events", {newEvents: foundEvents});
  })

  // let mainCardFights=[];
  // mainCard.forEach(function(fight){
  //   getFighterID(fight.fighterName).then(function(fighterID){
  //     getFighterID(fight.opponentName).then(function(opponentName){
  //       let fight= {
  //         fighterID: fighterID,
  //         opponentID: opponentID,
  //         weightClass: fight.weightClass
  //       }
  //       mainCardFights.push(fight);
  //     })
  //   })
  // })
  // let prelimFights=[];
  // mainCard.forEach(function(fight){
  //   getFighterID(fight.fighterName).then(function(fighterID){
  //     getFighterID(fight.opponentName).then(function(opponentName){
  //       let fight= {
  //         fighterID: fighterID,
  //         opponentID: opponentID,
  //         weightClass: fight.weightClass
  //       }
  //       prelimFights.push(fight);
  //     })
  //   })
  })

app.delete("/logout", function(req,res){
  req.logOut(function(err){
    if (err){return next(err);}
    res.redirect("/login");
  });
  
})

// //use to restrict anyone whos not signed in from going to a page by putting "checkAuthenticated ," after the get route
// function checkAuthenticated(req,res,next){
//   if(req.isAuthenticated()){
//     return next();
//   }
//   res.redirect('/login');
// }

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect("/")
  }
  next()
}

app.listen(3000, function () {
    console.log("Server started on port 3000.");
  });
