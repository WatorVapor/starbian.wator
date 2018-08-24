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
const SHA3  = require('sha3');
const rs = require('jsrsasign');
//const rsu = require('jsrsasign-util');
const StarBianP2p = require('./star_bian_p2p');


class StarBian {
  /**
   * Create a new `StarBian`.
   *
   */
  constructor () {
    if(!fs.existsSync('.keys/')) {
      fs.mkdirSync('.keys/');
    }
    this.keyPath_ = '.keys/key.json';
    if(!fs.existsSync(this.keyPath_)) {
      this._createKeyPair();
    }
    this._loadKeyPair();
    //console.log('StarBian constructor:this.p2p=<',this.p2p,'>');
    this.channelPath_ = 'channels.json';
    if(fs.existsSync(this.channelPath_)) {
      let channelStr = fs.readFileSync(this.channelPath_, 'utf8');
      this.channel = JSON.parse(channelStr);
    } else {
      this.channel = {};
      this.channel.myself = this.pubHex;
      this.channel.authed = [];
      let saveChannel = JSON.stringify(this.channel,null, 2);
      fs.writeFileSync(this.channelPath_,saveChannel);
    }
    this.p2p = new StarBianP2p();
    let self = this;
    this.p2p.onReady = () => {
      self.p2p.in(self.pubKeyStr,(msg) => {self._onP2PMsg(self.pubKeyStr,msg)});      
      if(typeof this.onReady === 'function') {
        self.onReady();
      }
    };
    this.chCB = {};
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
    return this.channel.authed;
  }
  /**
   * publish a messege.
   *
   * @param {String} msg 
   */
  publish(msg) {
    console.log('msg =<',msg,'>');
    let msgEnc = JSON.stringify(msg);
    console.log('msgEnc =<',msgEnc,'>');
    let d = new SHA3.SHA3Hash();
    let signOrig = Buffer.from(msgEnc).toString('base64');
    d.update(signOrig);
    let signHash = d.digest('hex');
    let sign = this.key.sign(signHash, 'sha256');
    let signature = sign.toDER('hex').toString('base64');
    let pubObj = {
      enc:msgEnc,
      sign:signature
    };
    this.p2p.out(this.channel.myself ,pubObj);
  }
  
  /**
   * pass through a messege.
   *
   * @param {String} msg 
   */
  passthrough(channel,msg) {
    //console.log('passthrough:msg =<',msg,'>');
    this.p2p.out(channel ,msg);
  }
  /**
   * subscribe.
   *
   * @param {String} channel 
   * @param {Function} callback 
   */
  subscribe(channel,callback) {
    console.log('subscribe channel =<',channel,'>');
    this.p2p.in(channel ,callback);
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
    this.channel = {};
    this.channel.myself = this.pubHex;
    this.channel.authed = [];
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

  /**
   * suscribe channels.
   *
   * @private
   */
  _subManagedChannels() {
    let self = this;
    for(let i = 0; i < this.channel.authed.length;i++) {
      let channel = this.channel.authed[i];
    }
  }
  /**
   * on channel msg.
   *
   * @param {String} msg 
   * @private
   */
  _onP2PMsg(channel,msg) {
    console.log('_onP2PMsg::channel=<',channel,'>');
    console.log('_onP2PMsg::msg=<',msg,'>');
    let authed = this._verifyAuth(msg.auth);
    console.log('_onP2PMsg::authed=<',authed,'>');
    /*
    let d = new SHA3.SHA3Hash();
    let signOrig = Buffer.from(msg.enc).toString('base64');
    d.update(signOrig);
    let signHash = d.digest('hex');
    let pubKey = ec.keyFromPublic(channel, 'hex');
    let verify = pubKey.verify(signHash,msg.sign);
    //console.log('_onP2PMsg::verify=<',verify,'>');
    if(verify) {
      let cbs = this.chCB[channel];
      if(cbs) {
        for(let i = 0 ; i < cbs.length;i++) {
          let cb = cbs[i];
          if(typeof cb === 'function') {
            cb(channel,msg);
          }
        }
      }
    }
    */
  }

  _verifyAuth(auth) {
    //console.log('verifyAuth auth=<',auth,'>');
    if(auth) {
      let pubKey = rs.KEYUTIL.getKey(auth.pubKey);
      //console.log('verifyAuth pubKey=<',pubKey,'>');
      let signEngine = new rs.KJUR.crypto.Signature({alg: 'SHA256withECDSA'});
      signEngine.init({xy: pubKey.pubKeyHex, curve: 'secp256r1'});
      signEngine.updateString(auth.hash);
      //console.log('verifyAuth signEngine=<',signEngine,'>');
      let result = signEngine.verify(auth.sign);
      //console.log('verifyAuth result=<',result,'>');
      return result;
    } else {
      return false;
    }
  }
  
  
}

module.exports = StarBian;
