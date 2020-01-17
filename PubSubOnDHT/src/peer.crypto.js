'use strict';
const fs = require('fs');
const jsrsasign = require('jsrsasign');
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
    //console.log('PeerCrypto::constructor this.pubBS32=<',this.pubBS32,'>');
    //console.log('PeerCrypto::constructor this.idBS32=<',this.idBS32,'>');
  }
  sign(msg) {
    let now = new Date();
    msg.sign = {};
    msg.sign.ts = now.toGMTString();
    msg.sign.ms = now.getMilliseconds();
    msg.sign.pubKey = this.pubBS32;
    
    let msgStr = JSON.stringify(msg);
    let msgHash = new RIPEMD160().update(msgStr).digest('hex');
    //console.log('PeerCrypto::sign msgHash=<',msgHash,'>');
    let sign = {hash:msgHash};
    
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

    let msgStr = JSON.stringify(hashMsg);
    let msgHash = new RIPEMD160().update(msgStr).digest('hex');
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
    const pubKeyHex = base32.decode(msgJson.sign.pubKey,bs32Option).toString('hex');
    const keyRipemd = new RIPEMD160().update(pubKeyHex).digest('hex');
    const keyBuffer = Buffer.from(keyRipemd,'hex');
    return base32.encode(keyBuffer,bs32Option);
  }
  calcTopic(topic) {
    const topicRipemd = new RIPEMD160().update(topic).digest('hex');
    const topicBuffer = Buffer.from(topicRipemd,'hex');
    return base32.encode(topicBuffer,bs32Option);
  }
  calcResourceAddress(resourceKey) {
    const resourceRipemd = new RIPEMD160().update(resourceKey).digest('hex');
    const resourceBuffer = Buffer.from(resourceRipemd,'hex');
    return base32.encode(resourceBuffer,bs32Option);
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
    this.pubBS32 = base32.encode(pubKeyBuff,bs32Option);
    //console.log('PeerCrypto::calcKeyBS32__ this.id =<',this.id ,'>');
    const keyRipemd = new RIPEMD160().update(this.keyMaster.pubKeyHex).digest('hex');
    const keyBuffer = Buffer.from(keyRipemd,'hex');
    //console.log('PeerCrypto::calcKeyBS32__ keyBuffer =<',keyBuffer ,'>');
    this.idBS32 = base32.encode(keyBuffer,bs32Option);
    this.address = keyBuffer;
  }
}
module.exports = PeerCrypto;
