/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';
//const StarBian = require('starbian').StarBianRepeater;
const StarBian = require('../npm').StarBianRepeater;

const wsProxy = new StarBian();
const WebSocket = require('ws');
const wss = new WebSocket.Server({host:'127.0.0.1', port: 19080 });
let wsClients = {};

function noop() {
};
function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping(noop);
    }
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
  });
}, 30000);

wsProxy.onReady = () =>{
  wsProxy.subscribe_passthrough_broadcast(onStarBianBroadCast);
};
function onStarBianBroadCast(msg,channel,peer) {
  console.log('onStarBianBroadCast:msg=<',msg,'>');
  console.log('onStarBianBroadCast:channel=<',channel,'>');
  //console.log('onStarBianBroadCast:peer=<',peer,'>');
  let content = msg.broadcast;
  wsProxy.verifyAuth(msg.auth,content,() => {
    wss.clients.forEach(function each(ws) {
      let sentMsg = {
        channel:channel,
        msg:msg
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(sentMsg));
      }
    });
  });
}

wss.on('connection', function (ws,req) {
  //console.log('ws=<', ws,'>');
  //console.log('ws.upgradeReq=<', ws.upgradeReq,'>');
  //console.log('ws.upgradeReq.headers=<', ws.upgradeReq.headers,'>');
  if(req && req.headers) {
    ws.key = req.headers['sec-websocket-key'];
  }
  if(ws && ws.upgradeReq && ws.upgradeReq.headers) {
    ws.key = ws.upgradeReq.headers['sec-websocket-key'];
  }
  console.log('ws.key=<', ws.key,'>');
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('message', function (message) {
    //console.log('received: message=<', message,'>');
    try {
      let jsonMsg = JSON.parse(message);
      //console.log('jsonMsg=<', jsonMsg,'>');
      let content = jsonMsg.encrypt || jsonMsg.ecdh || jsonMsg.subscribe || jsonMsg.broadcast;
      if(jsonMsg) {
        wsProxy.verifyAuth(jsonMsg.auth,content,() => {
          onAuthedMsg(jsonMsg,ws);
        });
      } else {
        console.log('not json message=<', message,'>');
      }
    } catch(e){
      console.log('e=<', e,'>');
    }
  });
  ws.on('close', function (evt) {
    console.log('close ws.key=<', ws.key,'>');
    removeWSClients(ws.key);
  });
});

function onStarBianMsg(msg,channel,peer) {
  //console.log('onStarBianMsg:msg=<',msg,'>');
  //console.log('onStarBianMsg:channel=<',channel,'>');
  //console.log('onStarBianMsg:peer=<',peer,'>');
  //console.log('onStarBianMsg:wsClients=<',wsClients,'>');
  let client = wsClients[channel];
  //console.log('onStarBianMsg:client=<',client,'>');
  if(client) {
    let sentMsg = {
      channel:channel,
      msg:msg
    };
    let iClient = Object.keys(client);
    for(let i = 0;i < iClient.length;i++) {
      let key = iClient[i];
      let ws = client[key];
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(sentMsg));
      }
    }
  }
}

function removeWSClients(key) {
  //console.log('key=<',key,'>');
  //console.log('wsClients=<',wsClients,'>');
  let indexWS = Object.keys(wsClients);
  for(let i =0;i < indexWS.length;i++) {
    let wsChannels = indexWS[i];
    let wsc = wsClients[wsChannels];
    if(wsc && wsc[key]) {
      delete wsClients[wsChannels][key];
    }
  }
  //console.log('wsClients=<',wsClients,'>');
}

function addWSClients(channel,ws) {
  //console.log('addWSClients ws=<',ws,'>');
  let key = ws.key;
  //console.log('addWSClients key=<',key,'>');
  //console.log('addWSClients channel=<',channel,'>');
  //wsClients[channel];
  wsClients[channel] = wsClients[channel] || {};
  wsClients[channel][key] = ws;
  //console.log('wsClients=<',wsClients,'>');
}


function onAuthedMsg(jsonMsg,ws) {
  if(jsonMsg.channel) {
    if(jsonMsg.subscribe) {
      wsProxy.subscribe_passthrough(jsonMsg.channel,onStarBianMsg);
      addWSClients(jsonMsg.channel,ws);
    } else {
      wsProxy.passthrough(jsonMsg.channel,jsonMsg);
    }
  } else {
    console.log('onAuthedMsg jsonMsg=<',jsonMsg,'>');
  }
}

const constMaxMemoryStr = process.env.MMAX;
let constMaxMemory = false;
if(typeof constMaxMemoryStr === 'string') {
  constMaxMemory = parseInt(constMaxMemoryStr);
  if(constMaxMemoryStr.endsWith('M')) {
    constMaxMemory = constMaxMemory * 1024*1024;
  }
  if(constMaxMemoryStr.endsWith('G')) {
    constMaxMemory = constMaxMemory * 1024*1024*1024;
  }
}

const intervalMemory = setInterval(() =>{
  const used = process.memoryUsage();
  console.log('intervalMemory used=<',used,'>');
  console.log('intervalMemory constMaxMemory=<',constMaxMemory,'>');
  let percentage = 100*(used.rss + used.heapUsed + used.external) / constMaxMemory;
  console.log('intervalMemory percentage=<',percentage,'>');
}, 1000);



