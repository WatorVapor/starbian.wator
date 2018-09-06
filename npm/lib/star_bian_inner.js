/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const fs = require('fs');
const crypto = require('crypto');
const rs = require('jsrsasign');
const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();
const StarBianP2p = require('./star_bian_p2p');
const bs58 = require('bs58');

/*
function buf2hex(buf) {
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}

function hex2buf(str) {
  return Buffer.from(str,'hex');
}

function ab2hex(array_buff) {
  //console.log('ab2hex:array_buff=<',array_buff,'>');
  let u8ab = new Uint8Array(array_buff);
  //console.log('ab2hex:u8ab=<',u8ab,'>');
  let buffer = Buffer.from(u8ab,'binary');
  let hex = buffer.toString('hex');
  //console.log('ab2hex:hex=<',hex,'>');
  return hex;
}

function ab2utf8(array_buff) {
  let u8ab = new Uint8Array(array_buff,'binary');
  let buffer = Buffer.from(u8ab);
  return buffer.toString('utf8');
}
*/

class StarBianInner {
  /**
   * Create a new `StarBianInner`.
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
    this._loadChannel();
    this._createECDHKey();    
    this.p2p_ = new StarBianP2p();
    let self = this;
    this.p2p_.onReady = () => {
      self.p2p_.in(self.pubKeyB58,(msg,channel,from) => {self._onP2PMsg(msg,channel,from)});
      if(typeof self.onReady === 'function') {
        self.onReady(self.prvHex,self.pubKeyB58,self.channel.authed);
      }
    };
  }
  addAuthedKey (key) {
    this.channel.authed.push(key);
    let saveChannel = JSON.stringify(this.channel,null, 2);
    fs.writeFileSync(this.channelPath_,saveChannel);
  }
  /**
   * broadcast public key with one time password.
   *
   */
  broadcastPubKey (cb) {
    this.sharePubKeyCounter = 10;
    this.OneTimePassword_ = Math.floor(Math.random()*(9999-1111)+1111);
    this.OneTimeCB_ = cb;
    let self = this;
    setTimeout(function() {
      self.OneTimeCB_(self.sharePubKeyCounter,self.OneTimePassword_);
      self.sharePubKeyTimeOut_();
    },0);
  }
  
  /**
   * publish a messege.
   *
   * @param {String} msg 
   * @param {String} channel 
   */
  publish(msg,channel) {
    //console.log('publish:msg =<',msg,'>');
    //console.log('publish:channel =<',channel,'>');
    let self = this;
    this._encrypt(JSON.stringify(msg),function(encrypt) {
      //console.log('publish:encrypt=<',encrypt,'>');
      self._signAuth(JSON.stringify(encrypt),function(auth) {
        let sentMsg = {
          channel:channel,
          auth:auth,
          encrypt:encrypt
        };
        //console.log('publish:sentMsg=<',sentMsg,'>');
        self.p2p_.out(channel ,sentMsg);
      });
    });
  }
  /**
   * subscribe.
   *
   * @param {Function} callback 
   */
  subscribe(callback) {
    this.callback_ = callback;
  }
  /**
   * subscribe.
   *
   * @param {Function} callback 
   */
  subscribe_broadcast(callback) {
    this.bc_callback_ = callback;
  }
  
