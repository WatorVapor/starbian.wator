'use strict';
const fs = require('fs');
const jsrsasign = require('jsrsasign');
const Crypto = require('crypto');
const RIPEMD160 = require('ripemd160');
const base32 = require("base32.js");



const iConstMessageOutDateInMs = 1000 * 60;
const bs32Option = { type: "crockford", lc: true };
class PeerCrypto {
  constructor(masterKey,repos) {
    //console.log('PeerCrypto::constructor masterKey=<',masterKey,'>');
    if(Object.keys(masterKey).length > 0) {
      this.loadKey__(masterKey);
    } else {
      this.createKey__();
      console.log('PeerCrypto::loadKey this.jwk=<',this.jwk,'>');
    }
    this.calcKeyBS32__();
    console.log('PeerCrypto::constructor this.pubBS32=<',this.pubBS32,'>');
    console.log('PeerCrypto::constructor this.idBS32=<',this.idBS32,'>');
  }
  sign(msg) {
    let now = new Date();
    msg.sign = {};
    msg.sign.ts = now.toGMTString();
    msg.sign.ms = now.getMilliseconds();
    msg.sign.pubKey = this.pubBS32;
    
    let msgHash = this.hashMsg_(JSON.stringify(msg));
    //console.log('PeerCrypto::sign msgHash=<',msgHash,'>');
    
    const ec = new jsrsasign.KJUR.crypto.ECDSA({'curve': 'secp256r1'});
    const sigValue = ec.signHex(msgHash, this.keyMaster.prvKeyHex);
    //console.log('PeerCrypto::sign sigValue=<',sigValue,'>');
    msg.signed = {} 
    msg.signed.hash = msgHash;
    msg.signed.val = sigValue;
    return msg;
  }

  verify(msgJson) {
    const now = new Date();
    const msgTs = new Date(msgJson.sign.ts);
    msgTs.setMilliseconds(msgJson.sign.ms)
    const escape_time = now -msgTs;
    //console.log('PeerCrypto::verify escape_time=<',escape_time,'>');
    if(escape_time > iConstMessageOutDateInMs) {
      return false;
    }
    
    const hashMsg = Object.assign({}, msgJson);
    delete hashMsg.signed;

    let msgHash = this.hashMsg_(JSON.stringify(hashMsg));
    //console.log('PeerCrypto::verify msgHash=<',msgHash,'>');
    if(msgHash !== msgJson.signed.hash) {
      console.log('PeerCrypto::verify msgJson=<',msgJson,'>');
      return false;
    }
    //console.log('PeerCrypto::verify msgJson.sign.pubKey=<',msgJson.sign.pubKey,'>');
    const pubKey = base32.decode(msgJson.sign.pubKey,bs32Option);
    //console.log('PeerCrypto::verify pubKey=<',pubKey,'>');
    let pubKeyHex = base32.decode(msgJson.sign.pubKey,bs32Option).toString('hex');
    //console.log('PeerCrypto::verify pubKeyHex=<',pubKeyHex,'>');
    
    const ec = new jsrsasign.KJUR.crypto.ECDSA({'curve': 'secp256r1'});
    const verifyResult = ec.verifyHex(msgJson.signed.hash,msgJson.signed.val,pubKeyHex);
    //console.log('PeerCrypto::verify verifyResult=<',verifyResult,'>');
    return verifyResult;
  }
  calcID(msgJson) {
    let pubKeyHex = base32.decode(msgJson.sign.pubKey,bs32Option).toString('hex');
    return this.hashAddress_(pubKeyHex);
  }
  calcTopic(topic) {
    return this.hashAddress_(topic);
  }
  calcResourceAddress(resourceKey) {
    return this.hashAddress_(resourceKey);
  }
  
  
  
  
  loadKey__(keyJson) {
    //console.log('PeerCrypto::loadKey__ keyJson=<',keyJson,'>');
    const keyJWK = jsrsasign.KEYUTIL.getKey(keyJson);
    //console.log('PeerCrypto::loadKey__ keyJWK=<',keyJWK,'>');
    this.keyMaster = keyJWK;
    this.jwk = keyJson;
  }
  createKey__() {
    const ec = new jsrsasign.KEYUTIL.generateKeypair("EC", "P-256");
    //console.log('PeerCrypto::createKey__ ec=<',ec,'>');
    const jwkPrv1 = jsrsasign.KEYUTIL.getJWKFromKey(ec.prvKeyObj);
    //console.log('PeerCrypto::createKey__ jwkPrv1=<',jwkPrv1,'>');
    this.keyMaster = ec.prvKeyObj;
    this.jwk = jwkPrv1;
  }
  
  
  calcKeyBS32__() {
    const pubKeyBuff = Buffer.from(this.keyMaster.pubKeyHex, 'hex');
    console.log('PeerCrypto::calcKeyBS32__ pubKeyBuff.length =<',pubKeyBuff.length ,'>');
    this.pubBS32 = base32.encode(pubKeyBuff,bs32Option);
    //console.log('PeerCrypto::calcKeyBS32__ this.id =<',this.id ,'>');
    
    const sha512 = Crypto.createHash('sha512');
    sha512.update(this.keyMaster.pubKeyHex);
    const sha512Msg = sha512.digest('hex');
    const keyRipemd = new RIPEMD160().update(sha512Msg).digest('hex');
    const keyBuffer = Buffer.from(keyRipemd,'hex');
    //console.log('PeerCrypto::calcKeyBS32__ keyBuffer =<',keyBuffer ,'>');
    this.idBS32 = base32.encode(keyBuffer,bs32Option);
    this.address = keyBuffer;
  }
  
  hashMsg_(msgStr) {
    const sha512 = Crypto.createHash('sha512');
    sha512.update(msgStr);
    const sha512Msg = sha512.digest('hex')
    return new RIPEMD160().update(sha512Msg).digest('base64');
  }
  hashAddress_(keyHex) {
    const sha512 = Crypto.createHash('sha512');
    sha512.update(keyHex);
    const sha512Msg = sha512.digest('hex');
    const topicRipemd = new RIPEMD160().update(sha512Msg).digest('hex');
    const topicBuffer = Buffer.from(topicRipemd,'hex');
    return base32.encode(topicBuffer,bs32Option);    
  }


}
module.exports = PeerCrypto;
