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

gofuro.subscribe((msg,channel) => {
  console.log('gofuro.subscribe typeof msg=<',typeof msg,'>');
  if(typeof msg === 'string') {
    msg = JSON.parse(msg);
  }
  console.log('gofuro.subscribe msg=<',msg,'>');
  console.log('gofuro.subscribe channel=<',channel,'>');
  if(msg.hotup) {
    let respJson = {
      hotted:true
    };
    gofuro.publish(respJson,channel);
  }
});

gofuro.subscribe_broadcast((msg,channel) => {
  console.log('gofuro.subscribe_broadcast typeof msg=<',typeof msg,'>');
  if(typeof msg === 'string') {
    msg = JSON.parse(msg);
  }
  console.log('gofuro.subscribe_broadcast msg=<',msg,'>');
  console.log('gofuro.subscribe_broadcast channel=<',channel,'>');
  if(msg.shareKey) {
    console.log('gofuro.subscribe_broadcast msg.shareKey=<',msg.shareKey,'>');
  }
});


