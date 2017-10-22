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
    if(!fs.existsSync('.channels/')) {
      fs.mkdirSync('.channels/');
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
    
    this.decryptObj = rs.KJUR.crypto.Cipher(this.priObj);
    console.log('this.decryptObj=<',this.decryptObj,'>');
    
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
    console.log('msg =<',msg,'>');
    var msgEnc = rs.KJUR.crypto.Cipher.encrypt(msg, this.pubObj);
    console.log('msgEnc =<',msgEnc,'>');
    this.clientPub.publish(this.channel,msgEnc);
  }
  /**
   * subscribe.
   *
   * @param {Function} callback 
   */
  subscribe(callback) {
    var self = this;
    if(this.channel) {
      this.callback.push(callback);
    } else {
      this.callback = []
      this.callback.push(callback);

      this.channel = rs.KJUR.crypto.Util.sha256(this.pubKeyStr);
      console.log('this.channel =<',this.channel,'>');
      this.clientSub.on("subscribe", function (channel, count) {
        console.log('channel =<',channel,'>');
        console.log('count =<',count,'>');
      });
      this.clientSub.on("message", function (channel, message) {
        console.log('channel =<',channel,'>');
        console.log('message =<',message,'>');
        var plainMsg = self.decrypt(message);
        for(var i = 0;i < self.callback.length;i++) {
          var cb = self.callback[i];
          cb(plainMsg);
        }
      });
      this.clientSub.subscribe(this.channel);
    }
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
   * @private
   */
  reCreatePubKey() {
  }
  
  /**
   * decrypt public key.
   *
   * @param {String} msg 
   * @private
   */
  decrypt(msg) {
    //this.decryptObj
    console.log('msg=<',msg,'>');
  }
}

module.exports = StarBian;
