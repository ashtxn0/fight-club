const GoogleImages = require('google-images');
 
const client = new GoogleImages('4004b08ac0358470d', 'AIzaSyDoTSRFslLfpiM0byub6epe67rP-PT_Ooc');
const client2= new GoogleImages('65f44ac01c1b541ca','AIzaSyDoTSRFslLfpiM0byub6epe67rP-PT_Ooc');

exports.ufcFighterImageSearch = async function(fighterNickname,fighterName){
    return (client2.search(fighterNickname+" "+fighterName,{size:'large'}));
    
}

exports.regionalFighterImageSearch = function(fighterNickname,fighterName){
    return (client.search(fighterNickname+" "+fighterName,{size:'large'}));

}

exports.eventPosterSearch = async function(eventName){
    return (client.search(eventName+" 'poster' ",{size:'large'}));
    
}
