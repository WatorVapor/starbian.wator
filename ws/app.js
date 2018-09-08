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
  //console.log('onStarBianBroadCast:msg=<',msg,'>');
  //console.log('onStarBianBroadCast:channel=<',channel,'>');
  //console.log('onStarBianBroadCast:peer=<',peer,'>');
  wss.clients.forEach(function each(ws) {
    let sentMsg = {
      channel:channel,
      msg:msg
    };
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(sentMsg));
    }
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
      console.log('jsonMsg=<', jsonMsg,'>');
      if(jsonMsg) {
        wsProxy.verifyAuth(jsonMsg.auth,() => {
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
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(sentMsg));
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

/*
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
      let result = signEngine.verify(auth.sign);	
      if(cb) {
        cb();
      } else {
        console.log('verifyAuth not authed !!! result=<',result,'>');
        console.log('verifyAuth not authed !!! auth=<',auth,'>');
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
*/

