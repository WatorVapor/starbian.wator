'use strict';
const StarBian = require('starbian').StarBian;
const Peer = require('starbian').StarBianPeer;

let resourceUsage = new StarBian();
//console.log('resourceUsage=<',resourceUsage,'>');

resourceUsage.onReady = (priKey,pubKey,authedKey) => {
  console.log('priKey=<',priKey,'>');
  console.log('pubKey=<',pubKey,'>');
  console.log('authedKey=<',authedKey,'>');
  createAuthedPeer(authedKey);
};


function createAuthedPeer(authedKey) {
  console.log('authedKey=<',authedKey,'>');
  authedKey.forEach( (key) => {
    console.log('key=<',key,'>');
    let  peer = new Peer(key);
    peer.subscribe((msg,channel) => {
      onMessage(msg,channel,peer);
    });
    setInterval( ()=>{ 
      collectResource(peer);
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

const os = require('os');
function collectResource(peer){
  let totalMem = os.totalmem();
  let freeMem = os.freemem();
  let mem = 1.0 - freeMem/totalMem;
  //console.log('collectResource:mem=<',mem,'>');
  let cpus = os.cpus();
  let cpuUsage = [];
  //console.log('collectResource:cpus=<',cpus,'>');
  for(let cpu of cpus) {
    //console.log('collectResource:cpu=<',cpu,'>');
    let totol = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    let usage = 1.0 - cpu.times.idle/totol;
    //console.log('collectResource:usage=<',usage,'>');
    cpuUsage.push(usage);
  }
  peer.publish({
    memory:mem,
    cpu:cpuUsage
  });
};
