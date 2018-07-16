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

const StarBianP2p = require('./star_bian_p2p');


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
    this.keyPath_ = '.keys/key.json';
    if(!fs.existsSync(this.keyPath_)) {
      this._createKeyPair();
    }
    this._loadKeyPair();
    this.p2p = new StarBianP2p();
    //console.log('StarBian constructor:this.p2p=<',this.p2p,'>');
    this.channelPath_ = 'channels.json';
    if(fs.existsSync(this.channelPath_)) {
      this.channel = require(this.channelPath_);
    } else {
      this.channel.myself = this.pubHex;
      let saveChannel = JSON.stringify(this.channel,null, 2);
      fs.writeFileSync(this.channelPath_,saveChannel);
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
    //console.log('_createKeyPair::this.key=<',this.key,'>');
    let pub = key.getPublic('hex');
    this.pubHex = pub;
    let prv = key.getPrivate('hex');
    this.prvHex = prv;
    let save = {prv:this.prvHex,pub:this.pubHex};
    let saveKey = JSON.stringify(save,null, 2);
    fs.writeFileSync(this.keyPath_,saveKey);
    this.channel.myself = this.pubHex;
    let saveChannel = JSON.stringify(this.channel,null, 2);
    fs.writeFileSync(this.channelPath_,saveChannel);
  }

  /**
   * load key pair.
   *
   * @private
   */
  _loadKeyPair() {
    let keyStr = fs.readFileSync(this.keyPath_, 'utf8');
    let keyJson = JSON.parse(keyStr);
    this.key = ec.keyFromPrivate(keyJson.prv,'hex');
    //console.log('_loadKeyPair::this.key=<',this.key,'>');
    this.prvHex = this.key.getPrivate('hex');
    this.pubHex = this.key.getPublic('hex');;
    //console.log('_loadKeyPair::this.key=<',this.key,'>');
    this.prvKeyStr = this.prvHex;
    this.pubKeyStr = this.pubHex;
  }

}

module.exports = StarBian;
