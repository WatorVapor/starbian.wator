'use strict';
const StarBian = require('..');

var gofuro = new StarBian();
//console.log('gofuro=<',gofuro,'>');

var priKey = gofuro.getPrivate();
console.log('priKey=<',priKey,'>');

var pubKey  = gofuro.getPublic();
console.log('pubKey=<',pubKey,'>');

var authedKey  = gofuro.getAuthed();
console.log('authedKey=<',authedKey,'>');


gofuro.subscribe( function(msg) {
  console.log('msg=<',msg,'>');
});


setTimeout(function(){
  gofuro.publish('ok hot hot run');
},2000);

//console.log('gofuro=<',gofuro,'>');
