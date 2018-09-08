/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';

const StarBianPeer = require('./StarBianPeer');

class StarBianBroadcast {
  /**
   * Create a new `StarBianBroadcast`.
   *
   */
  constructor () {
    this.peer_ = new StarBianPeer('broadcast');
    this.peer_.onReady = () => {
      if(typeof this.onReady === 'function') {
        this.onReady();
      }
    };
  }
  /**
   * broadcast public key with one time password.
   *
   */
  broadcastPubKey(cb) {
    this.inner_.broadcastPubKey(cb);
  }
  /**
   * subscribe.
   * @param {string} password
   * @param {Function} callback 
   */
  listenPubKey(password,callback) {
    this.inner_.subscribe_broadcast(callback);
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


module.exports = StarBianBroadcast;
