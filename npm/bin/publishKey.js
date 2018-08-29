#!/usr/bin/env node
'use strict';
const StarBian = require('..');

let publishKey = new StarBian();
//console.log('publishKey=<',publishKey,'>');
publishKey.onReady = () => {
  publishKey.broadcastPubKey( (password,progress,finnish) => {
    console.log('please search this key by <',password,'> will finnish at <',progress,'seconds');
    if(finnish) {
      process.exit(0);
    }
  });
}
