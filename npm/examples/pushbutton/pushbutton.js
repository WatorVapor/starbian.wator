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


pBtn.subscribe( function(msg) {
  console.log('msg=<',msg,'>');
});


setTimeout(function(){
  pBtn.publish('ok hot hot run');
},2000);

//console.log('gofuro=<',gofuro,'>');
