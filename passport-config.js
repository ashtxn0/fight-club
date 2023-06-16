const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db=require(__dirname+"/db.js");

function initialize(passport){
    const authenticateUser = async (username,password,done) =>{
        const user = await db.findUserByUsername(username);
        if(user==null){
            return done(null, false, {message: "No user with that username"})
        }

        try{
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else{
                return done(null, false, {message: "password incorrect"})
            }
        } catch (e){
            return done(e)
        }
    }

    passport.use(new LocalStrategy({usernameField: "username"},authenticateUser));
    passport.serializeUser((user, done) =>  done(null, user.id))
    passport.deserializeUser(async (id, done) => { 
        const user=await db.findUserByID(id)
        done(null, user);
     })
}

module.exports = initialize;
