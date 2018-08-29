#!/usr/bin/env node
'use strict';
const StarBian = require('..');

let broadcast = new StarBian();
//console.log('broadcast=<',broadcast,'>');
broadcast.onReady = () => {
  broadcast.broadcastPubKey( (progress,password) => {
    console.log('please search this key by <',password,'> will finnish at <',10 * progress,'seconds');
    if(password < 1) {
      process.exit(0);
    }
  });
}
