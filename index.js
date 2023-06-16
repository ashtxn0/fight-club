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
const methodOverride = require("method-override");
const { findFightersByID, findUserByID } = require("./db");
const Time = require("time-passed").default;

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

        res.render("event", {event: event, fighters:mainCardFighters,opponents:mainCardOpponents,prelimFighters:prelimFighters,prelimOpponents:prelimOpponents,Time:Time.getRelativeTime});



  })
})


app.get("/user", function(req,res){
  res.redirect('/');
})

app.get("/user/:username", function(req,res){
  db.findUserByUsername(req.params.username).then(function(foundUser){
    db.findPredictionsByUserID(foundUser.id).then(function(userPredictions){
      res.render("user", {profileUser:foundUser, predictions:userPredictions});
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
  db.findUserByUsername(req.body.username).then(async function(userFoundByUsername){
    db.findUserByEmail(req.body.email).then(function(userFoundByEmail){
      if (userFoundByUsername != undefined){
      req.flash("error","Username is taken.");
      res.redirect("/signup");
    } else if (userFoundByEmail!=undefined){
      req.flash("error","An account with that email already exists.");
      res.redirect("/signup");
    } else if (req.body.password===req.body.confirmPassword){
      try{
        db.saveUser(req.body.username, req.body.password,req.body.email);
        res.redirect('/login');
      } catch{
        res.redirect("/signup");
      }
  
    } else{
      res.redirect('/signup');
    }
    })
  })
  
  
  
});


app.get("/login",checkNotAuthenticated, function(req,res){
  res.render("login");
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
  keepSessionInfo: true
}));

  app.get("/fighter/:fighterName", function(req,res){
    db.findFighterByName(_.startCase((req.params.fighterName).replace(/-/g, ' ').replace(/_/g, ' '))).then(function(fighter){
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

app.post("/ajaxLikeOrDislike", async function(req,res){
  if (req.body.action==="like"){
    const outcome = await db.likeComment(req.body.commentUsername,req.body.timePosted,req.body.username,req.body.contentType);
      res.json({outcome});
    
  } else{
    const outcome = await db.dislikeComment(req.body.commentUsername,req.body.timePosted,req.body.username,req.body.contentType);
      res.json({outcome});
  }
  
  
  
})


app.post("/ajaxEditProfile", async function(req,res){

  db.updateProfileInfo(req.body.username,req.body.aboutMe,req.body.favFighter,req.body.favOrg,req.body.currentTheme).then(function(updated){
    res.json(updated);
  })

  
  
})


app.post("/", upload.single('eventPicture'), function(req,res){
  let mainCard = [];
  let prelims=[];
  let j=0;
  for(let i=0;i<req.body.mainFighter1Name.length;i++){    
    mainCard[i]={
    fightID: "test",
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
    fightID: "test",
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

  
// findFightersByID(mainCard[0].fighterName).then(function(ids){
//   mainCard[0].fighterName=ids;
// });

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

  db.findALLEvents().then(function(foundEvents){
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
    res.redirect("back");
  });
  
})

//use to restrict anyone whos not signed in from going to a page by putting "checkAuthenticated ," after the get route
function checkAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.session.returnTo=req.url;
  req.flash('error', 'Must login to see that page');
  res.redirect('/login');
}

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect("/")
  }
  next()
}

app.listen(3000, function () {
    console.log("Server started on port 3000.");
  });
