/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';
const StarBian = require('starbian');

const wsProxy = new StarBian();
//console.log('wsProxy=<',wsProxy,'>');

const WebSocket = require('ws');
 
const wss = new WebSocket.Server({host:'127.0.0.1', port: 19080 });

let wsClients = {};
 
wss.on('connection', function (ws) {
  console.log('ws=<', ws,'>');
  ws.on('message', function (message) {
    console.log('received: message=<', message,'>');
    try {
      var jsonMsg = JSON.parse(message);
      console.log('jsonMsg=<', jsonMsg,'>');
      if(jsonMsg && jsonMsg.channel && jsonMsg.msg) {
       wsProxy.passthrough(jsonMsg.channel,jsonMsg.msg);
      }
      if(jsonMsg && jsonMsg.channel && jsonMsg.subscribe) {
       wsProxy.subscribe(jsonMsg.channel,onStarBianMsg);
       wsClients[jsonMsg.channel] = ws;
      }
    } catch(e){
      console.log('e=<', e,'>');
    }
  });
});

onStarBianMsg  = function(channel,msg) {
  console.log('channel=<',channel,'>');
  console.log('msg=<',msg,'>');
  console.log('wsClients=<',wsClients,'>');
}
