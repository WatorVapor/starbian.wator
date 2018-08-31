/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';
const StarBian = require('starbian');
const wsProxy = new StarBian();
const crypto = require('crypto');
const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();
const bs58 = require('bs58');
const WebSocket = require('ws');
const rs = require('jsrsasign');
const rsu = require('jsrsasign-util');
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

wsProxy.onReady = () =>{
  wsProxy.subscribe_passthrough_broadcast(onStarBianBroadCast);
};
function onStarBianBroadCast(msg,channel,peer) {
  //console.log('onStarBianBroadCast:msg=<',msg,'>');
  //console.log('onStarBianBroadCast:channel=<',channel,'>');
  //console.log('onStarBianBroadCast:peer=<',peer,'>');
  wss.clients.forEach(function each(ws) {
    let sentMsg = {
      channel:channel,
      msg:msg
    };
    ws.send(JSON.stringify(sentMsg));
  });
}

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
      //console.log('jsonMsg=<', jsonMsg,'>');
      if(jsonMsg) {
        verifyAuth(jsonMsg.auth,(good) => {
          if(good) {
             onAuthedMsg(jsonMsg,ws);
          } else {
            console.log('not authed message=<', message,'>');
          }
        });
      } else {
        console.log('not json message=<', message,'>');
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
  if(jsonMsg.channel) {
    if(jsonMsg.subscribe) {
      wsProxy.subscribe_passthrough(jsonMsg.channel,onStarBianMsg);
      wsClients[jsonMsg.channel] = ws;
    } else {
      wsProxy.passthrough(jsonMsg.channel,jsonMsg);
    }
  } else {
    console.log('onAuthedMsg jsonMsg=<',jsonMsg,'>');
  }
}

function buf2hex(buf) {
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}
function hex2buf(str) {
  return Buffer.from(str,'hex');
}

function verifyAuth(auth,cb) {	
  //console.log('verifyAuth auth=<',auth,'>');	
  if(auth) {
    Bs58Key2RsKey(auth.pubKeyB58,(pubKey) => {
      //console.log('verifyAuth pubKey=<',pubKey,'>');
      let signEngine = new rs.KJUR.crypto.Signature({alg: 'SHA256withECDSA'});	
      signEngine.init({xy: pubKey.pubKeyHex, curve: 'secp256r1'});	
      signEngine.updateString(auth.hash);	
      //console.log('verifyAuth signEngine=<',signEngine,'>');
      let signBuff = Buffer.from(auth.sign,'base64');
      let result = signEngine.verify(signBuff);	
      //console.log('verifyAuth result=<',result,'>');
      if(cb) {
        cb();
      } else {
        console.log('verifyAuth not authed !!! result=<',result,'>');
      }
    });
  }
}

function Bs58Key2RsKey(bs58Key,cb) {
  //console.log('Bs58Key2RsKey bs58Key=<',bs58Key,'>');
  const pubKeyBuff = bs58.decode(bs58Key);
  //console.log('Bs58Key2RsKey pubKeyBuff=<',pubKeyBuff,'>');  
  webcrypto.subtle.importKey(
    'raw',
    pubKeyBuff,
    {
      name: 'ECDSA',
      namedCurve: 'P-256', 
    },
    true, 
    ['verify']
  )
  .then(function(pubKey){
    //console.log('Bs58Key2RsKey:pubKey=<' , pubKey , '>');
    webcrypto.subtle.exportKey('jwk', pubKey)
    .then(function(keydata){
      //console.log('Bs58Key2RsKey keydata=<' , keydata , '>');
      let rsKey = rs.KEYUTIL.getKey(keydata);	
      //console.log('Bs58Key2RsKey rsKey=<',rsKey,'>');
      cb(rsKey);
    })
    .catch(function(err){
      console.error(err);
    });
  })
  .catch(function(err){
    console.error(err);
  });
}