  /**
   * pass through a messege.
   *
   * @param {String} msg 
   */
  passthrough(channel,msg) {
    //console.log('passthrough:msg =<',msg,'>');
    this.p2p_.out(channel ,msg);
  }
  /**
   * subscribe_passthrough.
   *
   * @param {String} channel 
   * @param {Function} callback 
   */
  subscribe_passthrough(channel,callback) {
    console.log('subscribe channel =<',channel,'>');
    this.p2p_.in(channel ,callback);
  }  
  /**
   * subscribe_passthrough_broadcast.
   *
   * @param {Function} callback 
   */
  subscribe_passthrough_broadcast(callback) {
    this.pt_bc_callback_ = callback;
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
        let keyBuffer = Buffer.from(self.rsPubKey.pubKeyHex,'hex');
        self.pubKeyB58 = bs58.encode(keyBuffer);
        self.pubJwk = keydata;
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
    let keyBuffer = Buffer.from(this.rsPubKey.pubKeyHex,'hex');
    this.pubKeyB58 = bs58.encode(keyBuffer);
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
   * _loadChannel.
   *
   * @private
   */
  _loadChannel() {
    //console.log('StarBian constructor:this.p2p_=<',this.p2p_,'>');
    this.channelPath_ = 'channels.json';
    if(fs.existsSync(this.channelPath_)) {
      let channelStr = fs.readFileSync(this.channelPath_, 'utf8');
      this.channel = JSON.parse(channelStr);
      this.channel.myself = this.pubKeyB58;
      let saveChannel = JSON.stringify(this.channel,null, 2);
      fs.writeFileSync(this.channelPath_,saveChannel);
    } else {
      this.channel = {};
      this.channel.myself = this.pubKeyB58;
      this.channel.authed = [];
      let saveChannel = JSON.stringify(this.channel,null, 2);
      fs.writeFileSync(this.channelPath_,saveChannel);
    }
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
  
  
  /**
   * on channel msg.
   *
   * @param {String} msg 
   * @private
   */
  _onP2PMsg(msg,channel,from) {
    //console.log('_onP2PMsg::channel=<',channel,'>');
    console.log('_onP2PMsg::msg=<',msg,'>');
    //console.log('_onP2PMsg::from=<',from,'>');
    let self = this;
    let content = msg.encrypt || msg.ecdh || msg.subscribe || msg.broadcast;
    if(channel === 'broadcast') {
      this._verifyAuth(msg.auth,content,channel,() => {
        if(typeof self.pt_bc_callback_ === 'function') {
          self.pt_bc_callback_(msg,channel,from);
        }
        if(typeof self.bc_callback_ === 'function') {
          self.bc_callback_(msg,channel);
        }
      });
      return;
    }
    this._verifyAuth(msg.auth,content,channel,() => {
      //console.log('_onP2PMsg::msg=<',msg,'>');
      if(msg.ecdh) {
        self._doExchangeKey(msg.ecdh,msg.auth.pubKeyB58);
      }
      if(msg.encrypt) {
        self._onEncryptedMsg(msg.encrypt,msg.auth.pubKeyB58);
      }
    });
  }

  _verifyAuth(auth,content,channel,cb) {
    //console.log('verifyAuth auth=<',auth,'>');
    if(auth) {
      console.log('verifyAuth content=<',content,'>');
      let self = this;
      webcrypto.subtle.digest("SHA-256",Buffer.from(JSON.stringify(content),'utf8'))
      .then(function(buf) {
        //console.log('_verifyAuth buf=<' , buf , '>');
        let hashCal = Buffer.from(buf).toString('base64');
        //console.log('_verifyAuth hashCal=<' , hashCal , '>');
        //console.log('_verifyAuth auth.hash=<' , auth.hash , '>');
        if(auth.hash !== hashCal) {
          console.log('_verifyAuth not authed !!! hashCal=<',hashCal,'>');
          console.log('_verifyAuth not authed !!! auth.hash=<',auth.hash,'>');
          return;
        }
        let indexAuthed = self.channel.authed.indexOf(auth.pubKeyB58);
        if(indexAuthed === -1 && channel !== 'broadcast') {
          console.log('_verifyAuth not authed !!! indexAuthed=<',indexAuthed,'>');
          console.log('_verifyAuth not authed !!! channel=<',channel,'>');
          return;
        }
        self._bs58Key2RsKey(auth.pubKeyB58,(pubKey) => {
          if(!pubKey) {
            console.log('verifyAuth not authed !!! pubKey=<',pubKey,'>');
            return;
          }
          let signEngine = new rs.KJUR.crypto.Signature({alg: 'SHA256withECDSA'});
          signEngine.init({xy: pubKey.pubKeyHex, curve: 'secp256r1'});
          signEngine.updateString(auth.hash);
          //console.log('verifyAuth signEngine=<',signEngine,'>');
          let result = signEngine.verify(auth.sign);
          if(result) {
            cb();
          } else {
            console.log('verifyAuth not authed !!! result=<',result,'>');
          }
        });
      })
      .catch(function(err){
        console.error(err);
      });
    } else {
      console.log('_verifyAuth not authed !!! content=<',content,'>');
      console.log('_verifyAuth not authed !!! auth =<',auth,'>');
    }
  }

  _bs58Key2RsKey(bs58Key,cb) {
    //console.log('Bs58Key2RsKey bs58Key=<',bs58Key,'>');
    const pubKeyBuff = bs58.decode(bs58Key);
    //console.log('Bs58Key2RsKey pubKeyBuff=<',pubKeyBuff,'>');  
    webcrypto.subtle.importKey(
      'raw',
      pubKeyBuff,
      {
        name: 'ECDSA',
        namedCurve: 'P-256', 
      },
      true, 
      ['verify']
    )
    .then(function(pubKey){
      //console.log('Bs58Key2RsKey:pubKey=<' , pubKey , '>');
      webcrypto.subtle.exportKey('jwk', pubKey)
      .then(function(keydata){
        //console.log('Bs58Key2RsKey keydata=<' , keydata , '>');
        let rsKey = rs.KEYUTIL.getKey(keydata);	
        //console.log('Bs58Key2RsKey rsKey=<',rsKey,'>');
        cb(rsKey);
      })
      .catch(function(err){
        console.error(err);
      });
    })
    .catch(function(err){
      console.error(err);
    });
  }


  _tryExchangeKey(type,remotePubKey) {
    let ecdh = {
      key:this.ECDHKeyPubJwk,
      type:type,
      ts:new Date()
    };
    let self = this;
    this._signAuth(JSON.stringify(ecdh),function(auth) {
      let sentMsg = {
        channel:remotePubKey,
        auth:auth,
        ecdh:ecdh
      };
      //console.log('_tryExchangeKey sentMsg=<' , sentMsg , '>');
      self.p2p_.out(remotePubKey,sentMsg);
    });
  }
  
  _doExchangeKey(ecdh,remotePubKey) {
    //console.log('_doExchangeKey ecdh=<',ecdh,'>');
    if(ecdh.type === 'request') {
      this._tryExchangeKey('response',remotePubKey);
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
  }

  _onExchangeKey(remotePubKey) {
    //console.log('_onExchangeKey remotePubKey=<' , remotePubKey , '>');
    let self = this;
    webcrypto.subtle.deriveKey( 
      { name: 'ECDH', namedCurve: 'P-256', public: remotePubKey },
      self.ECDHKey.privateKey,
      { name: 'AES-GCM', length: 128 },
      false,
      ['encrypt', 'decrypt']
    ).then(keyAES => {
      //console.log('_onExchangeKey keyAES=<' , keyAES , '>');
      self.AESKey = keyAES;
    })
    .catch(function(err){
      console.error(err);
    });
  }

  _signAuth(msg,cb) {
    //console.log('_signAuth msg=<' , msg , '>');
    let self = this;
    webcrypto.subtle.digest("SHA-256",Buffer.from(msg,'utf8'))
    .then(function(buf) {
      //console.log('_signAuth buf=<' , buf , '>');
      let hash = Buffer.from(buf).toString('base64');
      //console.log('_signAuth hash=<' , hash , '>');
      let ecSign = new rs.KJUR.crypto.ECDSA({'curve': 'secp256r1'});
      //console.log('_signAuth ecSign=<' , ecSign , '>');
      //console.log('_signAuth self.rsPrvKey=<' , self.rsPrvKey , '>');

      let signEngine = new rs.KJUR.crypto.Signature({alg: 'SHA256withECDSA'});
      signEngine.init({d: self.rsPrvKey.prvKeyHex, curve: 'secp256r1'});
      signEngine.updateString(hash);
      let signatureHex = signEngine.sign();
      let signature = {
        pubKey:self.pubJwk,
        pubKeyB58:self.pubKeyB58,
        hash:hash,
        sign:signatureHex
      };
      cb(signature);
    })
    .catch(function(err){
      console.error(err);
    });
  };

  
  _onEncryptedMsg(msg,remotePubKeyHex) {
    if(!this.AESKey) {
      console.log('_onEncryptedMsg this.AESKey=<' , this.AESKey , '>');
      return;
    }
    let iv = Buffer.from(msg.iv,'base64');
    //console.log('_onEncryptedMsg iv=<' , iv , '>');
    const alg = { 
      name: 'AES-GCM',
      iv: iv
    };
    const ptUint8 = Buffer.from(msg.encrypt,'base64');
    //console.log('_onEncryptedMsg ptUint8=<' , ptUint8 , '>');
    let self = this;
    webcrypto.subtle.decrypt( 
      alg,
      this.AESKey,
      ptUint8
    ).then(plainBuff => {
      //console.log('_onEncryptedMsg plainBuff=<' , plainBuff , '>');
      let plainText = Buffer.from(plainBuff).toString('utf8');
      //console.log('_onEncryptedMsg plainText=<' , plainText , '>');
      let plainJson = JSON.parse(plainText);
      //console.log('_onEncryptedMsg plainJson=<' , plainJson , '>');
      //console.log('_onEncryptedMsg self.callback_=<' , self.callback_ , '>');
      if(typeof self.callback_ === 'function') {
        self.callback_(plainJson,remotePubKeyHex);
      }
    })
    .catch(function(err){
      console.error(err);
    });
  }

  _encrypt(msg,cb) {
    if(!this.AESKey) {
      return;
    }
    //console.log('_encrypt msg=<' , msg , '>');
    //console.log('_encrypt this.AESKey=<' , this.AESKey , '>');
    let iv_in = new Uint8Array(12);
    let iv = webcrypto.getRandomValues(iv_in);
    //console.log('_encrypt iv_in=<' , iv_in , '>');
    //console.log('_encrypt iv=<' , iv , '>');
    const alg = { 
      name: 'AES-GCM',
      iv: iv
    };
    const ptUint8 = Buffer.from(msg,'utf8');
    //console.log('_encrypt ptUint8=<' , ptUint8 , '>');
    webcrypto.subtle.encrypt( 
      alg,
      this.AESKey,
      ptUint8
    ).then( enMsg => {
      //console.log('_encrypt enMsg=<' , enMsg , '>');
      let enObj = {
        iv:Buffer.from(iv).toString('base64'),
        encrypt:Buffer.from(enMsg).toString('base64')
      };
      cb(enObj);
    })
    .catch(function(err){
      console.error(err);
    });
  }

  sharePubKeyTimeOut_(cb) {
    this.sharePubKeyInside_();
    this.OneTimeCB_(this.sharePubKeyCounter,this.OneTimePassword_);
    this.sharePubKeyCounter--;
    if(this.sharePubKeyCounter >= 0) {
      let self = this;
      setTimeout(function() {
        self.sharePubKeyTimeOut_(cb);
      },10000);
    }
  }
  
  sharePubKeyInside_() {	
    console.log('sharePubKeyInside_:this.pubKeyB58=<',this.pubKeyB58,'>');	
    if(!this.pubKeyB58) {	
      return;	
    } 	
    let shareKey = {
      ts: new Date(),
      pubkey:this.pubKeyB58,
      password:this.OneTimePassword_
    };
    let self = this;
    this._signAuth(JSON.stringify(shareKey),function(auth) {	
      let sentMsg = {	
        channel:'broadcast',	
        auth:auth,
        shareKey:shareKey	
      };
      console.log('sharePubKeyInside_:JSON.stringify(shareKey)=<' , JSON.stringify(shareKey) , '>');
      self.p2p_.out('broadcast',sentMsg);
    });	
  }
  
}

module.exports = StarBianInner;
