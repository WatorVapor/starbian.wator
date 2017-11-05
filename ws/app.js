/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';
const StarBian = require('starbian');

var wsProxy = new StarBian();
//console.log('wsProxy=<',wsProxy,'>');

const WebSocket = require('ws');
 
const wss = new WebSocket.Server({host:'127.0.0.1', port: 19080 });
 
wss.on('connection', function connection(ws) {
  //console.log('ws=<', ws,'>');
  ws.on('message', function incoming(message) {
    console.log('received: message=<', message,'>');
    try {
      var jsonMsg = JSON.parse(message);
      console.log('jsonMsg=<', jsonMsg,'>');
      if(jsonMsg && jsonMsg.channel) {
       wsProxy.passthrough(jsonMsg.channel,message);
      }
    } catch(e){
      console.log('e=<', e,'>');
    }
  });
});
