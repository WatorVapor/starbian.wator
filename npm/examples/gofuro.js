'use strict';
const StarBian = require('..');

var gofuro = new StarBian();
console.log('gofuro=<',gofuro,'>');

var private = gofuro.getPrivate();
console.log('private=<',private,'>');

var public  = gofuro.getPublic();
console.log('public=<',public,'>');

var authed  = gofuro.getAuthed();
console.log('authed=<',authed,'>');


gofuro.subscribe( function(msg) {
  console.log('msg=<',msg,'>');
});

gofuro.publish('ok hot hot run');

console.log('gofuro=<',gofuro,'>');
