'use strict';
const StarBian = require('../..').StarBian;

gofuro.onReady = (priKey,pubKey,authedKey) => {
  console.log('priKey=<',priKey,'>');
  console.log('pubKey=<',pubKey,'>');
  console.log('authedKey=<',authedKey,'>');
};

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
  //console.log('gofuro.subscribe_broadcast typeof msg=<',typeof msg,'>');
  if(typeof msg === 'string') {
    msg = JSON.parse(msg);
  }
  //console.log('gofuro.subscribe_broadcast msg=<',msg,'>');
  //console.log('gofuro.subscribe_broadcast channel=<',channel,'>');
  if(msg.shareKey) {
    console.log('gofuro.subscribe_broadcast msg.shareKey=<',msg.shareKey,'>');
  }
});


