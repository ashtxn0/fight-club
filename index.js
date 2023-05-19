const mongoose = require('mongoose');
const mma=require("mma-api");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let mainCard = [];

app.get("/", function(req,res){
    res.render("home");
    
  })

app.get("/event", function(req,res){
  res.render("event");
})

app.listen(3000, function () {
    console.log("Server started on port 3000.");
  });

// async function main(){

//     await mongoose.connect('mongodb+srv://ashtxn:7jYYZ4UbLSm72OPY@cluster0.c9ryrrx.mongodb.net/fightclubDB?retryWrites=true&w=majority');

//     const fighterSchema = new mongoose.Schema({
//         url: String,
//         name: {
//             type: String,
//             required: [true, "Please check your data entry, no name specified!"]
//         },
//         nickname: String,
//         age: Number,
//         birthday: String,
//         locality: String,
//         nationality: String,
//         association: String,
//         height: String,
//         weight: String,
//         weight_class: String,
//         image_url: String,
//         wins: Object,
//         losses: Object,
//         no_contests: Number,
//         fights: [Object]});


        
//         const Fighter = new mongoose.model("Fighter", fighterSchema);

//         mma.api("Khabib Nurmagomedov", (data) =>{
//             const fighter = new Fighter(data);

//             fighter.save();
//             let opponentNames = [];
//             for (let i=0;i<data.fights.length;i++){
//                 opponentNames[i]= data.fights[i].opponent;
//             }

//             opponentNames.forEach(function(name){
//                 mma.api(name, (newData) =>{
//                     const newFighter = new Fighter(newData);
        
//                     newFighter.save();
//                 })      
//             })
//         })
        
//         await Fighter.find();
// }