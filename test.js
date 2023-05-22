const google = require('googlethis');
test();
async function test(){
const images= await google.image("UFC 289: Nunes vs. Aldana wikipedia", {safe: true});
console.log(images[0]);
}