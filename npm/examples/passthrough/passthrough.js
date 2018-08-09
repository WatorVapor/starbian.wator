'use strict';
const StarBian = require('../..');

let pt = new StarBian();
//console.log('pt=<',pt,'>');

let priKey = pt.getPrivate();
console.log('priKey=<',priKey,'>');

let pubKey  = pt.getPublic();
console.log('pubKey=<',pubKey,'>');

let authedKey  = pt.getAuthed();
console.log('authedKey=<',authedKey,'>');


const channelPub = '1111111';

pt.subscribe(channelPub,(channel,msg) =>{
  console.log('channel=<',channel,'>');
  console.log('msg=<',msg,'>');
});

pt.onReady = ()=> {
  setTimeout(function(){
    pt.passthrough(channelPub,{msg:'pass through!!!'});
  },2000);
  setTimeout(function(){
    pt.passthrough(channelPub,{msg:'pass through!!!222'});
  },4000);
  setTimeout(function(){
    pt.passthrough(channelPub,{msg:'pass through!!!333'});
  },6000);
};