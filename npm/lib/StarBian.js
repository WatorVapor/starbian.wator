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
      //console.log('this.prvKeyStr=<',this.prvKeyStr,'>');
      if(fs.existsSync('.keys/pub.pem')) {
        this.pubKeyStr = rsu.readFile('.keys/pub.pem');
        //console.log('this.pubKeyStr=<',this.pubKeyStr,'>');
      } else {
        this.reCreatePubKey();
      }
    } else {
      this.createKeyPair();
    }
    this.priObj = rs.KEYUTIL.getKey(this.prvKeyStr);
    this.pubObj = rs.KEYUTIL.getKey(this.pubKeyStr);
    //console.log('this.priObj=<',this.priObj,'>');
    //console.log('this.pubObj=<',this.pubObj,'>');
    this.clientPub = redis.createClient({host:'www.wator.xyz'});
    this.clientPub.on('ready', function () {
      console.log('this.clientPub ready');
    });
    this.clientPub.on('error', function (err) {
      console.log('this.clientPub err=<',err,'>');
    });
    this.clientSub = redis.createClient({host:'www.wator.xyz'});
    this.clientSub.on('ready', function () {
      console.log('this.clientSub ready');
    });
    this.clientSub.on('error', function (err) {
      console.log('this.clientSub err=<',err,'>');
    });
  }
  /**
   * get private key.
   *
   */
  getPrivate () {
    return this.prvKeyStr;
  }
  /**
   * get public key.
   *
   */
  getPublic () {
    return this.pubKeyStr;
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
    fs.writeFileSync('.keys/prv.pem', this.prvKeyStr, {encoding: 'utf-8'}, function(error){
      console.log('error=<',error,'>');
    });
    fs.writeFileSync('.keys/pub.pem', this.pubKeyStr, {encoding: 'utf-8'}, function(error){
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
