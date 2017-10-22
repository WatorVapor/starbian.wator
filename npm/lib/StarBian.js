/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

var rs = require('jsrsasign');
var rsu = require('jsrsasign-util');
var redis = require("redis");


class StarBian {
  /**
   * Create a new `StarBian`.
   *
   */
  constructor () {
    this.prvkey = rsu.readFile('.keys/prv.pem');
    console.log('this.prvkey=<',this.prvkey,'.');
  }
  /**
   * get private key.
   *
   */
  getPrivate () {
    return '';
  }
  /**
   * get public key.
   *
   */
  getPublic () {
    return '';
  }
  /**
   * get authed public key.
   *
   */
  getAuthed () {
    return [''];
  }
  /**
   * publish a messege.
   *
   * @param {String} msg 
   */
  publish(msg) {
  }
  /**
   * subscribe.
   *
   * @param {Function} callback 
   */
  subscribe(callback) {
  }
}

module.exports = StarBian;
