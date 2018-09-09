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
   * sendThough a messege.
   *
   * @param {String} msg 
   * @param {String} channel 
   */
  sendThough(msg,channel) {
    this.p2p_.out(channel ,msg);
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
    if(msg && msg.auth && msg.auth.pubKeyB58 !== this.remoteChannel_ && this.remoteChannel_ !== 'broadcast') {
      console.warn('_onP2PMsg:: !!!not in my eye!!! from=<',from,'>');
      console.warn('_onP2PMsg:: !!!not in my eye!!! this.remoteChannel_=<',this.remoteChannel_,'>');
      console.warn('_onP2PMsg:: !!!not in my eye!!! msg=<',msg,'>');
      return;
    }
    let self = this;
    let content = msg.encrypt || msg.ecdh || msg.subscribe || msg.broadcast;
    this.crypto_._verifyAuthCore(msg.auth,content,() => {
      console.log('_onP2PMsg::msg=<',msg,'>');
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
    this.crypto_._decrypt(msg,(plainMsg) => {
      if(typeof self.callback_ === 'function') {
        self.callback_(plainMsg,remotePubKeyHex);
      }
    });
  }
  
}

module.exports = StarBianInner;
