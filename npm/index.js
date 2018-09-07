/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';
module.exports = {
  StarBian : require('./lib/StarBian').StarBian,
  Peer : require('./lib/StarBian').Peer,
  BroadCast : require('./lib/StarBian').BroadCast,
  StarBianRepeater:require('./lib/StarBianRepeater')
}
