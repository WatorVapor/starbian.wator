'use strict';
const StarBian = require('../..');

var pBtn = new StarBian();
//console.log('pBtn=<',pBtn,'>');

var priKey = pBtn.getPrivate();
console.log('priKey=<',priKey,'>');

var pubKey  = pBtn.getPublic();
console.log('pubKey=<',pubKey,'>');

var authedKey  = pBtn.getAuthed();
console.log('authedKey=<',authedKey,'>');


let listenChannel = authedKey[0];
pBtn.subscribe(listenChannel,(channel,msg) =>{
  console.log('channel=<',channel,'>');
  console.log('msg=<',msg,'>');
});

pBtn.onReady = ()=> {
  setTimeout(function(){
    pBtn.publish('ok hot hot run');
  },20000);
}; 

//console.log('gofuro=<',gofuro,'>');
