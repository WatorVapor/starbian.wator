/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';
const StarBian = require('starbian');
const wsProxy = new StarBian();
const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('p256');
//console.log('wsProxy=<',wsProxy,'>');
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
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

wss.on('connection', function (ws,req) {
  //console.log('req.headers=<',req.headers,'>');
  //console.log('ws=<', ws,'>');
  //const ip = req.connection.remoteAddress;
  const ip = req.headers['x-real-ip'].split(/\s*,\s*/)[0];
  ws.key = req.headers['sec-websocket-key'];
  //console.log('ip=<',ip,'>');
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('message', function (message) {
    //console.log('received: message=<', message,'>');
    try {
      let jsonMsg = JSON.parse(message);
      console.log('jsonMsg=<', jsonMsg,'>');
      if(jsonMsg && verifyAuth(jsonMsg.auth)) {
        onAuthedMsg(jsonMsg,ws);
      } else {
        console.log('not authed jsonMsg=<', jsonMsg,'>');
        return;
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
    client.send(JSON.stringify(sentMsg));
  }
}

function removeWSClients(key) {
  //console.log('key=<',key,'>');
  //console.log('wsClients=<',wsClients,'>');
  let indexWS = Object.keys(wsClients);
  for(let i =0;i < indexWS.length;i++) {
    let wsChannels = indexWS[i];
    let wsc = wsClients[wsChannels];
    if(wsc && wsc.key) {
      if(wsc.key === key) {
        delete wsClients[wsChannels];
      }
    }
  }
  //console.log('wsClients=<',wsClients,'>');
}

function onAuthedMsg(jsonMsg,ws) {
  if(jsonMsg.channel && jsonMsg.subscribe) {
    wsProxy.subscribe(jsonMsg.channel,onStarBianMsg);
    wsClients[jsonMsg.channel] = ws;
  }
  if(jsonMsg.channel && jsonMsg.ecdh) {
    wsProxy.passthrough(jsonMsg.channel,jsonMsg);
  }
  if(jsonMsg.channel && jsonMsg.msg) {
    wsProxy.passthrough(jsonMsg.channel,jsonMsg);
  }
}
function verifyAuth(auth) {
  console.log('verifyAuth auth=<',auth,'>');
  if(auth) {
    let pubKey = ec.keyFromPublic(auth.pubKey, 'hex');
    console.log('verifyAuth pubKey=<',pubKey,'>');
    let sign = auth.sign;
    if(auth.enc === 'hex') {
      
    }
    let verify = pubKey.verify(auth.hash,sign);
    console.log('verifyAuth verify=<',verify,'>');
    return verify;
    return true;
  } else {
    return false;
  }
}
