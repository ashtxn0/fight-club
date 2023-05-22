const mongoose = require('mongoose');
const mma=require("mma-api");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const multer  = require('multer');
const upload = multer({dest: __dirname+'/public/data/uploads/'})


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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
    mainCard: [Object],
    prelims: [Object]
  });

  const Fighter = mongoose.model("Fighter", fighterSchema);
  const Event = mongoose.model("Event", eventSchema);

let events = [];

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

app.get("/compose-event", function(req,res){
  res.render("compose-event");
  
})

app.post("/", upload.single('eventPicture'), function(req,res){
  let mainCard = [];
  let prelims=[];

  for(let i=0;i<req.body.mainFighter1Name.length;i++){
    mainCard[i]={
    fighterName: req.body.mainFighter1Name[i],
    opponentName: req.body.mainFighter2Name[i],
    weightClass: req.body.mainWeightClass[i]
  }
   saveFighter(req.body.mainFighter1Name[i]);
   saveFighter(req.body.mainFighter2Name[i]);
  }
  

  for(let i=0;i<req.body.prelimFighter1Name.length;i++){
    prelims[i]={
    fighterName: req.body.prelimFighter1Name[i],
    opponentName: req.body.prelimFighter2Name[i],
    weightClass: req.body.prelimWeightClass[i]
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
    prelims: prelims
  }
  const newEvent = new Event(event);
  newEvent.save();

  Event.find({}).then(function(foundEvents){
    res.render("events", {newEvents: foundEvents});
  })



}


)


app.listen(3000, function () {
    console.log("Server started on port 3000.");
  });

  


async function saveFighter(FName){
  mma.api(FName, (data) =>{
    const fighter = new Fighter(data);
    fighter.save();
    // let opponentNames = [];
    // for (let i=0;i<data.fights.length;i++){
    //     opponentNames[i]= data.fights[i].opponent;
    // }
    // opponentNames.forEach(function(name){
    //     mma.api(name, (newData) =>{
    //         const newFighter = new Fighter(newData);

    //         newFighter.save();
    //     })      
    // })
});
}  


async function getFighterID(name){
  try{
    let id = await Fighter.findOne({name: name},"id");
    console.log(id);
    return id;

  }
  catch(error){
    console.log(error);
  }
}
