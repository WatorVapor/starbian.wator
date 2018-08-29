#!/usr/bin/env node
'use strict';
const StarBian = require('..');

let broadcast = new StarBian();
//console.log('broadcast=<',broadcast,'>');
broadcast.onReady = () => {
  broadcast.broadcastPubKey( (password,progress,finnish) => {
    console.log('please search this key by <',password,'> will finnish at <',progress,'seconds');
    if(finnish) {
      process.exit(0);
    }
  });
}
