/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const fs = require('fs');
const crypto = require('crypto');
const SHA3  = require('sha3');
const rs = require('jsrsasign');
const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();
const StarBianP2p = require('./star_bian_p2p');


function buf2hex(buf) {
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}
function hex2buf(str) {
  return Buffer.from(str,'hex');
}

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
    } else {
      this._loadKeyPair();
    }
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
    this._createECDHKey();    
    this.p2p = new StarBianP2p();
    let self = this;
    this.p2p.onReady = () => {
      self.p2p.in(self.pubHex,(msg) => {self._onP2PMsg(self.pubHex,msg)});      
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
    return this.prvHex;
  }
  /**
   * get public key.
   *
   */
  getPublic () {
    return this.pubHex;
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
    let self = this;
    let toBeSaved = {};
    webcrypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign','verify']
    )
    .then(function(key){
      //console.log('_createKeyPair::key=<',key,'>');
      self.key = key;
      webcrypto.subtle.exportKey('jwk',key.privateKey)
      .then(function(keydata){
        //console.log('_createKeyPair privateKey keydata=<' , keydata , '>');
        self.prvKey = keydata;
        self.rsPrvKey = rs.KEYUTIL.getKey(keydata);
        //console.log('_createKeyPair privateKey self.rsPrvKey=<' , self.rsPrvKey , '>');
        self.prvHex = self.rsPrvKey.prvKeyHex;
        toBeSaved.prvKey = keydata;
        if(toBeSaved.pubKey) {
           fs.writeFileSync(self.keyPath_,JSON.stringify(toBeSaved,undefined,2));
        }
      })
      .catch(function(err){
        console.error(err);
      });
      webcrypto.subtle.exportKey('jwk',key.publicKey)
      .then(function(keydata){
        //console.log('_createKeyPair publicKey keydata=<' , keydata , '>');
        self.pubKey = keydata;
        self.rsPubKey = rs.KEYUTIL.getKey(keydata);
        //console.log('_createKeyPair privateKey self.rsPubKey=<' , self.rsPubKey , '>');
        self.pubHex = self.rsPubKey.pubKeyHex;
        this.pubJwk = keydata;
        toBeSaved.pubKey = keydata;
        if(toBeSaved.prvKey) {
           fs.writeFileSync(self.keyPath_,JSON.stringify(toBeSaved,undefined,2));
        }
      })
      .catch(function(err){
        console.error(err);
      });
    })
    .catch(function(err){
      console.error(err);
    });
  }

  /**
   * load key pair.
   *
   * @private
   */
  _loadKeyPair() {
    let keyStr = fs.readFileSync(this.keyPath_, 'utf8');
    let keyJson = JSON.parse(keyStr);
    //console.log('_loadKeyPair::keyJson=<',keyJson,'>');
    this.rsPrvKey = rs.KEYUTIL.getKey(keyJson.prvKey);
    this.prvHex = this.rsPrvKey.prvKeyHex;
    this.rsPubKey = rs.KEYUTIL.getKey(keyJson.pubKey);
    this.pubHex = this.rsPubKey.pubKeyHex;
    this.pubJwk = keyJson.pubKey;
    let self = this;
    webcrypto.subtle.importKey(
      'jwk',
      keyJson.prvKey,
      {
        name: 'ECDSA',
        namedCurve: 'P-256', 
      },
      true, 
      ['sign']
    )
    .then(function(privateKey){
      //console.log('_loadKeyPair:privateKey=<' , privateKey , '>');
      self.prvKey = privateKey;
    })
    .catch(function(err){
      console.error(err);
    });
    webcrypto.subtle.importKey(
      'jwk',
      keyJson.pubKey,
      {
        name: 'ECDSA',
        namedCurve: 'P-256', 
      },
      true, 
      ['verify']
    )
    .then(function(publicKey){
      //console.log('_loadKeyPair:publicKey=<' , publicKey , '>');
      self.pubKey = publicKey;
    })
    .catch(function(err){
      console.error(err);
    });
  }

  /**
   * on channel msg.
   *
   * @param {String} msg 
   * @private
   */
  _onP2PMsg(channel,msg) {
    //console.log('_onP2PMsg::channel=<',channel,'>');
    //console.log('_onP2PMsg::msg=<',msg,'>');
    let authed = this._verifyAuth(msg.auth);
    console.log('_onP2PMsg::authed=<',authed,'>');
    if(!authed) {
      console.log('not authed _onP2PMsg::channel=<',channel,'>');
      console.log('not authed _onP2PMsg::msg=<',msg,'>');
    }
    console.log('_onP2PMsg::msg=<',msg,'>');
    if(msg.ecdh) {
      this._doExchangeKey(msg.ecdh,msg.auth.pubKeyHex);
    }
    if(msg.encrypt) {
      this._onEncryptMsg(msg.encrypt,msg.auth.pubKeyHex);
    }
  }

  _verifyAuth(auth) {
    //console.log('verifyAuth auth=<',auth,'>');
    if(auth) {
      let indexAuthed = this.channel.authed.indexOf(auth.pubKeyHex);
      console.log('_verifyAuth indexAuthed=<',indexAuthed,'>');
      if(indexAuthed === -1) {
        return false;
      }

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
  
  _doExchangeKey(ecdh,remotePubKeyHex) {
    console.log('_doExchangeKey ecdh=<',ecdh,'>');
    if(ecdh.type === 'request') {
      this._tryExchangeKey('response',remotePubKeyHex);
    }
    let self = this;
    webcrypto.subtle.importKey(
      'jwk',
      ecdh.key,
      { name: 'ECDH', namedCurve: 'P-256'},
      false,
      []
    ).then(key => {
      self._onExchangeKey(key);
    })
    .catch(function(err){
      console.error(err);
    });
    
    console.log('_doExchangeKey this.ECDHKey=<',this.ECDHKey,'>');
    console.log('_doExchangeKey this.ECDHKeyPubJwk=<',this.ECDHKeyPubJwk,'>');
  }
  _tryExchangeKey(type,remotePubKeyHex) {
    let ecdh = {
      key:this.ECDHKeyPubJwk,
      type:type,
      ts:new Date()
    };
    let self = this;
    this._signAuth(JSON.stringify(ecdh),function(auth) {
      let sentMsg = {
        channel:remotePubKeyHex,
        auth:auth,
        ecdh:ecdh
      };
      console.log('_tryExchangeKey sentMsg=<' , sentMsg , '>');
      self.p2p.out(remotePubKeyHex,sentMsg);
    });
  }

  _onExchangeKey(remotePubKey) {
    console.log('_onExchangeKey remotePubKey=<' , remotePubKey , '>');
    let self = this;
    webcrypto.subtle.deriveKey( 
      { name: 'ECDH', namedCurve: 'P-256', public: remotePubKey },
      self.ECDHKey.privateKey,
      { name: 'AES-GCM', length: 128 },
      false,
      ['encrypt', 'decrypt']
    ).then(keyAES => {
      console.log('_onExchangeKey keyAES=<' , keyAES , '>');
      self.AESKey = keyAES;
    })
    .catch(function(err){
      console.error(err);
    });
  }

  _createECDHKey () {
    let self =this;
    webcrypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false,
      ['deriveKey','deriveBits']
    )
    .then(function(key){
      self.ECDHKey = key;
      self._exportECDHPubKey(key.publicKey);
    })
    .catch(function(err){
      console.error(err);
    });
  }
  _exportECDHPubKey(pubKey) {
    let self = this;
    webcrypto.subtle.exportKey('jwk', pubKey)
    .then(function(keydata){
      //console.log('_exportECDHPubKey keydata=<' , keydata , '>');
      self.ECDHKeyPubJwk = keydata;
    })
    .catch(function(err){
      console.error(err);
    });
  }


  _signAuth(msg,cb) {
    //console.log('_signAuth msg=<' , msg , '>');
    let self = this;
    webcrypto.subtle.digest("SHA-256",Buffer.from(msg,'hex'))
    .then(function(buf) {
      console.log('_signAuth buf=<' , buf , '>');
      let hash = buf2hex(buf);
      console.log('_signAuth hash=<' , hash , '>');
      let ecSign = new rs.KJUR.crypto.ECDSA({'curve': 'secp256r1'});
      //console.log('_signAuth ecSign=<' , ecSign , '>');
      //console.log('_signAuth self.rsPrvKey=<' , self.rsPrvKey , '>');

      let signEngine = new rs.KJUR.crypto.Signature({alg: 'SHA256withECDSA'});
      signEngine.init({d: self.rsPrvKey.prvKeyHex, curve: 'secp256r1'});
      signEngine.updateString(hash);
      let signatureHex = signEngine.sign();

      let signature = {
        pubKey:self.pubJwk,
        pubKeyHex:self.pubHex,
        hash:hash,
        enc:'hex',
        sign:signatureHex
      };
      cb(signature);
    })
    .catch(function(err){
      console.error(err);
    });
  };

  
  _onEncryptMsg(encrypt,remotePubKeyHex) {
    if(!this.AESKey) {
      return;
    }
    const alg = { 
      name: 'AES-GCM',
      iv: hex2buf(msg.iv)
    };
    /*
    //console.log('_onEncryptMsg:encrypt=<',encrypt,'>');
    let self = this;
    this.decrypt(encrypt,function(plainMsg) {
      //console.log('_onEncryptMsg:typeof plainMsg=<',typeof plainMsg,'>');
      if(plainMsg) {
        if(typeof plainMsg === 'string') {
          self.onGoodMessage_(JSON.parse(plainMsg));
        } else {
          self.onGoodMessage_(plainMsg);
        }
      } else {
        console.log('_onEncryptMsg:plainMsg=<',plainMsg,'>');
      }
    });
    */
  }
  
}

module.exports = StarBian;
