/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const fs = require('fs');
const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('p256');


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
    this.keyPath_ = '.keys/key.json';
    if(fs.existsSync(this.keyPath_)) {
      this._loadKeyPair();
    } else {
      this._createKeyPair();
    }
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
    var sign = this.priObj.sign(msgEnc, 'sha256');
    var pubObj = {
      enc:msgEnc,
      sign:sign
    };
  }
  /**
   * pass through a messege.
   *
   * @param {String} msg 
   */
  passthrough(channel,msg) {
    console.log('msg =<',msg,'>');
  }
  /**
   * subscribe.
   *
   * @param {Function} callback 
   */
  subscribe(callback) {
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
    console.log('decrypt::msg=<',msg,'>');
    var msgJson = JSON.parse(msg);
    var plainMsg = rs.KJUR.crypto.Cipher.decrypt(msgJson.enc,this.priObj);
    console.log('decrypt::plainMsg=<',plainMsg,'>');
    return plainMsg;
  }

  /**
   * create key pair.
   *
   * @private
   */
  _createKeyPair() {
    let key = ec.genKeyPair();
    this.key = key;
    console.log('_createKeyPair::this.key=<',this.key,'>');
    let pub = key.getPublic('hex');
    this.pubHex = pub;
    let prv = key.getPrivate('hex');
    this.prvHex = prv;
    let saveKey = JSON.stringify(this.key,null, 2);
    fs.writeFileSync(this.keyPath_,saveKey);
  }

  /**
   * load key pair.
   *
   * @private
   */
  _loadKeyPair() {
    let keyJson = fs.readFileSync(this.keyPath_, 'utf8');
    this.key = ec.keyFromPrivate(keyJson,'jwk');
    console.log('_loadKeyPair::this.key=<',this.key,'>');
  }

}

module.exports = StarBian;
