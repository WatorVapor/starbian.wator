'use strict';
const StarBian = require('../..').StarBian;

let pBtn = new StarBian();
//console.log('pBtn=<',pBtn,'>');
pBtn.onReady = (priKey,pubKey,authedKey) => {
  console.log('priKey=<',priKey,'>');
  console.log('pubKey=<',pubKey,'>');
  console.log('authedKey=<',authedKey,'>');
};

