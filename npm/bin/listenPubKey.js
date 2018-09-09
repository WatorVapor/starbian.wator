#!/usr/bin/env node
'use strict';
const BroadCast = require('..').StarBianBroadCast;
const StarBian = require('..').StarBian;

let starbian = new StarBian();
//console.log('listenKey=<',listenKey,'>');
let listenKey = new BroadCast();
//console.log('listenKey=<',listenKey,'>');


let password = false;
let hitPubKey = false;

listenKey.subscribe_broadcast((msg,channel) => {
  //console.log('searchKey.subscribe_broadcast typeof msg=<',typeof msg,'>');
  if(typeof msg === 'string') {
    msg = JSON.parse(msg);
  }
  //console.log('searchKey.subscribe_broadcast msg=<',msg,'>');
  //console.log('searchKey.subscribe_broadcast channel=<',channel,'>');
  if(msg.shareKey) {
    //console.log('searchKey.subscribe_broadcast msg.shareKey=<',msg.shareKey,'>');
    if(msg.shareKey.password.toString() === password) {
      //console.log('searchKey.subscribe_broadcast msg.shareKey=<',msg.shareKey,'>');
      hitPubKey = msg.shareKey.pubkey;
      console.log('hit a key =<',hitPubKey,'>  save it yes/no?');
    } else {
      //console.log('pass msg.shareKey=<',msg.shareKey,'>');
    }
  }
});


process.stdin.setEncoding('utf8');
let doReadInput = () => {
  process.stdin.on('readable', () => {
    console.log('input one time password please');
    const chunk = process.stdin.read();
    if (chunk !== null) {
      if(hitPubKey) {
        if(chunk.trim() === 'yes') {
          starbian.addAuthedKey(hitPubKey);
          hitPubKey = false;
          password = false;
          process.exit(0);
        }
      } else {
        password = chunk.trim();
        console.log('search with <',password,'>');
      }
    }
  });
};

process.stdin.on('end', () => {
  process.stdout.write('end');
});

listenKey.onReady = () => {
  setTimeout(doReadInput,1);
}

