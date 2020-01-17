const dgram = require('dgram');
const dns = require('dns');
class DHTPeer {
  constructor(key,repos) {
    console.log('DHTPeer::constructor::key:=',key,'>');
    console.log('DHTPeer::constructor::repos:=',repos,'>');
  }
};

module.exports = DHTPeer;