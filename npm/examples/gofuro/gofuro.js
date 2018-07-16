'use strict';
const StarBian = require('../..');

let gofuro = new StarBian();
//console.log('gofuro=<',gofuro,'>');

let priKey = gofuro.getPrivate();
console.log('priKey=<',priKey,'>');

let pubKey  = gofuro.getPublic();
console.log('pubKey=<',pubKey,'>');

let authedKey  = gofuro.getAuthed();
console.log('authedKey=<',authedKey,'>');




let listenChannel = authedKey[0];
gofuro.subscribe(listenChannel,(channel,msg) =>{
  console.log('channel=<',channel,'>');
  console.log('msg=<',msg,'>');
});

gofuro.onReady = ()=> {
  setTimeout(function(){
    gofuro.publish('ok hot hot run');
  },20000);
};

/*
setTimeout(function(){
  gofuro.publish('ok hot hot run');
},2000);
*/

//console.log('gofuro=<',gofuro,'>');
