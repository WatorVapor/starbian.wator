'use strict';
const StarBian = require('../..').StarBianRepeater;
const channelPub = '1111111';

let pt = new StarBian();
//console.log('pt=<',pt,'>');

pt.onReady = (priKey,pubKey,authedKey)=> {
  console.log('priKey=<',priKey,'>');
  console.log('pubKey=<',pubKey,'>');
  console.log('authedKey=<',authedKey,'>');

  setTimeout(function(){
    pt.passthrough(channelPub,{msg:'pass through!!!'});
  },2000);
  setTimeout(function(){
    pt.passthrough(channelPub,{msg:'pass through!!!222'});
  },4000);
  setTimeout(function(){
    pt.passthrough(channelPub,{msg:'pass through!!!333'});
  },6000);
  setTimeout(function(){
    pt.passthrough('broadcast',{msg:'pass through!!!444'});
  },6000);
};


pt.subscribe_passthrough(channelPub,(msg,channel,peer) =>{
  console.log('pt.subscribe_passthrough msg=<',msg,'>');
  console.log('pt.subscribe_passthrough channel=<',channel,'>');
  console.log('pt.subscribe_passthrough peer=<',peer,'>');
});

pt.subscribe_passthrough_broadcast( (msg,channel,peer) =>{
  console.log('pt.subscribe_passthrough_broadcast msg=<',msg,'>');
  console.log('pt.subscribe_passthrough_broadcast channel=<',channel,'>');
  console.log('pt.subscribe_passthrough_broadcast peer=<',peer,'>');
});
