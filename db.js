const mongoose = require('mongoose');
var bcrypt = require("bcrypt");
const mma=require("mma-api");
const google=require(__dirname+"/googleSearch.js");
var _ = require("lodash");
const { name } = require('ejs');
const { ObjectId } = require('mongodb');
const fs = require('fs-extra');
const uri = process.env.MONGODB_URI;


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
        required: [true, "Please enter an email"]
      },
        followers:[String],
        following:[String],
        favFighter: String,
        favPromo: String,
        aboutMe: String,
        profileTheme: String,
        profileType: String,
        profImage_url: String,
        coverImage_url: String,
        predictionWins: Number,
        predictionLosses: Number,
        ufcPredictionWins: Number,
        ufcPredictionLosses: Number,
        ufcMmr: Number,
        pflPredictionWins: Number,
        pflPredictionLosses: Number,
        pflMmr: Number,
        bellatorPredictionWins: Number,
        bellatorPredictionLosses: Number,
        bellatorMmr: Number,
        regionalPredictionWins: Number,
        regionalPredictionLosses: Number,
        regionalMmr: Number,
        mmr: Number
      })

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
        comments: [Object],
        mainCard: [Object],
        prelims: [Object]
      });

      const Fighter = mongoose.model("Fighter", fighterSchema);
      const Event = mongoose.model("Event", eventSchema);
      const Fight = mongoose.model("Fight",fightSchema);
      const Prediction = mongoose.model("Prediction",predictionSchema);
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
        let foundUser= await User.findOne({username:username});
        return foundUser;
      }

      exports.findUserProfileType = async function(userID){
        let foundUser=await User.findOne({_id:userID},"profileType");
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

      exports.saveUser = async function(username, password, email){
        const hashedPassword = await bcrypt.hash(password, 10);
        let newUser = {
            username: username,
            email: email,
            password: hashedPassword,
            profImage_url:"default-prof-image.png",
            coverImage_url: "default-cover-image.png",
            PredictionLosses:0,
            PredictionWins:0,
            mmr:0
        }
        const newuser = new User(newUser);
        newuser.save();
      }

      exports.findFighterByName = async function (name){
        let fighter=Fighter.findOne({name:name});
        return fighter;
      }

      exports.findFightResults = async function(fightID){
     
        let results= await Fight.find({_id:fightID},"result");
   
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

      var getUserPredictionInfo = exports.getUserPredictionInfo=async function(userID,orgName){
        let predictions=[];
        if (orgName==="ALL"){
          mmr="mmr";
          wins="predictionWins";
          losses="predictionLosses";
          predictions= (await Prediction.find({userID:userID})).reverse();
        } else{
          wins=_.lowerCase(orgName)+"PredictionWins";
          losses=_.lowerCase(orgName)+"PredictionLosses";
          mmr=_.lowerCase(orgName)+"Mmr";
          predictions= (await Prediction.find({userID:userID,orgName:orgName})).reverse();
        }
        let stats = await User.find({_id:userID},[wins, losses, mmr]);
        let rank = await findRanking(userID,orgName);

        let data={
          predictions:predictions,
          wins:stats[0][wins],
          losses:stats[0][losses],
          mmr:stats[0][mmr],
          rank:rank
        }

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
      
      exports.saveFighterByNameAndAddFight = async function(Fname,eventName,eventDate,opponentName,isTitleFight){
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
                data.fights.insert(fight);
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

      exports.findUserIdByUsername = async function(username){
        const userID= await User.findOne({username:username},"_id");
        return userID;
      }

      exports.getUpcomingEvents = async function(){
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        // const events = await Event.find({date:{$gte: yesterday }});
        const events = await Event.find({}).limit(5);

        return events;
      }

      exports.saveFighterByURL = async function(Fname,URL){
        Fighter.findOne({name: Fname,url:URL}).then(function(foundFighter){
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

      var likeComment = exports.likeComment =  async function(commentUsername,timePosted,username,contentType){
        let foundcontent={};
        async function init(){
          if(contentType==="fight"){
          foundcontent = await Fight.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
        } else if (contentType==="event"){
          foundcontent = await Event.findOne({"comments.username": commentUsername, "comments.timePosted":timePosted});
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
          let fighterID = await Fighter.findOne({name: mainFight.fighterName},"_id");
          let opponentID = await Fighter.findOne({name: mainFight.opponentName}, "_id");
          let fight={
            name: event.name,
            date: event.date,
            fighterID:fighterID.id,
            opponentID: opponentID.id,
            weightClass: mainFight.weightClass,
            result:"-",
            predictionClosed:false
          }
          const newfight = new Fight(fight);
          newfight.save();
             
        });
        event.prelims.forEach(async function(prelim){
          let fighterID = await Fighter.findOne({name: prelim.fighterName},"_id");
          let opponentID = await Fighter.findOne({name: prelim.opponentName}, "_id");


          let newPrelim={
            name: event.name,
            date: event.date,
            fighterID:fighterID.id,
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
// Fight.deleteMany({name:"UFC on ESPN 46 - Kara-France vs. Albazi"}).then(function(e){
//   console.log("deleted")
// });
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

    var updateFightOutcome= exports.updateFightOutcome = async function(fightID,winnerName,method,round,time){
      let result="";

        if(winnerName==="draw"){
        result="draw";
        } else if (winnerName==="no contest"){
        result="no contest";
        } else{
        result=winnerName+" won";
        }


      Fight.findOneAndUpdate({_id:fightID},{result:result,method:method,round:round,time:time},{new: true}).then(function(fight){

        if(result==="draw" || result==="no contest"){
          Fighter.updateOne({_id:fight.fighterID,"fights.name":fight.name,"fights.date":fight.date},{"fights.$.result":fight.result,"fights.$.method":fight.method,"fights.$.round":fight.round,"fights.$.time":fight.time});
          Fighter.updateOne({_id:fight.opponentID,"fights.name":fight.name,"fights.date":fight.date},{"fights.$.result":fight.result,"fights.$.method":fight.method,"fights.$.round":fight.round,"fights.$.time":fight.time});

        } else{ 
          Fighter.findOneAndUpdate({name:winnerName,"fights.name":fight.name,"fights.date":fight.date},{"fights.$.result":"win","fights.$.method":fight.method,"fights.$.round":fight.round,"fights.$.time":fight.time}).then(function(fighter){

            if(fighter.id.toString()===fight.fighterID){
              Fighter.updateOne({_id:fight.opponentID,"fights.name":fight.name,"fights.date":fight.date},{"fights.$.result":"loss","fights.$.method":fight.method,"fights.$.round":fight.round,"fights.$.time":fight.time});
            } else{
              Fighter.updateOne({_id:fight.fighterID,"fights.name":fight.name,"fights.date":fight.date},{"fights.$.result":"loss","fights.$.method":fight.method,"fights.$.round":fight.round,"fights.$.time":fight.time});
            }
          })
        }
        })
        return("fight and fighter records updated");
    }
    

    exports.closeFightPredictions=async function(fightID){
      Fight.findOneAndUpdate({_id:fightID},{predictionClosed:true}).then(function(e){
        return"Predictions Closed";
      })
    }

    exports.openFightPredictions=async function(fightID){
      Fight.findOneAndUpdate({_id:fightID},{predictionClosed:false}).then(function(e){
        return"Predictions Opened";
      })
    }
      exports.resolvePredictions= async function(fightID,winnerName){
        if(winnerName==="draw"||winnerName==="no contest"){
          await Prediction.updateMany({fightID:fightID},{outcome:"Push"});
        } else{
            await Prediction.updateMany({fightID:fightID,predictionName:winnerName},{outcome:"Correct"});
            await Prediction.updateMany({fightID:fightID,predictionName:{$ne:winnerName}},{outcome:"Incorrect"});
            Prediction.find({fightID:fightID,outcome:"Correct"},"userID orgName").then(function(predictions){
              predictions.forEach(async function(prediction){
                const countPredictions = await Prediction.countDocuments({userID:prediction.userID,orgName:prediction.orgName});
                let gainedPoints=Number;
                if (countPredictions<=60){
                  gainedPoints=100;
                } else if (countPredictions<=120){
                  gainedPoints=70;
                } else if (countPredictions<=200){
                  gainedPoints=50;
                } else if (countPredictions<=300){
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
                if (countPredictions<=60){
                  lossedPoints=-20;
                } else if (countPredictions<=120){
                  lossedPoints=-30;
                } else if (countPredictions<=200){
                  lossedPoints=-40;
                } else if (countPredictions<=300){
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