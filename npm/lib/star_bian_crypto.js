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
const bs58 = require('bs58');


class StarBianCrypto {
  /**
   * Create a new `StarBianCrypto`.
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
    this.myChannelPath_ = './myChannel.json';
    this.channelPath_ = './authedChannels.json';
    this._loadChannel();
    this._createECDHKey();
    setInterval(this._watchChannel.bind(this),10*1000);
  }
  /**
   * add authed public key.
   * @param {String} key 
   *
   */
  addAuthedKey (key) {
    this.channel.authed.push(key);
    let saveChannel = JSON.stringify(this.channel,null, 2);
    fs.writeFileSync(this.channelPath_,saveChannel);
  }

  
  /**
   * create key pair.
   *
   * @private
   */
  _createKeyPair() {
    const ecKeypair = rs.KEYUTIL.generateKeypair("EC", "P-256");
    //console.log('_createKeyPair::ecKeypair=<',ecKeypair,'>');
    let prvKey = rs.KEYUTIL.getJWKFromKey(ecKeypair.prvKeyObj);
    //console.log('_createKeyPair::prvKey=<',prvKey,'>');
    this.prvKey = prvKey;
    this.rsPrvKey = ecKeypair.prvKeyObj;
    this.prvHex = ecKeypair.prvKeyObj.prvKeyHex;
    let pubKey = rs.KEYUTIL.getJWKFromKey(ecKeypair.pubKeyObj);
    //console.log('_createKeyPair::pubKey=<',pubKey,'>');
    let toBeSaved = {
      prvKey:prvKey,
      pubKey:pubKey
    };
    let keyBuffer = Buffer.from(ecKeypair.pubKeyObj.pubKeyHex,'hex');
    this.pubKeyB58 = bs58.encode(keyBuffer);
    this.pubKey = pubKey;
    this.pubJwk = pubKey;
    this.rsPubKey = ecKeypair.pubKeyObj;
    fs.writeFileSync(this.keyPath_,JSON.stringify(toBeSaved,undefined,2));
    this.onKeyReadyOne_();
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
      self.onKeyReadyOne_();
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
      self.onKeyReadyOne_();
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
    fs.writeFileSync(this.myChannelPath_,this.pubKeyB58);
    if(fs.existsSync(this.channelPath_)) {
      let channelStr = fs.readFileSync(this.channelPath_, 'utf8');
      this.channel = JSON.parse(channelStr);
      let saveChannel = JSON.stringify(this.channel,null, 2);
      fs.writeFileSync(this.channelPath_,saveChannel);
    } else {
      this.channel = {authed:[]};
      let saveChannel = JSON.stringify(this.channel,null, 2);
      fs.writeFileSync(this.channelPath_,saveChannel);
    }
    this.onKeyReadyOne_();
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
      self.onKeyReadyOne_();
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
      self.onKeyReadyOne_();
    })
    .catch(function(err){
      console.error(err);
    });
  }
  onKeyReadyOne_() {
    //console.log('onKeyReadyOne_::this.channel=<',this.channel,'>');
    //console.log('onKeyReadyOne_::this.pubKey=<',this.pubKey,'>');
    //console.log('onKeyReadyOne_::this.prvKey=<',this.prvKey,'>');
    //console.log('onKeyReadyOne_::this.ECDHKey=<',this.ECDHKey,'>');
    //console.log('onKeyReadyOne_::this.ECDHKeyPubJwk=<',this.ECDHKeyPubJwk,'>');
    if(!this.channel) {
      return;
    }
    if(!this.pubKeyB58) {
      return;
    }
    if(!this.prvHex) {
      return;
    }
    if(!this.ECDHKey) {
      return;
    }
    if(!this.ECDHKeyPubJwk) {
      return;
    }
    //console.log('onKeyReadyOne_::this.onKeyReady=<',this.onKeyReady,'>');
    if(typeof this.onKeyReady === 'function') {
      this.onKeyReady(this.prvHex,this.pubKeyB58,this.channel.authed);
    }
  }

  _verifyAuth(auth,content,channel,cb) {
    let indexAuthed = this.channel.authed.indexOf(auth.pubKeyB58);
    if(indexAuthed === -1 && channel !== 'broadcast') {
      console.log('_verifyAuth not authed !!! indexAuthed=<',indexAuthed,'>');
      console.log('_verifyAuth not authed !!! channel=<',channel,'>');
      return;
    }
    this._verifyAuthCore(auth,content,cb);
  }
  
  _verifyAuthCore(auth,content,cb) {
    //console.log('verifyAuth auth=<',auth,'>');
    if(auth) {
      //console.log('verifyAuth content=<',content,'>');
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

  _exchangeKey(ecdh,remotePubKey) {
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

  _decrypt(msg,cb) {
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
      if(typeof cb=== 'function') {
        cb(plainJson);
      }
    })
    .catch(function(err){
      console.error(err);
    });
  }


  miningAuth(msg,cb) {
    //console.log('signAuth msg=<' , msg , '>');
    let self = this;
    webcrypto.subtle.digest("SHA-256", Buffer.from(msg,'utf8'))
    .then(function(buf) {
      let hash = Buffer.from(buf).toString('base64');
      //console.log('signAuth hash=<' , hash , '>');
      let ecSign = new rs.KJUR.crypto.ECDSA({'curve': 'secp256r1'});
      //console.log('signAuth ecSign=<' , ecSign , '>');
      //console.log('signAuth self.prvKeyHex=<' , self.prvKeyHex , '>');
      let signEngine = new rs.KJUR.crypto.Signature({alg: 'SHA256withECDSA'});
      signEngine.init({d: self.rsPrvKey.prvKeyHex, curve: 'secp256r1'});
      signEngine.updateString(hash);
      let signatureHex = signEngine.sign();
      //console.log('signAuth signatureHex=<' , signatureHex , '>');
      let hashSign = rs.KJUR.crypto.Util.sha256(signatureHex);
      let signature = {
        pubKeyB58:self.pubKeyB58,
        hash:hash,
        sign:signatureHex,
        hashSign:hashSign
      };
      cb(signature);
    })
    .catch(function(err){
      console.error(err);
    });
  }
  
  
  
  signAssist(auth,cb) {
    //console.log('signAssist auth=<' , auth , '>');
    let now = new Date();
    let ts = now.toISOString();
    let msgJson = {orig:auth.hash,ts:ts};
    let msg = JSON.stringify(msgJson);
    let self = this;
    webcrypto.subtle.digest("SHA-256", Buffer.from(msg,'utf8'))
    .then(function(buf) {
      let hash = Buffer.from(buf).toString('base64');
      //console.log('signAssist hash=<' , hash , '>');
      let ecSign = new rs.KJUR.crypto.ECDSA({'curve': 'secp256r1'});
      //console.log('signAssist ecSign=<' , ecSign , '>');
      //console.log('signAssist self.prvKeyHex=<' , self.prvKeyHex , '>');
      let signEngine = new rs.KJUR.crypto.Signature({alg: 'SHA256withECDSA'});
      signEngine.init({d: self.rsPrvKey.prvKeyHex, curve: 'secp256r1'});
      signEngine.updateString(hash);
      let signatureHex = signEngine.sign();
      //console.log('signAssist signatureHex=<' , signatureHex , '>');
      let hashSign = rs.KJUR.crypto.Util.sha256(signatureHex);
      let signature = {
        pubKeyB58:self.pubKeyB58,
        hash:hash,
        orig:msgJson,
        sign:signatureHex,
        hashSign:hashSign
      };
      cb(signature);
    })
    .catch(function(err){
      console.error(err);
    });
  }  
  

  verifyAssist(assist,cb) {
    //console.log('verifyAssist assist=<' , assist ,'>');
    let self = this;
    webcrypto.subtle.digest("SHA-256", Buffer.from(JSON.stringify(assist.orig),'utf8'))
    .then(function(buf){
      let hashCal = Buffer.from(buf).toString('base64');
      if(hashCal !== assist.hash) {
        console.log('verifyAssist  not authed !!! hashCal=<' , hashCal , '>');
        console.log('verifyAssist  not authed !!! assist.hash=<' , assist.hash , '>');
        console.log('verifyAssist: not authed !!! assist.orig=<',assist.orig,'>');
      } else {
        self._bs58Key2RsKey(assist.pubKeyB58,(pubKey) => {
          //console.log('verifyAssist pubKey=<' , pubKey , '>');
          let signEngine = new rs.KJUR.crypto.Signature({alg: 'SHA256withECDSA'});
          signEngine.init({xy: pubKey.pubKeyHex, curve: 'secp256r1'});
          signEngine.updateString(assist.hash);
          let result = signEngine.verify(assist.sign);
          if(result) {
            cb(result);
          } else {
            console.log('verifyAssist not authed !!! result=<' , result , '>');
            console.log('verifyAssist not authed !!! assist=<' , assist , '>');
          }
        });
      }
    })
    .catch(function(err){
      console.error(err);
    });
  }
  
  _watchChannel() {
    //console.log('_watchChannel this=<' , this , '>');
    if(fs.existsSync(this.channelPath_)) {
      try {
        let channelStr = fs.readFileSync(this.channelPath_, 'utf8');
        let channelJson = JSON.parse(channelStr);
        //console.log('_watchChannel channelJson=<' , channelJson , '>');
        let diff = this._diffJsonArray(channelJson.authed,this.channel.authed );
        //console.log('_watchChannel diff=<' , diff , '>');
        if(diff.length > 0) {
          //console.log('_watchChannel typeof this.onAddChannel=<' , typeof this.onAddChannel , '>');
          if(typeof this.onAddChannel === 'function') {
            this.onAddChannel(diff);
          }
        }
        let diff2 = this._diffJsonArray(this.channel.authed,channelJson.authed);
        //console.log('_watchChannel diff2=<' , diff2 , '>');
        if(diff2.length > 0) {
          //console.log('_watchChannel typeof this.onRemoveChannel=<' , typeof this.onRemoveChannel , '>');
          if(typeof this.onRemoveChannel === 'function') {
            this.onRemoveChannel(diff2);
          }
        }
        this.channel = channelJson;
      } catch(e) {
        console.error('_watchChannel channelStr=<' , channelStr , '>');
        console.error('_watchChannel e=<' , e , '>');
      }      
    }
  }
  _diffJsonArray(aJson,bJson) {
    let diff = [];
    //console.log('_diffJsonArray aJson=<' , aJson , '>');
    //console.log('_diffJsonArray bJson=<' , bJson , '>');
    //console.log('_diffJsonArray aJson-bJson=<' , aJson-bJson , '>');
    for(let i = 0;i < aJson.length;i++) {
      let a = aJson[i];
      //console.log('_diffJsonArray a=<' , a , '>');
      let hint = bJson.indexOf(a);
      //console.log('_diffJsonArray hint=<' , hint , '>');
      if(hint === -1) {
        diff.push(a);
      }
    }
    return diff;
  }
}

module.exports = StarBianCrypto;
