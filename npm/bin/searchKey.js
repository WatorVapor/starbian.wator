#!/usr/bin/env node
'use strict';
const StarBian = require('..');

let searchKey = new StarBian();
//console.log('searchKey=<',searchKey,'>');

searchKey.subscribe_broadcast((msg,channel) => {
  //console.log('searchKey.subscribe_broadcast typeof msg=<',typeof msg,'>');
  if(typeof msg === 'string') {
    msg = JSON.parse(msg);
  }
  //console.log('searchKey.subscribe_broadcast msg=<',msg,'>');
  //console.log('searchKey.subscribe_broadcast channel=<',channel,'>');
  if(msg.shareKey) {
    console.log('searchKey.subscribe_broadcast msg.shareKey=<',msg.shareKey,'>');
  }
});


process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write(`data: ${chunk}`);
  }
});

process.stdin.on('end', () => {
  process.stdout.write('end');
});
