'use strict';
const StarBian = require('starbian').StarBian;
let simulator = new StarBian();
//console.log('simulator=<',simulator,'>');

simulator.onReady = (priKey,pubKey,authedKey) => {
  console.log('priKey=<',priKey,'>');
  console.log('pubKey=<',pubKey,'>');
  console.log('authedKey=<',authedKey,'>');
  createAuthedPeer(authedKey);
};

const Peer = require('starbian').StarBianPeer;

function createAuthedPeer(authedKey) {
  console.log('authedKey=<',authedKey,'>');
  authedKey.forEach( (key) => {
    let  peer = new Peer(key);
    peer.subscribe((msg,channel) => {
      onMessage(msg,channel,peer);
    });
  });
}

function onMessage(msg,channel,peer) {
  console.log('simulator typeof msg=<',typeof msg,'>');
  if(typeof msg === 'string') {
    msg = JSON.parse(msg);
  }
  console.log('simulator msg=<',msg,'>');
  console.log('simulator channel=<',channel,'>');
  if(msg.hotup) {
    let respJson = {
      hotted:true
    };
    peer.publish(respJson);
  }
}

