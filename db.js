const mongoose = require('mongoose');
var bcrypt = require("bcrypt");
const mma=require("mma-api");
const google=require(__dirname+"/googleSearch.js");
const odds = require(__dirname+"/getBettingLines.js");
var _ = require("lodash");
const { name } = require('ejs');
const { ObjectId } = require('mongodb');
const fs = require('fs-extra');
const uri = process.env.MONGODB_URI;
const levenshtein = require('fast-levenshtein');


mongoose.connect(uri);


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
    required: [true, "Please enter a password"]
  },
  followers: [String],
  following: [String],
  favFighter: String,
  favPromo: String,
  aboutMe: String,
  totalProfit: {
    type: Number,
    default:0
  },
  totalWager:{
    type: Number,
    default:0
  },
  betWins: {
    type: Number,
    default:0
  },
  betLosses:{
    type: Number,
    default:0
  },
  profileTheme: {
    type:String,
    default: "default"
  },
  profImage_url: {
    type:String,
    default:"default-prof-image.png"
  },
  coverImage_url: {
    type:String,
    default:"default-cover-image.png"
  },
  predictionWins: {
    type: Number,
    default: 0
  },
  predictionLosses: {
    type: Number,
    default: 0
  },
  mmr: {
    type: Number,
    default: 0
  },
  customerId: String,
  comments: [Object],
  premium: {
    type: Boolean,
    default: false
  },
  admin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const gameStats = {
  type: Number,
  default: 0
};

const organizations = ["ufc", "pfl", "bellator", "regional"];

