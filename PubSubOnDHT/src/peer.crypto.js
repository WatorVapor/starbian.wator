'use strict';
const fs = require('fs');
//const jsrsasign = require('jsrsasign');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const Crypto = require('crypto');
const RIPEMD160 = require('ripemd160');
const base32 = require("base32.js");



const iConstMessageOutDateInMs = 1000 * 60;
const bs32Option = { type: "crockford", lc: true };
class PeerCrypto {
  constructor(masterKey,repos) {
    //console.log('PeerCrypto::constructor masterKey=<',masterKey,'>');
    if(masterKey && masterKey.secretKey.length > 0) {
      this.loadKey__(masterKey);
    } else {
      this.createKey__();
    }
    this.calcKeyBS__();
    console.log('PeerCrypto::constructor this.idBS32=<',this.idBS32,'>');
  }
  sign(msg) {
    let now = new Date();
    msg.sign = {};
    msg.sign.ts = now.toGMTString();
    msg.sign.ms = now.getMilliseconds();
    msg.sign.pubKey = this.pubBS64;
    
    let msgHash = this.hashMsg_(JSON.stringify(msg));
    //console.log('PeerCrypto::sign msgHash=<',msgHash,'>');
    const hashUint8Array = nacl.util.decodeBase64(msgHash);
    const signedBuf = nacl.sign(hashUint8Array,this.secretKey);
    const signedMsg = nacl.util.encodeBase64(signedBuf);
    //console.log('PeerCrypto::sign signedMsg=<',signedMsg,'>');
    msg.signed = {} 
    msg.signed.hash = msgHash;
    msg.signed.val = signedMsg;
    console.log('PeerCrypto::sign msg=<',msg,'>');
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
    console.log('PeerCrypto::verify msgJson.sign.pubKey=<',msgJson.sign.pubKey,'>');
    const pubKey = nacl.util.decodeBase64(msgJson.sign.pubKey);
    console.log('PeerCrypto::verify pubKey=<',pubKey,'>');
    const signedMessage = nacl.util.decodeBase64(msgJson.signed.val);
    console.log('PeerCrypto::verify signedMessage=<',signedMessage,'>');
    const verifyBuf = nacl.sign.open(signedMessage,pubKey);
    console.log('PeerCrypto::verify verifyBuf=<',verifyBuf,'>');
    
    /*
    const ec = new jsrsasign.KJUR.crypto.ECDSA({'curve': 'secp256r1'});
    const verifyResult = ec.verifyHex(msgJson.signed.hash,msgJson.signed.val,pubKeyHex);
    //console.log('PeerCrypto::verify verifyResult=<',verifyResult,'>');
    */
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
    console.log('PeerCrypto::loadKey__ keyJson=<',keyJson,'>');
    this.keyMaster = keyJson;
    this.publicKey = base32.decode(keyJson.publicKey);
    console.log('PeerCrypto::loadKey__ this.publicKey=<',this.publicKey,'>');
    this.secretKey = base32.decode(keyJson.secretKey);
    console.log('PeerCrypto::loadKey__ this.secretKey=<',this.secretKey,'>');
  }
  createKey__() {
    const ed = new nacl.sign.keyPair();
    //console.log('PeerCrypto::createKey__ ed=<',ed,'>');
    this.publicKey = ed.publicKey;
    this.secretKey = ed.secretKey;
    this.keyMaster = {};
    const publicBS32 = base32.encode(ed.publicKey,bs32Option);
    const secretBS32 = base32.encode(ed.secretKey,bs32Option);
    this.keyMaster.publicKey = publicBS32;
    this.keyMaster.secretKey = secretBS32;
 }
  
  
  calcKeyBS__() {
    this.pubBS32 = this.keyMaster.publicKey;
    //console.log('PeerCrypto::calcKeyBS__ this.id =<',this.id ,'>');
    this.pubBS64 = nacl.util.encodeBase64(this.publicKey)
    
    const sha512 = Crypto.createHash('sha512');
    sha512.update(this.keyMaster.publicKey);
    const sha512Msg = sha512.digest('hex');
    const keyRipemd = new RIPEMD160().update(sha512Msg).digest('hex');
    const keyBuffer = Buffer.from(keyRipemd,'hex');
    //console.log('PeerCrypto::calcKeyBS__ keyBuffer =<',keyBuffer ,'>');
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
