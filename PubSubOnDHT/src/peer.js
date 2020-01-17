const dgram = require('dgram');
const dns = require('dns');
const PeerCrypto = require('./peer.crypto.js');
class DHTPeer {
  constructor(key,repos) {
    //console.log('DHTPeer::constructor::key:=<',key,'>');
    //console.log('DHTPeer::constructor::repos:=<',repos,'>');
    this.crypto_ = new PeerCrypto(key,repos);
    //console.log('DHTPeer::constructor::this.crypto_:=<',this.crypto_,'>');
  }
  sign(msg) {
    return this.crypto_.sign(msg);
  }
  verify(msg) {
    return this.crypto_.verify(msg);
  }
  calcID(msg) {
    return this.crypto_.calcID(msg);
  }
};

module.exports = DHTPeer;
