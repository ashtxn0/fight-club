if(process.env.NODE_END !== "production"){
  require("dotenv").config();
}

const mongoose = require('mongoose');
const mma=require("mma-api");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const multer  = require('multer');
const upload = multer({dest: __dirname+'/public/data/uploads/'});
const google=require(__dirname+"/googleSearch.js");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter a name"]
  },
  email: {
    type: String,
    required: [true, "Please enter an email"]
  },
  password: {
    type: String,
    required: [true, "Please enter an email"]
  },
  profImage_url: String
})

const User = mongoose.model("User", userSchema);

const initializePassport=require(__dirname+"/passport-config.js");

initializePassport(passport, username =>{
  return User.find({})
})




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

mongoose.connect('mongodb+srv://ashtxn:7jYYZ4UbLSm72OPY@cluster0.c9ryrrx.mongodb.net/fightclubDB?retryWrites=true&w=majority');

const fighterSchema = new mongoose.Schema({
  url: String,
  name: {
      type: String,
      required: [true, "Please check your data entry, no name specified!"]
  },
  nickname: String,
  age: Number,
  birthday: String,
  locality: String,
  nationality: String,
  association: String,
  height: String,
  weight: String,
  weight_class: String,
  image_url: String,
  wins: Object,
  losses: Object,
  no_contests: Number,
  comments: [Object],
  fights: [Object]});

  const eventSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please check your data entry, no name specified!"]
    },
    picture: String,
    org: String,
    location: String,
    date: String,
    posterURL: String,
    comments: [Object],
    mainCard: [Object],
    prelims: [Object]
  });




  const Fighter = mongoose.model("Fighter", fighterSchema);
  const Event = mongoose.model("Event", eventSchema);

let events = [];
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
  Event.find({}).then(function(foundEvents){
    res.render("events", {newEvents: foundEvents});
  })
})

app.get("/event/:eventName", function(req,res){
  Event.find({}).then(function(foundEvents){
    foundEvents.forEach(function(event){
      let lowEventID = _.lowerCase(req.params.eventName);
      let lowID=_.lowerCase(event._id);
      if (lowEventID===lowID){
        Fighter.find({}).then(function(foundFighters){
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

app.get("/signup", function(req,res){
  res.render("signup");
});

app.post("/signup",async function(req,res){
  if (req.body.password===req.body.confirmPassword){
    try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let newUser = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    }
    const newuser = new User(newUser);
    newuser.save();
    res.redirect('/login');
  } catch{
    res.redirect("register");
  }
  User.find({}).then(function(usersFound){
    console.log(usersFound);
  })
  } else{
    res.redirect("/register");
    alert("Passwords did not match. please try again")
  }
  
});


app.get("/login", function(req,res){
  res.render("login");
});

app.post("/login", passport.authenticate("local", {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

  app.get("/fighter/:fighterName", function(req,res){
    Fighter.findOne({name: req.params.fighterName}).then(function(fighter){
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
   saveFighter(req.body.mainFighter1Name[i]);
   saveFighter(req.body.mainFighter2Name[i]);
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
   saveFighter(req.body.prelimFighter1Name[i]);
   saveFighter(req.body.prelimFighter2Name[i]);
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
  const newEvent = new Event(event);
  google.eventPosterSearch(event.name).then(function(images){
    newEvent.posterURL=images[0].url;
    newEvent.save();
  })

  Event.find({}).then(function(foundEvents){
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


app.listen(3000, function () {
    console.log("Server started on port 3000.");
  });

  


async function saveFighter(FName){

  Fighter.findOne({name: FName}).then(function(foundFighter){
    if (foundFighter !=null){
      console.log("Fighter already in database")
    } else{
      mma.api(FName, (data) =>{
        const fighter = new Fighter(data);
        if(fighter.fights[0].name.substring(0,3)==="UFC"){
          google.ufcFighterImageSearch(fighter.nickname,fighter.name).then(images => {
            fighter.image_url=images[0].url;
            fighter.save();
        });;
    
        } else{
          google.regionalFighterImageSearch(fighter.nickname,fighter.name).then(images => {
            fighter.image_url=images[0].url;
            fighter.save();
          })
        };
      });
    }
  })

}   

async function saveFighterOpponents(fighterName){
  mma.api(fighterName, (data)=>{ //amanda nunes data
    const fighter=new Fighter(data); //fighter = amanda
    let opponentNames = [];
    savedCount=0; //saved count =0
    for (let i=0;i<data.fights.length;i++){
        opponentNames[i]= fighter.fights[i].opponent;
    } //array filled with opp names
    let uniqueOpponents=[...new Set(opponentNames)];
    uniqueOpponents.forEach(function(name){ //for each opponent do all this
      
      saveFighter(name);
      
    })
  })
}
    
//     opponentNames.forEach(function(name){
//         mma.api(name, (newData) =>{
//             const newFighter = new Fighter(newData);
//             if(newFighter.fights[0].name.substring(0,3)==="UFC"){
//               google.ufcFighterImageSearch(newFighter.nickname,newFighter.name).then(function(newURL){
//                 newFighter.image_url=newURL;
//                 newFighter.save();
//               });
//             } else{
//               google.regionalFighterImageSearch(newFighter.nickname,newFighter.name).then(function(newURL){
//                 newFighter.image_url=newURL;
//                 newFighter.save();
//               });
//             }
//   });     
// }); 


async function updateImage(){

}
 


async function getFighterID(name){
  try{
    let id = await Fighter.findOne({name: name},_id);
    return id;

  }
  catch(error){
    console.log(error);
  }
}
