'use strict';
const StarBian = require('../..');

let gofuro = new StarBian();
//console.log('gofuro=<',gofuro,'>');

let priKey = gofuro.getPrivate();
console.log('priKey=<',priKey,'>');

let pubKey  = gofuro.getPublic();
console.log('pubKey=<',pubKey,'>');

let authedKey  = gofuro.getAuthed();
console.log('authedKey=<',authedKey,'>');

gofuro.subscribe((msg,channel) => {
  console.log('gofuro.subscribe msg=<',msg,'>');
  console.log('gofuro.subscribe typeof msg=<',typeof msg,'>');
  console.log('gofuro.subscribe channel=<',channel,'>');
});

