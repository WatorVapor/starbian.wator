/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const fs = require('fs');
const crypto = require('crypto');
const rs = require('jsrsasign');
const bs58 = require('bs58');
const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();
const StarBianP2p = require('./star_bian_p2p');
const StarBianCrypto = require('./star_bian_crypto.js');


class StarBianInner {
  /**
   * Create a new `StarBianInner`.
   *
   */
  constructor (keyChannel_ ) {
    this.crypto_ = new StarBianCrypto();    
    this.p2p_ = new StarBianP2p();
    this.remoteChannel_ = keyChannel_;
    let self = this;
    this.p2p_.onReady = () => {
      self.p2p_.in(self.crypto_.pubKeyB58,(msg,channel,from) => {
        self._onP2PMsg(msg,channel,from)
      });
      if(typeof self.onReady === 'function') {
        self.onReady();
      }
    };
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
    this.crypto_._encrypt(JSON.stringify(msg),function(encrypt) {
      //console.log('publish:encrypt=<',encrypt,'>');
      self.crypto_._signAuth(JSON.stringify(encrypt),function(auth) {
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
   * on channel msg.
   *
   * @param {String} msg 
   * @private
   */
  _onP2PMsg(msg,channel,from) {
    //console.log('_onP2PMsg::channel=<',channel,'>');
    //console.log('_onP2PMsg::msg=<',msg,'>');
    //console.log('_onP2PMsg::from=<',from,'>');
    if(channel !== this.remoteChannel_) {
      console.warn('_onP2PMsg:: !!!not in my eye!!! channel=<',channel,'>');
      console.warn('_onP2PMsg:: !!!not in my eye!!! this.remoteChannel_=<',this.remoteChannel_,'>');
      console.warn('_onP2PMsg:: !!!not in my eye!!! msg=<',msg,'>');
      return;
    }
    let self = this;
    let content = msg.encrypt || msg.ecdh || msg.subscribe || msg.broadcast;
    this.crypto_._verifyAuth(msg.auth,content,channel,() => {
      //console.log('_onP2PMsg::msg=<',msg,'>');
      if(msg.ecdh) {
        self._doExchangeKey(msg.ecdh,msg.auth.pubKeyB58);
      }
      if(msg.encrypt) {
        self._onEncryptedMsg(msg.encrypt,msg.auth.pubKeyB58);
      }
    });
  }



  _tryExchangeKey(type,remotePubKey) {
    let ecdh = {
      key:this.crypto_.ECDHKeyPubJwk,
      type:type,
      ts:new Date()
    };
    let self = this;
    this.crypto_._signAuth(JSON.stringify(ecdh),function(auth) {
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
    this.crypto_._exchangeKey(ecdh,remotePubKey);
  }

  _onEncryptedMsg(msg,remotePubKeyHex) {
    let self = this;
    this.crypto_._exchangeKey(msg,(plainMsg) => {
      if(typeof self.callback_ === 'function') {
        self.callback_(plainMsg,remotePubKeyHex);
      }
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
