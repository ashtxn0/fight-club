const mongoose = require('mongoose');
var bcrypt = require("bcrypt");
const mma=require("mma-api");
const google=require(__dirname+"/googleSearch.js");
var _ = require("lodash");
const { name } = require('ejs');

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
        profImage_url: String,
        predictionWins: Number,
        PredictionLosses: Number,
        mmr: Number,
        rank: Number,
        followers:[String],
        following:[String],
        favFighter: String,
        favPromo: String,
        aboutMe: String,
        profileTheme: String
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
    orgName: String

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
    date: String,
    fighterID: String,
    opponentID: String,
    result: String,
    method: String,
    round: String,
    comments: [Object],
    predictions: [Object],
    time: String});

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
            profImage_url:"default-prof-image.png"
        }
        const newuser = new User(newUser);
        newuser.save();
      }

      exports.findFighterByName = async function (name){
        let fighter=Fighter.findOne({name:name});
        return fighter;
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
        console.log(eventNames);

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
        console.log(predictions.reverse());

  
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

      exports.saveFighterByURL = async function(Fname,URL){
        Fighter.findOne({name: Fname}).then(function(foundFighter){
            if (foundFighter !=null){
              console.log("Fighter already in database")
            } else{
              mma.url(URL, (data) =>{
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
            result:"-"
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
            result:"-"
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

      exports.findFightersByID = async function(name){
          let fighterid= await Fighter.find({name: name},"_id");
          return fighterid;
      }

      exports.getFighterByID = async function(fighterID){
        let fighter= await Fighter.findOne({_id: fighterID});
        return fighter;

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
        let existingPrediction = await Prediction.findOne({fightID:fightID,userID:userPrediction.userID});
        async function predict(){
          if(existingPrediction != undefined){
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