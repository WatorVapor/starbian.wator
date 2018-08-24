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




