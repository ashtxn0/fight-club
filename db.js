const mongoose = require('mongoose');
var bcrypt = require("bcrypt");
const mma=require("mma-api");
const google=require(__dirname+"/googleSearch.js");

mongoose.connect('mongodb+srv://ashtxn:7jYYZ4UbLSm72OPY@cluster0.c9ryrrx.mongodb.net/fightclubDB?retryWrites=true&w=majority');

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
      const User = mongoose.model("User", userSchema);

      exports.findALLEvents = async function(){
        var events= await Event.find({});
        return events;
      }

      exports.findALLFighters = async function(){
        var fighters= await Fighter.find({});
        return fighters;
      }

      exports.findALLUsers = async function(){
        var users= await User.find({});
        return users;
      }

      exports.findUserByUsername = async function(username){
        let user= await User.findOne({username:username});
        return user;
      }

      exports.findUserByID = async function(ID){
        let user= await User.findOne({_id: ID});
        return user;
      }

      exports.saveUser = async function(username, password, email){
        const hashedPassword = await bcrypt.hash(password, 10);
        let newUser = {
            username: username,
            email: email,
            password: hashedPassword
        }
        const newuser = new User(newUser);
        newuser.save();
      }

      exports.findFighterByName = async function (name){
        let fighter=Fighter.findOne({name:name});
        return fighter;
      }

      exports.saveFighterByName = async function(Fname){
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

      exports.saveEvent = async function(event){
        const newEvent = new Event(event);
        google.eventPosterSearch(event.name).then(function(images){
            newEvent.posterURL=images[0].url;
            newEvent.save();
        })
      }

      exports.saveFighterOpponents = async function(fighterName){
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