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
    console.log('key=<',key,'>');
    let  peer = new Peer(key);
    peer.subscribe((msg,channel) => {
      onMessage(msg,channel,peer);
    });
    setInterval( ()=>{ 
      generateSignal(peer);
    },1000*10);
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
let iCounter = 0;
const fConstRadiusStep = Math.PI/50;
function generateSignal(peer){
  let x = (iCounter++) * fConstRadiusStep;
  let signal = Math.sin(x);
  peer.publish({wave:signal});
};
