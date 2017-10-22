/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const rs = require('jsrsasign');
const rsu = require('jsrsasign-util');
var crypto = require('crypto');
const redis = require("redis");
const fs = require('fs');


class StarBian {
  /**
   * Create a new `StarBian`.
   *
   */
  constructor () {
    //console.log('rsu=<',rsu,'>');
    if(!fs.existsSync('.keys/')) {
      fs.mkdirSync('.keys/');
    }
    if(fs.existsSync('.keys/prv.pem')) {
      this.prvKeyStr = rsu.readFile('.keys/prv.pem');
      console.log('this.prvKeyStr=<',this.prvKeyStr,'.');
      if(fs.existsSync('.keys/pub.pem')) {
        this.pubKeyStr = rsu.readFile('.keys/pub.pem');
        console.log('this.pubKeyStr=<',this.pubKeyStr,'.');
      } else {
        this.reCreatePubKey();
      }
    } else {
      this.createKeyPair();
    }
    this.priObj = rs.KEYUTIL.getKey(this.prvKeyStr);
    this.pubObj = rs.KEYUTIL.getKey(this.pubKeyStr);
    console.log('this.priObj=<',this.priObj,'.');
    console.log('this.pubObj=<',this.pubObj,'.');
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
    var rsaKeypair = rs.KEYUTIL.generateKeypair("RSA", 2048);
    //console.log('rsaKeypair=<',rsaKeypair,'>');
    this.prvKeyStr = rs.KEYUTIL.getPEM(rsaKeypair.prvKeyObj,'PKCS8PRV');
    console.log('this.prvKeyStr=<',this.prvKeyStr,'>');
    this.pubKeyStr =  rs.KEYUTIL.getPEM(rsaKeypair.pubKeyObj);
    console.log('this.pubKeyStr=<',this.pubKeyStr,'>');
    fs.writeFileSync('.keys/prv.pem', this.prvKeyStr, function(error){
      console.log('error=<',error,'>');
    });
    fs.writeFileSync('.keys/pub.pem', this.pubKeyStr, function(error){
      console.log('error=<',error,'>');
    });
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
