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
    pt.publish(channelPub,'pass through!!!');
  },20000);
};
