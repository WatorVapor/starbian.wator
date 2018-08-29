#!/usr/bin/env node
'use strict';
const StarBian = require('..');

let broadcast = new StarBian();
//console.log('broadcast=<',broadcast,'>');
broadcast.onReady = () => {
  broadcast.broadcastPubKey( (progress,password) => {
    if(progress < 1) {
      process.exit(0);
    } else {
      console.log('please search this key by <',password,'> will finnish at <',10 * progress,'seconds');
    }
  });
}
