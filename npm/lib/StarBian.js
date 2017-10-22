/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const rs = require('jsrsasign');
const rsu = require('jsrsasign-util');
const redis = require("redis");
const fs = require('fs');


class StarBian {
  /**
   * Create a new `StarBian`.
   *
   */
  constructor () {
    if(!fs.existsSync('.keys/')) {
      fs.mkdirSync('.keys/');
    }
    if(fs.existsSync('.keys/prv.pem')) {
      this.prvkey = rsu.readFile('.keys/prv.pem');
      console.log('this.prvkey=<',this.prvkey,'.');
      if(fs.existsSync('.keys/pub.pem')) {
        this.pubkey = rsu.readFile('.keys/pub.pem');
        console.log('this.pubkey=<',this.pubkey,'.');
      } else {
        this.reCreatePubKey();
      }
    } else {
      this.createKeyPair();
    }
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
  /**
   * create key pair.
   *
   * @param {Function} callback 
   * @private
   */
  createKeyPair() {
  }
  /**
   * recreate public key.
   *
   * @param {Function} callback 
   * @private
   */
  reCreatePubKey() {
  }
}

module.exports = StarBian;