organizations.forEach(org => {
  const orgPredictionWinsField = `${org}PredictionWins`;
  const orgPredictionLossesField = `${org}PredictionLosses`;
  const orgMmrField = `${org}Mmr`;

  userSchema.add({
    [orgPredictionWinsField]: gameStats,
    [orgPredictionLossesField]: gameStats,
    [orgMmrField]: gameStats
  });
});


  const predictionSchema = new mongoose.Schema({
    eventID: {
      type: String,
      required: [true, "Please enter an event id for the prediction"]
    },
    fightID: {
      type: String,
      required: [true, "Please enter a fight id for the prediction"]
    },
    fighterID: {
      type: String,
      required: [true, "Please enter a fighter id for the prediction"]
    },
    userID: {
      type: String,
      required: [true, "Please enter a user id for the prediction"]
    },
    outcome: String,
    predictionName: String,
    fighterName: String,
    opponentName: String,
    eventName: String,
    orgName: String,
    mmrChange:Number,
    orgMmrChange: Number
  })

  const fighterSchema = new mongoose.Schema({
    url: String,
    name: {
        type: String
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
    approvedPhoto:{type: Boolean, default: false},
    comments: [Object],
    fights: [Object]});

    const fightSchema = new mongoose.Schema({
    eventID: String,
    name: String,
    date: Date,
    fighterID: String,
    opponentID: String,
    result: String,
    method: String,
    round: String,
    comments: [Object],
    predictionClosed: Boolean,
    time: String});

    const eventSchema = new mongoose.Schema({

        name: {
            type: String,
            required: [true, "Please check your data entry, no name specified!"]
        },
        picture: String,
        org: String,
        location: String,
        date: Date,
        posterURL: String,
        cancelledBouts: [Object],
        comments: [Object],
        mainCard: [Object],
        prelims: [Object]
      });

      const betLineSchema = new mongoose.Schema({
        eventID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Event',
        },
        fightID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Fight',
        },
        fightName: String,
        type: String,
        odds: Number,
        condition: String,
        opponentName: String,
        win: Boolean,
        bettingClose: {
          type: Boolean,
          default: false
        },
        dislikes: {
          type: Number,
          default: 0
        },
        likes: {
          type: Number,
          default: 0
        },
        trackedCount: {
          type: Number,
          default: 0
        },
        comments:[Object]
      });

      const betSchema = new mongoose.Schema({
        betSlip: [betLineSchema],
        odds: Number,
        userID: String,
        wager:Number,
        win: Boolean,
        profit: Number
      });

      const visitorSchema = new mongoose.Schema({
        visitorId: { type: String, required: true },
        date: { type: Date, required: true },
      });

      const Fighter = mongoose.model("Fighter", fighterSchema);
      const Event = mongoose.model("Event", eventSchema);
      const Fight = mongoose.model("Fight",fightSchema);
      const Prediction = mongoose.model("Prediction",predictionSchema);
      const User = mongoose.model("User", userSchema);
      const Line = mongoose.model("Line", betLineSchema);
      const Bet = mongoose.model("Bet", betSchema);
      const Visitor = mongoose.model('Visitor', visitorSchema);

      exports.findALLEvents = async function(){
        var events= await Event.find({}).sort({date: 1});
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
        let foundUser= await User.findOne({username:username});
        return foundUser;
      }

      exports.findUserProfileType = async function(userID){
        let foundUser=await User.findOne({_id:userID},"admin");
        return foundUser;
      }

      exports.findUserByEmail = async function(email){
        let user= await User.findOne({email:email});
        return user;
      }

      var findUserByID= exports.findUserByID = async function(ID){
        let user= await User.findOne({_id: ID});
        return user;
      }

      exports.getUnapprovedPhoto = async function(){
        let fighter = await Fighter.findOne({approvedPhoto:false});
        // const count = await Fighter.countDocuments({ approvedPhoto: false });
        // console.log(count+"unapproved photos");
        return fighter;
      }

      exports.approvePhoto = async function(documentId){
        await Fighter.updateOne({_id:documentId},{approvedPhoto:true});
        return "approved"
      }

      exports.changePhoto = async function(documentId,newURL){
        await Fighter.updateOne({_id:documentId},{image_url:newURL,approvedPhoto:true});
        return "photo changed"
      }

      exports.findEventsWithBettingLines = async function () {
        try {
          const eventsWithLines = await Event.aggregate([
            {
              $lookup: {
                from: 'lines',
                localField: '_id',
                foreignField: 'eventID',
                as: 'lines',
              },
            },
            {
              $addFields: {
                lines: {
                  $filter: {
                    input: '$lines',
                    as: 'line',
                    cond: { $ne: ['$$line.bettingClose', true] },
                  },
                },
              },
            },
            {
              $match: {
                lines: { $exists: true, $ne: [] },
              },
            },
          ]);
      
          // Sort the lines array within each event document by fightID
          eventsWithLines.forEach((eventWithLines) => {
            if (Array.isArray(eventWithLines.lines)) {
              eventWithLines.lines.sort((a, b) => {
                const fightIDA = a.fightID.toString();
                const fightIDB = b.fightID.toString();
                return fightIDA.localeCompare(fightIDB);
              });
            }
          });
      
          return eventsWithLines;
        } catch (error) {
          console.log('Error:', error);
          throw error;
        }
      };
      
      


      exports.saveUser = async function(username, password, email,stripeCustomerId) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          let newUser = {
            username: username,
            email: email,
            password: hashedPassword,
            customerId:stripeCustomerId,
          };
      
          const newuser = new User(newUser);
          await newuser.save();
        } catch (error) {
          console.error(error);
          throw new Error('Error saving the user.');
        }
      };

      exports.trackUserBet = async function(userID,betSlip,wager,odds){
        try{

          const hasBettingClose = betSlip.some((line) => line.bettingClose === true);

          if (hasBettingClose) {
            console.log("Betting is closed for one or more bet slips. Not saving the bet.");
            return; // Return early without saving anything
          }

          for (const line of betSlip) {
            const foundLine = await Line.findById(line._id);
            if (foundLine) {
              line.fightName = foundLine.fightName;
            } else {
              console.error("Line not found in the database for lineID:", line.lineID);
            }
          }
          
          let newBet = {
            betSlip:betSlip,
            wager:wager,
            odds:odds,
            userID:userID,
          }
          console.log(newBet);
          const bet= new Bet(newBet);
          await bet.save();
          for (const line of betSlip) {
            await Line.findByIdAndUpdate(line.lineID, { $inc: { trackedCount: 1 } });
          }
        } catch (error){
          console.error(error);
          throw new Error('Error saving the bet.');
        }
      }

      

      exports.getUserTrackedBetInfo = async function (userID) {
        try {
          const result = await Bet.aggregate([
            // Filter bets for a specific userID
            { $match: { userID: userID } },
      
            // Unwind the betSlip array to create separate documents for each bet
            { $unwind: "$betSlip" },
      
            // Lookup to join the fight information
            {
              $lookup: {
                from: "fights", // Assuming "fights" is the name of the Fight collection
                localField: "betSlip.fightID",
                foreignField: "_id",
                as: "fightInfo",
              },
            },
      
            // Unwind the fightInfo array to create separate documents for each fight
            { $unwind: "$fightInfo" },
      

            {
              $lookup: {
                from: "events", // Assuming "fights" is the name of the Fight collection
                localField: "betSlip.eventID",
                foreignField: "_id",
                as: "eventInfo",
              },
            },
      
            // Unwind the fightInfo array to create separate documents for each fight
            { $unwind: "$eventInfo" },



      
            // Group by eventID and fightID to calculate profit and other details
            {
              $group: {
                _id: "$_id",
                eventID: { $first: "$fightInfo.eventID" },
                odds: { $first: "$odds" },
                eventName: { $first: "$fightInfo.name" },
                eventDate: { $first: "$fightInfo.date" },
                profit: { $first: "$profit" },
                wager: { $first: "$wager" },
                win: { $first: "$win" },
                bettingLines: {
                  $push: {
                    condition: "$betSlip.condition",
                    fightID: "$betSlip.fightID",
                    odds: "$betSlip.odds",
                    fightName: "$betSlip.fightName",
                    opponentName: "$betSlip.opponentName",
                    type: "$betSlip.type",
                  },
                },
                eventPicture: {$first: "$eventInfo.picture"},
              },
            },
      
            // Group by eventID to consolidate fight-level data into event-level data
            {
              $group: {
                _id: "$eventID",
                eventName: { $first: "$eventName" },
                eventDate: { $first: "$eventDate" },
                eventPicture: {$first: "$eventPicture"},
                profit: { $sum: "$profit" },
                wager: { $sum: "$wager" }, // Calculate the total wager directly from the Bet document
                bets: {
                  $push: {
                    odds: "$odds",
                    wager: "$wager",
                    profit: "$profit",
                    win: "$win",
                    bettingLines: "$bettingLines",
                  },
                },
              },
            },

            { $sort: { eventDate: -1 } },
      
            // Project to rename _id to eventID
            {
              $project: {
                _id: 0,
                eventID: "$_id",
                eventName: 1,
                eventPicture: 1,
                eventDate: 1,
                profit: 1,
                wager: 1,
                bets: 1,
              },
            },
          ]);
      
          return result;
        } catch (err) {
          console.error("Error while aggregating data:", err);
          return [];
        }
      };
      
      
      
      exports.getUserCustomerId = async function(id){
        const user = await User.findOne({_id:id},"customerId");
        return user.customerId
      }

      exports.findFighterByName = async function (name){
        let fighter=Fighter.findOne({name:name});
        return fighter;
      }

      exports.findFightResults = async function(fightID){
     
        let results= await Fight.find({_id:fightID},"result method");
   
        return sortArray(results,"_id",fightID);
      }

      exports.findFightersByName = async function (names){
        let fighters= await Fighter.find({name:names});
        let sortedFighters=[];
        fighters.forEach(function(fighter){
          for(let i=0; i<names.length;i++){
            if (names[i]===fighter.name){
              sortedFighters[i]=fighter;
            }
        }
        })
        
        return sortedFighters;
      }

      exports.findPredictionsByFight= async function(fightId){
        let predictions = await Prediction.find({fightID:fightId});
        for(let i=0;i<predictions.length;i++){
          let user= await findUserByID(predictions[i].userID);
          predictions[i].username=user.username;
        }
        return predictions;
      }

      exports.findUserImage = async function(username){
        let user = await User.findOne({username:username});
          return user.profImage_url;        
      }

      exports.findFighterByid = async function (fighterID){
        let fighter=Fighter.findOne({_id:fighterID});
        return fighter;
      }

      exports.getTop25Rankings= async function(leaderboardType){
        if (leaderboardType==="all"){
          let p4pTop25= await User.find({},"username predictionWins predictionLosses mmr profImage_url").sort({mmr:-1}).limit(25);
          let ufcTop25= await User.find({},"username ufcPredictionWins ufcPredictionLosses ufcMmr profImage_url").sort({ufcMmr:-1}).limit(25);
          let bellatorTop25= await User.find({},"username bellatorPredictionWins bellatorPredictionLosses bellatorMmr profImage_url").sort({bellatorMmr:-1}).limit(25);
          let pflTop25= await User.find({},"username pflPredictionWins pflPredictionLosses pflMmr profImage_url").sort({ufcMmr:-1}).limit(25);
          return([p4pTop25,ufcTop25,bellatorTop25,pflTop25]);
        }
      }

      var getUserPredictionInfo = exports.getUserPredictionInfo = async function(userID, orgName) {
        let predictions = new Map();
        let fighterIDs = new Set();
        let fightIDs = new Set();
      
        let mmr, wins, losses;
        if (orgName === "ALL") {
          mmr = "mmr";
          wins = "predictionWins";
          losses = "predictionLosses";
          const allPredictions = (await Prediction.find({ userID: userID })).reverse();
          allPredictions.forEach((prediction, index) => {
            predictions.set(index, prediction);
            fighterIDs.add(prediction.fighterID);
            fightIDs.add(prediction.fightID);
          });
        } else {
          wins = _.lowerCase(orgName) + "PredictionWins";
          losses = _.lowerCase(orgName) + "PredictionLosses";
          mmr = _.lowerCase(orgName) + "Mmr";
          const filteredPredictions = (await Prediction.find({ userID: userID, orgName: orgName })).reverse();
          filteredPredictions.forEach((prediction, index) => {
            predictions.set(index, prediction);
            fighterIDs.add(prediction.fighterID);
            fightIDs.add(prediction.fightID);
          });
        }
      
        let stats = await User.find({ _id: userID }, [wins, losses, mmr]);
        let rank = await findRanking(userID, orgName);
      
        let [fighters, fights] = await Promise.all([
          Fighter.find({ _id: { $in: Array.from(fighterIDs) } }, "name"),
          Fight.find({ _id: { $in: Array.from(fightIDs) } }, "fighterID opponentID name")
        ]);
      
        let fighterMap = new Map(fighters.map(fighter => [fighter._id.toString(), fighter.name]));
      
        let opponentIDs = new Set();
        let opponentMap = new Map();
      
        for (let fight of fights) {
          opponentIDs.add(fight.fighterID.toString());
          opponentIDs.add(fight.opponentID.toString());
        }
      
        let opponents = await Fighter.find({ _id: { $in: Array.from(opponentIDs) } }, "name");
        for (let opponent of opponents) {
          opponentMap.set(opponent._id.toString(), opponent.name);
        }
      
        for (let [index, prediction] of predictions) {
          let fight = fights.find(f => f._id.toString() === prediction.fightID);
          if (fight) {
            prediction.fighterName = fighterMap.get(prediction.fighterID.toString()) || "";
            prediction.opponentName = (prediction.fighterID.toString() === fight.fighterID.toString())
              ? opponentMap.get(fight.opponentID.toString()) || ""
              : opponentMap.get(fight.fighterID.toString()) || "";
            prediction.eventName = fight.name || "";
            predictions.set(index, prediction);
          }
        }
      

        let data = {
          predictions: Array.from(predictions.values()),
          wins: stats[0][wins],
          losses: stats[0][losses],
          mmr: stats[0][mmr],
          rank: rank
        };
      
        return data;
      }
      
      
      
      
      

      var findRanking = exports.findRanking = async function(userID,orgName){
        if(orgName==="ALL"){
          let users = await User.find({},"mmr").sort({mmr:-1});
            rank=users.map(({_id})=> _id.toString()).indexOf(userID)+1;
            return rank;

        } else{
          mmr=_.lowerCase(orgName)+"Mmr";
          let users = await User.find({},[mmr]).sort({[mmr]:-1});
            rank=users.map(({_id})=> _id.toString()).indexOf(userID)+1;
            return rank;

      }
    }

      exports.findPredictionsByUserID = async function(userID){
        
        let predictions=await Prediction.find({userID:userID});
        // need event name, fighter/opponent name, predicted name of each prediction
        //predicted name
        let sortingArray=predictions.map(({fighterID})=>fighterID);
        let fighterNames = await Fighter.find({_id: {$in:sortingArray}},"name");
        fighterNames= await sortArray(fighterNames,"_id",sortingArray);

        let eventsSortingArray=predictions.map(({eventID})=>eventID);
        let events = await Event.find({_id:{$in:eventsSortingArray}},"name org");
        
        events= await sortArray(events,"_id",eventsSortingArray);
        
        let eventNames=events.map(({name})=>name);
        let eventOrgs=events.map(({org})=>org);

        let fightsSortingArray=predictions.map(({fightID})=>fightID);
        let fightNames = await Fight.find({_id:{$in:fightsSortingArray}},"fighterID opponentID");
        let fighterNames1=await Fighter.find({_id: {$in:fightNames.map(({fighterID})=>fighterID)}},"name");
        let opponentNames=await Fighter.find({_id: {$in:fightNames.map(({opponentID})=>opponentID)}},"name");

        fightNames = await sortArray(fightNames,"_id",fightsSortingArray);

        fighterNames1 = await sortArray(fighterNames1,"_id",fightNames.map(({fighterID})=>fighterID));
        opponentNames = await sortArray(opponentNames,"_id",fightNames.map(({opponentID})=>opponentID));


          for(let i=0;i<predictions.length;i++){
          predictions[i].predictionName=fighterNames[i].name;
          predictions[i].eventName=eventNames[i];
          predictions[i].orgName=eventOrgs[i];
          predictions[i].fighterName=fighterNames1[i].name;
          predictions[i].opponentName=opponentNames[i].name;
        }
        return predictions.reverse();
      }


      exports.findEventByID = async function (eventID){
        let event= await Event.findOne({_id: eventID});
        return event;
      }

      exports.findFightByID = async function(fightID){
        let fight=await Fight.findOne({_id: fightID});
        return fight;
      }

      exports.findFightsByIDSortedComments = async function (fightID){
        let fights= await Fight.find({_id: fightID});

        let sortedFights=[];
        fights.forEach(function(fight){
          for(let i=0;i<fights.length;i++){
          if (fightID[i]===fight.id){
            sortedFights[i]=fight;
          }
        }
        })
        sortedFights.forEach(function(fight){
          fight.comments=_.sortBy(fight.comments,"likes").reverse();
        })
        return sortedFights;
      }



      exports.getFighterID = async function(name){
        let fighterID=Fighter.findOne({name:name}, "_id");
        return fighterID;
      }

      exports.saveFightComment = async function(fightID,comment){
        await Fight.findOneAndUpdate({_id:fightID},{$push:{comments:comment}}).then(function(fight){
        });
        let comments= Fight.findOne({_id:fightID},"comments");
        return comments;
      }

      exports.saveEventComment = async function(eventID,comment){
        await Event.findOneAndUpdate({_id:eventID},{$push:{comments:comment}}).then(function(event){
        });
        let comments= Event.findOne({_id:eventID},"comments");
        return comments;
      }

      exports.saveFighterComment = async function(fighterID,comment){
        await Fighter.findOneAndUpdate({_id:fighterID},{$push:{comments:comment}}).then(function(event){
        });
        let comments= Fighter.findOne({_id:fighterID},"comments");
        return comments;
      }

      exports.saveUserComment = async function(userID,comment){
        await User.findOneAndUpdate({_id:userID},{$push:{comments:comment}}).then(function(event){
        });
        let comments= User.findOne({_id:userID},"comments");
        return comments;
      }

      exports.updatePremiumStatus = async function(userID,premiumStatus,customerId){
        await User.updateOne({_id:userID}, {premium: premiumStatus,customerId:customerId});
      }

      exports.updatePremiumStatusByCustomerId = async function(customerId,premiumStatus){
        await User.updateOne({customerId:customerId}, {premium: premiumStatus});
      }

      exports.saveFighterByName = async function(Fname){
        Fighter.findOne({name: Fname}).then(function(foundFighter){
            if (foundFighter !=null){
              console.log("Fighter already in database")
            } else{
              console.log(Fname+" being saved to the db");
              mma.api(Fname, (data) =>{
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


      var saveFighterByNameAndAddFight = exports.saveFighterByNameAndAddFight = async function(Fname,eventName,eventDate,opponentName,isTitleFight){
        
        let fight={
          name:eventName,
          date:eventDate,
          opponent:opponentName,
          result:"-",
          method:"",
          round:"",
          time:"",
          isTitleFight:isTitleFight
        }  
        Fighter.findOneAndUpdate({name: Fname},{
          $push:{
          fights:{
            $each: [fight],
            $position: 0
          }
        }
      }).then(function(foundFighter){
          if (foundFighter !=null){
              console.log("Fighter already in database");
            } else{
              mma.api(Fname, (data) =>{
                data.fights.unshift(fight);
                const fighter = new Fighter(data);
                if(fighter.fights[0].name.substring(0,3)==="UFC"){
                  google.ufcFighterImageSearch(fighter.nickname,fighter.name).then(images => {
                    fighter.image_url=images[0].url;
                    fighter.save();
                });;
            
                } else{
                  google.regionalFighterImageSearch(fighter.nickname,fighter.name).then(images => {
                    if (images[0]!=undefined){
                      fighter.image_url=images[0].url;
                      fighter.save();
                    } else{
                      fighter.save();
                    }
                    
                    
                  })
                };
              });
            }
          })
      }

      exports.findUserIdByUsername = async function(username){
        const userID= await User.findOne({username:username},"_id");
        return userID;
      }

      exports.getUpcomingEvents = async function(){
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        const events = await Event.find({date:{$gte: yesterday }});
        // const events = await Event.find({}).sort({createdAt: -1}).limit(5);

        return events;
      }

      exports.addFightTapeindex = async function(fighterID,fightName,link,time){
        try{
          //Update the fight in the fighter document with the tape
          let fighter;
          if(time){
            fighter = await Fighter.findOneAndUpdate({_id:fighterID,"fights.name":fightName},{"fights.$.tape_url":link,"fights.$.tape_time":time});
          } else{
            fighter = await Fighter.findOneAndUpdate({_id:fighterID,"fights.name":fightName},{"fights.$.tape_url":link});
          }
          //obtain the name of the opponent
          const fightIndex = fighter.fights.findIndex(fight => fight.name === fightName);
          const opponent = fighter.fights[fightIndex].opponent;
          //Also update the fight in the opponent document with the tape
          const opponentFighter = await Fighter.findOneAndUpdate({name:opponent,"fights.name":fightName},{"fights.$.tape_url":link});
          if (opponentFighter) {
            return "Tape added";
          } else {
            return "Opponent fighter not found";
          }

        } catch (error){
          console.error("Error updating fighter document:", error);
          return "Error updating fighter document";
        }
        
        
        return "tape added"
      }
      var saveFighterByURL = exports.saveFighterByURL = async function(URL){
        Fighter.findOne({url:URL}).then(function(foundFighter){
            if (foundFighter !=null){
              console.log("Fighter already in database")
            } else{
              mma.url(URL, (data) =>{
                const fighter = new Fighter(data);
                if(fighter.fights[0].name.substring(0,3)==="UFC"){
                  google.ufcFighterImageSearch(fighter.name).then(images => {
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


      // saveFighterByURL('https://www.sherdog.com/fighter/Erique-Owens-305079');
      var likeComment = exports.likeComment =  async function(commentUsername,timePosted,username,contentType){
        let foundcontent={};
        async function init(){
          if(contentType==="fight"){
          foundcontent = await Fight.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        } else if (contentType==="event"){
          foundcontent = await Event.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        } else if (contentType==="fighter"){
          foundcontent = await Fighter.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        } else if (contentType==="user"){
          foundcontent = await User.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        }
        }
        
        
        let foundComment="";


          async function like(){
          for (i=0;i<foundcontent.comments.length;i++){
            if (foundcontent.comments[i].username === commentUsername && foundcontent.comments[i].timePosted === timePosted){
              foundComment=foundcontent.comments[i];
            }
          }
          if(foundComment.usersLiked === undefined || foundComment.likes === 0){
            let result = "liked";
            if(foundComment.usersDisliked != undefined && foundComment.usersDisliked.includes(username)){
              //remove dislike if the user has disliked before liking
              dislikeComment(commentUsername,timePosted,username,contentType);
              result = "liked and undisliked";
            }
            foundComment.likes++;
            foundComment.usersLiked=[username];
            if(contentType==="fight"){
            await Fight.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
            } else if (contentType==="event"){
              await Event.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
            } else if (contentType==="fighter"){
              await Fighter.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
            } else if (contentType==="user"){
              await User.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
            }
            return result;


          }else{
            let userliked=0;
            for(i=0;i<foundComment.usersLiked.length;i++){
              if(foundComment.usersLiked[i]===username){
                foundComment.likes--;
                const index = foundComment.usersLiked.indexOf(username);
                if (index > -1){
                  foundComment.usersLiked.splice(index,1);
                }
                userliked=1;
                if(contentType==="fight"){
                await Fight.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
                const result = "unliked";
                return result;
                } else if (contentType==="event"){
                  await Event.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
                  const result = "unliked";
                  return result;
                } else if (contentType==="fighter"){
                  await Fighter.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
                  const result = "unliked";
                  return result;
                } else if (contentType==="user"){
                  await User.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
                  const result = "unliked";
                  return result;
                }
              };
            }

            if (userliked===0){
              let result = "liked";
              if(foundComment.usersDisliked != undefined && foundComment.usersDisliked.includes(username)){
                //remove dislike if the user has disliked before liking
                dislikeComment(commentUsername,timePosted,username,contentType);
                result = "liked and undisliked";
              }
              foundComment.likes++;
              foundComment.usersLiked.push(username);
              
              if(contentType==="fight"){
                await Fight.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
                } else if (contentType==="event"){
                  await Event.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
                } else if (contentType==="fighter"){
                   await Fighter.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
                } else if (contentType==="user"){
                  await User.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersLiked": foundComment.usersLiked,"comments.$.likes": foundComment.likes});
               }
                return result;
              
            } 
          }
          }
          await init();
          return await like();
      }

      var dislikeComment = exports.dislikeComment =  async function(commentUsername,timePosted,username,contentType){
        let foundcontent={};
        async function init(){
          if(contentType==="fight"){
          foundcontent = await Fight.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        } else if (contentType==="event"){
          foundcontent = await Event.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        } else if (contentType==="fighter"){
          foundcontent = await Fighter.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        } else if (contentType==="user"){
          foundcontent = await User.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        }
        }
        
        
        let foundComment="";


        async function dislike(){
        for (i=0;i<foundcontent.comments.length;i++){
          if (foundcontent.comments[i].username === commentUsername && foundcontent.comments[i].timePosted === timePosted){
            foundComment=foundcontent.comments[i];
          }
        }
        if(foundComment.usersDisliked === undefined || foundComment.dislikes === 0){
          let result = "disliked";
          if(foundComment.usersLiked != undefined && foundComment.usersLiked.includes(username)){
            //remove like if the user has liked before disliking
            likeComment(commentUsername,timePosted,username,contentType);
            result="disliked and unliked"
          }
          foundComment.dislikes++;
          foundComment.usersDisliked=[username];
          if(contentType==="fight"){
            await Fight.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
            } else if (contentType==="event"){
              await Event.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
            } else if (contentType==="fighter"){
              await Fighter.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
            } else if (contentType==="user"){
              await User.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
            }
            return result;
          


        }else{
          let userdisliked=0;
          for(i=0;i<foundComment.usersDisliked.length;i++){
            if(foundComment.usersDisliked[i]===username){
              userdisliked=1;
              foundComment.dislikes--;
                const index = foundComment.usersDisliked.indexOf(username);
                if (index > -1){
                  foundComment.usersDisliked.splice(index,1);
                }
              
              if(contentType==="fight"){
                await Fight.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
                const result = "undisliked";
                return result;
              } else if (contentType==="event"){
                await Event.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
                const result = "undisliked";
                return result;
              } else if (contentType==="fighter"){
                await Fighter.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
                const result = "undisliked";
                return result;
              } else if (contentType==="user"){
                await User.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
                const result = "undisliked";
                return result;
              }
              
              
              
            };
          }

          if (userdisliked===0){
            let result = "disliked";
            if(foundComment.usersLiked != undefined && foundComment.usersLiked.includes(username)){
              //remove like if the user has liked before disliking
              likeComment(commentUsername,timePosted,username,contentType);
              result="disliked and unliked"
            }
            foundComment.dislikes++;
            foundComment.usersDisliked.push(username);
            if (contentType==="fight"){
              await Fight.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
            return result;
            } else if (contentType==="event"){
              await Event.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
            return result;
            } else if (contentType==="fighter"){
              await Fighter.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
              return result;
            } else if (contentType==="user"){
              await User.findOneAndUpdate({comments: {$elemMatch:{username:commentUsername, timePosted:timePosted}}},{"comments.$.usersDisliked": foundComment.usersDisliked,"comments.$.dislikes": foundComment.dislikes});
              return result;
            }
            
            
          } 
        }
        }
        await init();
        return await dislike();
    }
    
      exports.saveEvent = async function(event){
        const newEvent = new Event(event);

        event.mainCard.forEach(async function(mainFight){
          let fighterID = await Fighter.findOne({name: mainFight.fighterName});
          let opponentID = await Fighter.findOne({name: mainFight.opponentName});
          let fight={
            name: event.name,
            date: event.date,
            fighterID: fighterID.id,
            opponentID: opponentID.id,
            weightClass: mainFight.weightClass,
            result:"-",
            predictionClosed:false
          }
          const newfight = new Fight(fight);
          newfight.save();
             
        });
        event.prelims.forEach(async function(prelim){
          let fighterID = await Fighter.findOne({name: prelim.fighterName});
          let opponentID = await Fighter.findOne({name: prelim.opponentName});

          let newPrelim={
            name: event.name,
            date: event.date,
            fighterID: fighterID.id,
            opponentID: opponentID.id,
            weightClass: prelim.weightClass,
            result:"-",
            predictionClosed:false
          }
          const newprelim = new Fight(newPrelim);
          newprelim.save();
        })
        
        google.eventPosterSearch(event.name).then(async function(images){
            newEvent.posterURL=images[0].url;
            await newEvent.save().then(async function(savedEvent){
              await Fight.updateMany({name: savedEvent.name}, { eventID: savedEvent.id } );
              await Fight.find({eventID:savedEvent.id}).then(async function(fights){
                fights.forEach(async function(fight){
                  await Fighter.findOne({_id: fight.fighterID}).then(async function(fighter){
                    await Fighter.findOne({_id:fight.opponentID}).then(async function(opponent){
                      await Event.updateOne({_id: savedEvent.id, "mainCard.fighterName":fighter.name,"mainCard.opponentName":opponent.name},{"mainCard.$.fightID":fight.id.toString()});
                      await Event.updateOne({_id: savedEvent.id, "prelims.fighterName":fighter.name,"prelims.opponentName":opponent.name},{"prelims.$.fightID":fight.id.toString()});
                    })
                  })
                })
              })
            });
        })
        
      }

      
      
      
// Fight.deleteMany({name:"LFA 163 - Johns vs. Garcia"}).then(function(e){
//   console.log("deleted")
// });
// Fighter.deleteMany({"fights.name":"Cage Warriors 157: London"}).then(function(e){
//   console.log("deleted")
// });
// let eventName="UFC 290 - Volkanovski vs. Rodriguez"
//         Fighter.updateMany({ 'fights.name': eventName }, { $pull: { fights: { name: eventName } } })
//         .then(result => {
//           console.log('Objects deleted successfully:', result);
//         })
//         .catch(error => {
//           console.error('Error deleting objects:', error);
//         });

      exports.saveExistingEvent = async function(event){
        const newEvent = new Event(event);

        async function saveFights(){
        for(let i=0;i<event.mainCard.length;i++){
          let fighterID = await Fighter.findOne({name: event.mainCard[i].fighterName},"_id");
          let opponentID = await Fighter.findOne({name: event.mainCard[i].opponentName}, "_id");
          let fight={
            name: event.name,
            date: event.date,
            fighterID:fighterID.id,
            opponentID: opponentID.id,
            weightClass: event.mainCard[i].weightClass,
            result:"-",
            predictionClosed:false
          }
          const newfight = new Fight(fight);
          await newfight.save().then(async function(savedFight){
            let existingFight=await Fighter.findOne({_id:fighterID},{_id:0,fights:{$elemMatch:{name:event.name}}});
            if(existingFight.fights[0].result==="win"){
              await Fight.updateMany({_id:savedFight.id},{result:event.mainCard[i].fighterName+" won",method:existingFight.fights[0].method,round:existingFight.fights[0].round,time:existingFight.fights[0].time});
            } else if (existingFight.fights[0].result==="loss"){
              await Fight.updateMany({_id:savedFight.id},{result:event.mainCard[i].opponentName+" won",method:existingFight.fights[0].method,round:existingFight.fights[0].round,time:existingFight.fights[0].time});
            } else if (existingFight.fights[0].result==="NC"){
              await Fight.updateMany({_id:savedFight.id},{result:"no contest",method:existingFight.fights[0].method,round:existingFight.fights[0].round,time:existingFight.fights[0].time});
            } else{
              await Fight.updateMany({_id:savedFight.id},{result:existingFight.fights[0].result,method:existingFight.fights[0].method,round:existingFight.fights[0].round,time:existingFight.fights[0].time});
            }
          })
             
 }
        for(let i=0;i<event.prelims.length;i++){
          let fighterID = await Fighter.findOne({name: event.prelims[i].fighterName},"_id");
          let opponentID = await Fighter.findOne({name: event.prelims[i].opponentName}, "_id");

          let newPrelim={
            name: event.name,
            date: event.date,
            fighterID:fighterID.id,
            opponentID: opponentID.id,
            weightClass: event.prelims[i].weightClass,
            result:"-",
            predictionClosed:false
          }
          const newprelim = new Fight(newPrelim);
          await newprelim.save().then(async function(savedFight){
            let existingFight=await Fighter.findOne({_id:fighterID},{_id:0,fights:{$elemMatch:{name:event.name}}});
            if(existingFight.fights[0].result==="win"){
              await Fight.updateOne({_id:savedFight.id},{result:event.prelims[i].fighterName+" won",method:existingFight.fights[0].method,round:existingFight.fights[0].round,time:existingFight.fights[0].time});
            } else if (existingFight.fights[0].result==="loss"){
              await Fight.updateOne({_id:savedFight.id},{result:event.prelims[i].opponentName+" won",method:existingFight.fights[0].method,round:existingFight.fights[0].round,time:existingFight.fights[0].time});
            } else if (existingFight.fights[0].result==="NC"){
              await Fight.updateOne({_id:savedFight.id},{result:"no contest",method:existingFight.fights[0].method,round:existingFight.fights[0].round,time:existingFight.fights[0].time});
            } else{
              await Fight.updateOne({_id:savedFight.id},{result:existingFight.fights[0].result,method:existingFight.fights[0].method,round:existingFight.fights[0].round,time:existingFight.fights[0].time});
            }
          })
        }
      }
      await saveFights();
        google.eventPosterSearch(event.name).then(async function(images){
            newEvent.posterURL=images[0].url;
            await newEvent.save().then(async function(savedEvent){
              await Fight.updateMany({name: savedEvent.name}, { eventID: savedEvent.id } );
              await Fight.find({eventID:savedEvent.id}).then(async function(fights){
                fights.forEach(async function(fight){
                  await Fighter.findOne({_id: fight.fighterID}).then(async function(fighter){
                    await Fighter.findOne({_id:fight.opponentID}).then(async function(opponent){
                      await Event.updateOne({_id: savedEvent.id, "mainCard.fighterName":fighter.name,"mainCard.opponentName":opponent.name},{"mainCard.$.fightID":fight.id.toString()});
                      await Event.updateOne({_id: savedEvent.id, "prelims.fighterName":fighter.name,"prelims.opponentName":opponent.name},{"prelims.$.fightID":fight.id.toString()});
                    })
                  })
                })
              })
            });
        })
        
      }

      exports.getLeaderboardSubTable = async function(userID,leaderboardType){
        let predictions=[];
        async function getSubTable(){
          if(leaderboardType==="p4p"){
          predictions=await Prediction.aggregate([{$match:{"userID":userID}},{$sort:{"eventID":-1}},{$group:{"_id":{"eventID":"$eventID"},"mmr_change":{$sum:"$mmrChange"},"correct_count":{$sum:{$cond: {if:{ $eq: [ "$outcome", "Correct" ] },then:1,else:0}}},"incorrect_count":{$sum:{$cond: {if:{ $eq: [ "$outcome", "Incorrect" ] },then:1,else:0}}}}}]);
        } else{
          predictions=await Prediction.aggregate([{$match:{"userID":userID,orgName:leaderboardType}},{$sort:{"eventID":-1}},{$group:{"_id":{"eventID":"$eventID"},"mmr_change":{$sum:"$orgMmrChange"},"correct_count":{$sum:{$cond: {if:{ $eq: [ "$outcome", "Correct" ] },then:1,else:0}}},"incorrect_count":{$sum:{$cond: {if:{ $eq: [ "$outcome", "Incorrect" ] },then:1,else:0}}}}}]);
        }
          for (let i=0;i<predictions.length;i++){
            let tempName = await Event.findOne({_id:predictions[i]._id.eventID},"name");
            predictions[i].eventName= tempName.name;
          }
          return predictions;
        }
        
        return getSubTable();
      }

      exports.findFightersByID = async function(name){
          let fighterid= await Fighter.find({name: name},"_id");
          return fighterid;
      }

      exports.getFighterByID = async function(fighterID){
        let fighter= await Fighter.findOne({_id: fighterID});
        return fighter;

    }

    var updateFightOutcome = exports.updateFightOutcome = async function(fightID, winnerName, method, round, time) {
      let result = "";
    
      if (winnerName === "draw") {
        result = "draw";
      } else if (winnerName === "no contest") {
        result = "no contest";
      } else if (winnerName.toLowerCase().includes("cancel")){
        result= "cancelled";
        cancelFightBettingLines(fightID);
      } else {
        result = winnerName + " won";
      }
    
      try {
        const fight = await Fight.findOneAndUpdate(
          { _id: fightID },
          { result: result, method: method, round: round, time: time },
          { new: true }
        );
    
        if (result === "draw" || result === "no contest") {
          await Promise.all([
            Fighter.updateOne({ _id: fight.fighterID, "fights.name": fight.name }, { "fights.$.result": fight.result, "fights.$.method": fight.method, "fights.$.round": fight.round, "fights.$.time": fight.time }),
            Fighter.updateOne({ _id: fight.opponentID, "fights.name": fight.name }, { "fights.$.result": fight.result, "fights.$.method": fight.method, "fights.$.round": fight.round, "fights.$.time": fight.time })
          ]);
        } else if (result==="cancelled"){
          const event = await Event.findOne(
            { $or: [{ "mainCard.fightID": fightID }, { "prelims.fightID": fightID }] }
          );

          const cancelledFight = event.mainCard.find(fight => fight.fightID === fightID) || event.prelims.find(fight => fight.fightID === fightID);

          event.cancelledBouts.push(cancelledFight);
          event.mainCard = event.mainCard.filter(fight => fight.fightID !== fightID);
          event.prelims = event.prelims.filter(fight => fight.fightID !== fightID);

          event.save();
        } else {

          const fighter = await Fighter.findOneAndUpdate(
            { name: winnerName, "fights.name": fight.name },
            {
              $set: {
                "fights.$.result": "win",
                "fights.$.method": fight.method,
                "fights.$.round": fight.round,
                "fights.$.time": fight.time
              },
              $inc: {
                "wins.total": 1,
                ...(method.toLowerCase().includes("ko") && { "wins.knockouts": 1 }),
                ...(method.toLowerCase().includes("sub") && { "wins.submissions": 1 }),
                ...(method.toLowerCase().includes("dec") && { "wins.decisions": 1 })
              }
            }
          );

          let loserID;
          if (fighter.id.toString() === fight.fighterID) {
            loserID = fight.opponentID;
          } else {
            loserID = fight.fighterID;
          }
    
          await Fighter.findOneAndUpdate(
            { _id: loserID, "fights.name": fight.name },
            {
              $set: {
                "fights.$.result": "loss",
                "fights.$.method": fight.method,
                "fights.$.round": fight.round,
                "fights.$.time": fight.time
              },
              $inc: {
                "losses.total": 1,
                ...(method.toLowerCase().includes("ko") && { "losses.knockouts": 1 }),
                ...(method.toLowerCase().includes("sub") && { "losses.submissions": 1 }),
                ...(method.toLowerCase().includes("dec") && { "losses.decisions": 1 })
              }
            }
          );
        }
    
        return "Fight and fighter records updated";
      } catch (error) {
        console.error("Error updating fight and fighter records:", error);
        throw error;
      }
    }
    
    
    var cancelFightBettingLines = exports.cancelFightBettingLines = async function(fightID){
      await Line.deleteMany({fightID: fightID});
      return "lines deleted"
    }

    exports.closeFightPredictions=async function(fightID){
      Fight.findOneAndUpdate({_id:fightID},{predictionClosed:true}).then(function(e){
        Line.updateMany({fightID:fightID},{bettingClose:true}).then(function(e){
          return "Predictions closed";
        })
      })
    }

    exports.openFightPredictions=async function(fightID){
      Fight.findOneAndUpdate({_id:fightID},{predictionClosed:false}).then(function(e){
        return"Predictions Opened";
      })
    }
      exports.resolvePredictions= async function(fightID,winnerName){
        if(winnerName==="draw"||winnerName==="no contest"||winnerName.toLowerCase().includes("cancel")){
          await Prediction.updateMany({fightID:fightID},{outcome:"Push"});
        } else{
            await Prediction.updateMany({fightID:fightID,predictionName:winnerName},{outcome:"Correct"});
            await Prediction.updateMany({fightID:fightID,predictionName:{$ne:winnerName}},{outcome:"Incorrect"});
            Prediction.find({fightID:fightID,outcome:"Correct"},"userID orgName").then(function(predictions){
              predictions.forEach(async function(prediction){
                const countPredictions = await Prediction.countDocuments({userID:prediction.userID,orgName:prediction.orgName});
                let gainedPoints=Number;
                if (countPredictions<=40){
                  gainedPoints=100;
                } else if (countPredictions<=80){
                  gainedPoints=70;
                } else if (countPredictions<=120){
                  gainedPoints=50;
                } else if (countPredictions<=200){
                  gainedPoints=30;
                } else{
                  gainedPoints=20;
                }
                if(_.lowerCase(prediction.orgName)==="ufc"){
                  await User.updateOne({_id:prediction.userID},{$inc:{ufcMmr:gainedPoints,ufcPredictionWins:1,mmr:gainedPoints,predictionWins:1}});
                } else if (_.lowerCase(prediction.orgName)==="bellator"){
                  await User.updateOne({_id:prediction.userID},{$inc:{bellatorMmr:gainedPoints,bellatorPredictionWins:1,mmr:gainedPoints,predictionWins:1}});
                } else if (_.lowerCase(prediction.orgName)==="pfl"){
                  await User.updateOne({_id:prediction.userID},{$inc:{pflMmr:gainedPoints,pflPredictionWins:1,mmr:gainedPoints,predictionWins:1}});
                } else{
                  await User.updateOne({_id:prediction.userID},{$inc:{regionalMmr:gainedPoints,regionalPredictionWins:1,mmr:gainedPoints,predictionWins:1}});
                }
                await Prediction.updateOne({_id:prediction._id},{mmrChange:gainedPoints,orgMmrChange:gainedPoints});
              })
              
            })
            Prediction.find({fightID:fightID,outcome:"Incorrect"},"userID orgName").then(function(predictions){
              predictions.forEach(async function(prediction){
                const countPredictions = await Prediction.countDocuments({userID:prediction.userID,orgName:prediction.orgName});
                let lossedPoints=Number;
                if (countPredictions<=40){
                  lossedPoints=-20;
                } else if (countPredictions<=80){
                  lossedPoints=-30;
                } else if (countPredictions<=120){
                  lossedPoints=-40;
                } else if (countPredictions<=200){
                  lossedPoints=-50;
                } else{
                  lossedPoints=-60;
                }
                if(_.lowerCase(prediction.orgName)==="ufc"){
                  await User.updateOne({_id:prediction.userID},{$inc:{ufcMmr:lossedPoints,ufcPredictionLosses:1,mmr:lossedPoints,predictionLosses:1}});
                } else if (_.lowerCase(prediction.orgName)==="bellator"){
                  await User.updateOne({_id:prediction.userID},{$inc:{bellatorMmr:lossedPoints,bellatorPredictionLosses:1,mmr:lossedPoints,predictionLosses:1}});
                } else if (_.lowerCase(prediction.orgName)==="pfl"){
                  await User.updateOne({_id:prediction.userID},{$inc:{pflMmr:lossedPoints,pflPredictionLosses:1,mmr:lossedPoints,predictionLosses:1}});
                } else{
                  await User.updateOne({_id:prediction.userID},{$inc:{regionalMmr:lossedPoints,regionalPredictionLosses:1,mmr:lossedPoints,predictionLosses:1}});
                }
                await Prediction.updateOne({_id:prediction._id},{mmrChange:lossedPoints,orgMmrChange:lossedPoints});
              })
              
            })
        }
        return("updated");
        
      }


      var resolveTrackedBets = exports.resolveTrackedBets = async function (fightID){

        const fight = await Fight.findById(fightID);

        if (!fight) {
          console.log("fight not found");
          return;
        }

        const betLines = await Line.find({fightID});

        for (const betLine of betLines){
          const betCondition= betLine.condition;
          const outcome = {
            result: fight.result,
            method: fight.method,
            round: fight.round,
            time: fight.time,
          }

          const won = await resolveBet(betCondition, outcome);
          betLine.win=won;

          await betLine.save();

          const parentBets = await Bet.find({ "betSlip._id": betLine._id });

          for (const parentBet of parentBets) {
            // Find the corresponding betLine in the parentBet's betSlip
            const parentBetLine = parentBet.betSlip.find((line) => line._id.equals(betLine._id));

            if (parentBetLine) {
              parentBetLine.win = won;
              if (parentBet.win===true || parentBet.win===false){
                continue;
              }
              const anyBetLineLost = parentBet.betSlip.some((line) => line.win === false);
              const allBetLinesWon = parentBet.betSlip.every((line) => line.win);
            if (allBetLinesWon) {
              parentBet.win = true;
              if (parentBet.odds>0){
                parentBet.profit = ((parentBet.wager*parentBet.odds)/100);
              } else{
                parentBet.profit=((parentBet.wager*100)/Math.abs(parentBet.odds));
              }
              parentBet.profit = Number(parentBet.profit.toFixed(2));
              await User.updateOne({_id: parentBet.userID}, { $inc: { betWins: 1,totalProfit: parentBet.profit,totalWager:parentBet.wager} });
            } else if (anyBetLineLost){
              parentBet.win = false;
              parentBet.profit = -parentBet.wager;
              parentBet.profit = Number(parentBet.profit.toFixed(2));
              await User.updateOne({_id: parentBet.userID}, { $inc: { betLosses: 1,totalProfit: parentBet.profit,totalWager:parentBet.wager} });
            }
            parentBet.profit = Number(parentBet.profit.toFixed(2));
            await parentBet.save();
            }
          }
        }
      }

      function normalizeFighterName(name) {
        return name.toLowerCase().trim();
      }

      const rulesLookup = {
        "{fighterName} wins by ko/tko": {
          result: "{fighterName} won",
          method: ["tko","ko","dq","ko/tko"],
        },
        "{fighterName} wins by submission": {
          result: "{fighterName} won",
          method: "submission",
        },
        "{fighterName} wins by decision": {
          result: "{fighterName} won",
          method: "decision",
        },
        "{fighterName} won": {
          result: "{fighterName} won",
        },
        "over 2½ rounds": {
          conditions: [
            { method: "dec" },
            { round: 3, time: "2:30", timeOperator: ">" }
          ]
        },
        "under 2½ rounds": {
          conditions: [
            { round: 1 },
            { round: 2 },
            { round: 3, time: "2:30", timeOperator: "<" }
          ]
        },
        "over 1½ rounds": {
          conditions: [
            { method: "dec" },
            { round:3 },
            { round: 2, time: "2:30", timeOperator: ">" }
          ]
        },
        "under 2½ rounds": {
          conditions: [
            { round: 1 },
            { round: 2, time: "2:30", timeOperator: "<" }
          ]
        },
        "fight goes to decision": {
          method:"decision",
        },
        "fight doesn't goes to decision": {
          method:["submission","ko","tko","dq"]
        },
      };

      function evaluateConditions(outcome, conditions) {
        for (const condition of conditions) {
          if (condition.round && outcome.round !== condition.round) {
            continue;
          }
      
          if (condition.method && !normalizeFighterName(outcome.method).includes(condition.method)) {
            continue;
          }

          if (condition.time && outcome.time && !compareTime(outcome.time, condition.time, condition.timeOperator)) {
            continue;
          }
      
          return true;
        }
      
        return false;
      }
      
      function compareTime(outcomeTime, conditionTime, timeOperator) {
        // Assuming outcome.time and condition.time are in the format "2:30"
        const [outcomeMinutes, outcomeSeconds] = outcomeTime.split(":").map(parseFloat);
        const [conditionMinutes, conditionSeconds] = conditionTime.split(":").map(parseFloat);
      
        if (timeOperator === ">") {
          return outcomeMinutes > conditionMinutes || (outcomeMinutes === conditionMinutes && outcomeSeconds > conditionSeconds);
        } else if (timeOperator === ">=") {
          return outcomeMinutes > conditionMinutes || (outcomeMinutes === conditionMinutes && outcomeSeconds >= conditionSeconds);
        } else if (timeOperator === "<") {
          return outcomeMinutes < conditionMinutes || (outcomeMinutes === conditionMinutes && outcomeSeconds < conditionSeconds);
        } else if (timeOperator === "<=") {
          return outcomeMinutes < conditionMinutes || (outcomeMinutes === conditionMinutes && outcomeSeconds <= conditionSeconds);
        }
      
        return false;
      }
      
      var resolveBet = async function (condition, outcome) {
        const betFighterName= normalizeFighterName(condition.split("_")[0]);
        const betCondition= normalizeFighterName(condition.split("_").join(" "));
        const outcomeResult = normalizeFighterName(outcome.result);
        const outcomeMethod = normalizeFighterName(outcome.method.split("(")[0]);
        const outcomeRound = outcome.round;
        const outcomeTime = outcome.time;

        for (const [betConditionTemplate, rule] of Object.entries(rulesLookup)) {
          const normalizedTemplate = betConditionTemplate.replace("{fighterName}", betFighterName);


          if(normalizedTemplate===betCondition){
            console.log(normalizedTemplate,betCondition)
            if(!rule.round || rule.round.includes(outcomeRound)){
              if (!rule.conditions || evaluateConditions(outcome,rule.conditions)){
                if(!rule.result || rule.result.replace("{fighterName}", betFighterName)===outcomeResult){
                  if(!rule.method || rule.method.includes(outcomeMethod)){
                    console.log("win")
                    return true;
                  }
                }
              }
            }
            console.log("loss")
            return false
          }
        }


      };
      

      
      
      
      
      

      exports.getFightersByID = async function(fighterID){
        let fighters= await Fighter.find({_id: fighterID});
        let sortFighters=[];
        fighters.forEach(function(fighter){
          for(let i=0;i<fighters.length;i++){
          if (fighterID[i]===fighter.id){
            sortFighters[i]=fighter;
          }
        }
        })
        
        return sortFighters;

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

      exports.saveFightPrediction = async function(fightID, userPrediction){
        let predictionClosed = await Fight.findOne({_id:fightID},"predictionClosed");
        let existingPrediction = await Prediction.findOne({fightID:fightID,userID:userPrediction.userID});
        async function predict(){
          if(predictionClosed.predictionClosed){
            const outcome = "predictions for this fight are closed";
            return outcome;
          } else if(existingPrediction != undefined){
            if(existingPrediction.fighterID === userPrediction.fighterID){
              const outcome = "prediction already made";
              return outcome;
            } else{
              await Prediction.deleteOne({fightID:fightID,userID:userPrediction.userID});
              const prediction=new Prediction(userPrediction);
              await prediction.save();
              const outcome = "old prediction removed and new prediction added";
              return outcome;
            }
          } else{
            const prediction=new Prediction(userPrediction);
            await prediction.save();
            const outcome = "prediction added";
            return outcome;
          }
        }

        return await predict();
      }

      var findProfileImage = exports.findProfileImage = async function(userID){
        const imagePath=await User.findOne({_id:userID},"profImage_url");
        return imagePath.profImage_url;
      }

      var findCoverImage = exports.findCoverImage = async function(userID){
        const imagePath=await User.findOne({_id:userID},"coverImage_url");
        return imagePath.coverImage_url;
      }

      exports.updateProfileImage = async function(userID,filename){
        await deleteImageIfExists(userID,"profile");
        await User.updateOne({_id:userID},{profImage_url:filename});
        return "image changed";
      }

      exports.updateProfileCoverImage = async function(userID,filename){
        await deleteImageIfExists(userID,"cover");
        await User.updateOne({_id:userID},{coverImage_url:filename});
        return "image changed";
      }
      
      exports.updateProfileInfo = async function(username,about,favFighter,favOrg,theme){
        let updated={};
        async function update(){
          if(about.length){
          await User.updateMany({username:username},{aboutMe:about});
          updated.aboutMe=about;
        } 
        if (favFighter.length){
          await User.updateMany({username:username},{favFighter:favFighter});
          updated.favFighter=favFighter;
        } 
        if (favOrg.length){
          await User.updateMany({username:username},{favPromo:favOrg});
          updated.favOrg=favOrg;
        }
        if (theme.length){
          await User.updateMany({username:username},{profileTheme:theme});
          updated.profileTheme=theme;
        }
        return updated;
        }
        
        return update();
      }        
      var sortArray= async function(array,compare,sortingArray){
        let sortedArray=[];
        array.forEach(function(elem){
          
          for(let i=0;i<sortingArray.length;i++){
            if(elem[compare]==sortingArray[i]){
              sortedArray[i]=elem;
            }
          }
        })
        return sortedArray;
      }

      var deleteImageIfExists = async function deleteImageIfExists(userID,imageType){
        let imagePath="";
        if(imageType==="profile"){
          imagePath= await findProfileImage(userID);
        } else if (imageType==="cover"){
          imagePath= await findCoverImage(userID);
        } else{
          console.error("no image type selected", error);
        }
        
        if (imagePath==="default-prof-image.png"||imagePath==="default-cover-image.png"){
          return;
        } else{
          let resultHandler = function (err) {
            if (err) {
                console.log("unlink failed", err);
            } else {
                console.log("file deleted");
            }
          }
          fs.unlink(__dirname+'/public/data/uploads/profilePictures/'+imagePath,resultHandler);
        }
      }


      var getEventFightOdds = async function getEventFightOdds(i, eventName) {
        try {
          const bettingLines = await odds.scrapeBettingOdds(i);
          const event = await Event.findOne({ name: eventName });
      
          if (!event) {
            console.error("Event not found in the database for event:", eventName);
            return; // Exit the function since there's no event to process.
          }
      
          let fights = event.mainCard.concat(event.prelims);
      
          for (const line of bettingLines) {
            const fighter = line.condition.split("_")[0].toLowerCase();
      
            const foundFight = fights.find((fight) => {
              const fighterNameLower = fight.fighterName.toLowerCase();
              const opponentNameLower = fight.opponentName.toLowerCase();
      
              return (
                levenshtein.get(fighter, fighterNameLower) <= 2 || // Tolerate up to 3 edit distance
                levenshtein.get(fighter, opponentNameLower) <= 2
              );
            });
      
            if (foundFight && foundFight.result != "cancelled") {
              // Retrieve all lines for the foundFight.fightID from the database
              const existingLines = await Line.find({ fightID: foundFight.fightID });
            
              // Find the line with the closest condition using Levenshtein distance
              let closestMatchingLine;
              let closestDistance = Infinity;
            
              for (const existingLine of existingLines) {
                const distance = levenshtein.get(existingLine.condition.toLowerCase(), line.condition.toLowerCase());
                if (distance <= 3 && distance < closestDistance) {
                  closestMatchingLine = existingLine;
                  closestDistance = distance;
                }
              }
            
              if (closestMatchingLine) {
                // Update the existing line with new odds
                closestMatchingLine.odds = line.odds;
                closestMatchingLine.fightName = foundFight.fighterName + " vs. " + foundFight.opponentName;
                await closestMatchingLine.save();
              } else {
                // Create and save a new line
                line.fightID = foundFight.fightID;
                line.eventID = event.id;
                line.fightName = foundFight.fighterName + " vs. " + foundFight.opponentName;
                const bettingLine = new Line(line);
                await bettingLine.save();
              }
            }
          }
        } catch (error) {
          console.error("Error occurred while fetching event or saving betting lines:", error);
        }
      };
      
      // getEventFightOdds(3, "UFC 291 - Poirier vs. Gaethje 2");




    //   let fight={
    //     name:"UFC 289 - Nunes vs. Aldana",
    //     date:"Jun/10/2023",
    //     opponent:"Irene Aldana",
    //     result:"win",
    //     method:"Unanimous Decision",
    //     round:"",
    //     time:""
    //   }  
    //   Fighter.findOneAndUpdate({name: "Amanda Nunes"},{
    //     $push:{
    //     fights:{
    //       $each: [fight],
    //       $position: 0
    //     }
    //   }
    // }).then(function(e){
    //   console.log("updated")
    // })

    exports.trackVisitor = async (req,res) => {
      let visitorId = req.cookies.visitorId;
    
      if (!visitorId) {
        visitorId = generateUniqueVisitorId();
        res.cookie('visitorId', visitorId, { maxAge: 86400000, httpOnly: true }); // Cookie lasts for one day
      }
    
      const currentDate = new Date();
    
      // Check if the visitor with the same ID and date exists
      try {
        const existingVisitor = await Visitor.findOne({
          visitorId,
          date: { $gte: currentDate.setHours(0, 0, 0, 0) },
        });
    
        if (!existingVisitor) {
          // Create a new visitor record if it's a unique visitor for the day
          const newVisitor = new Visitor({
            visitorId,
            date: currentDate,
          });
          await newVisitor.save();
        }
      } catch (err) {
        console.error('Error tracking visitor:', err);
      }
    };

    var getDailyVisitorCount = exports.getDailyVisitorCount = async () => {
      try {
        const targetDate = new Date();
        if (!targetDate || isNaN(targetDate)) {
          console.log("invalid date format");
          return;
        }
    
        const uniqueVisitors = await Visitor.distinct('visitorId', {
          date: { $gte: targetDate.setHours(0, 0, 0, 0), $lt: targetDate.setHours(23, 59, 59, 999) },
        });
    
        const dailyVisitorCount = uniqueVisitors.length;
        console.log(dailyVisitorCount);
      } catch (err) {
        console.error('Error fetching daily visitor count:', err);
      }
    };
    
    // getDailyVisitorCount();
    
    const generateUniqueVisitorId = () => {
      return 'visitor_' + Math.random().toString(36).substr(2, 9);
    };

