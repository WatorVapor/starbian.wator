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
