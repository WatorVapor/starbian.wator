/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';

const StarBianPeer = require('./StarBianPeer');
const StarBianCrypto = require('./star_bian_crypto');


class StarBianBroadcast {
  /**
   * Create a new `StarBianBroadcast`.
   *
   */
  constructor () {
    this.SHARE_PUBKEY_DIFFCULTY = '0';
    this.cast_ = new StarBianPeer('broadcast');
    this.crypto_ = new StarBianCrypto();
    this.cast_.onReady = () => {
      if(typeof this.onReady === 'function') {
        this.onReady();
      }
    };
    this.cast_.subscribe( (msg) => {
      self.onBroadCast_(msg)
    });
  }
  /**
   * broadcast public key with one time password.
   *
   */
  broadcastPubKey(cb) {
    this.sharePubKeyCounter = 10;
    this.OneTimeCB_ = cb;
    let self = this;
    this.sharePubKeyMining_((finnish) => {
      if(finnish) {
        self.OneTimeCB_(self.sharePubKeyCounter,self.OneTimePassword_);
        self.sharePubKeyTimeOutPreStage_();
      } else {
        self.OneTimeCB_(10,'-----');
      }
    });
  }
  /**
   * subscribe.
   * @param {string} password
   * @param {Function} cb 
   */
  listenPubKey(password,cb) {
    this.targetPubKeyPassword_ = password;
    this.targetPubKeyCallback_ = cb;
  }

  // private
  onBroadCast_(msg) {
    console.log('StarBianBroadcastt onBroadCast_:: msg=<',msg,'>');
    if(msg.broadcast && msg.broadcast.pubkey) {
      this.onShareKey_(msg.broadcast,msg.auth,msg.assist);
    }
  }

  // private..
  sharePubKeyTimeOutPreStage_(cb) {
    this.sharePubKeyInsidePreStage_();
  }
  sharePubKeyTimeOut_(cb) {
    this.sharePubKeyInside_();
    if(typeof this.OneTimeCB_ === 'function') {
      this.OneTimeCB_(this.sharePubKeyCounter);
      this.sharePubKeyCounter--;
      if(this.sharePubKeyCounter >= 0) {
        let self = this;
        setTimeout(function() {
          self.sharePubKeyTimeOut_(cb);
        },10000);
      } else {
        this.OneTimeCB_ = false;
      }
    }
  }
  sharePubKeyTimeOutPreStage_() {	
    this.cast_.sendThough_(this.sharedKeyMsgPreStage);
  }
  sharePubKeyInside_() {
    this.cast_.sendThough_(this.sharedKeyMsg);
  }
  
  sharePubKeyMining_(cb) {	
    console.log('sharePubKeyMining_:this.crypto_.pubKeyB58=<',this.crypto_.pubKeyB58,'>');	
    if(!this.crypto_.pubKeyB58) {	
      return;	
    }
    let self = this;
    let now = new Date();
    let ts = now.toISOString();
    this.OneTimePassword_ = Math.floor(Math.random()*(99999-11111)+11111);
    let shareKey = { 
      ts:ts,
      pubkey:this.crypto_.pubKeyB58,
      password:this.OneTimePassword_
    };
    this.crypto_.miningAuth(JSON.stringify(shareKey),(auth)=> {
      if(auth.hashSign.startsWith(this.SHARE_PUBKEY_DIFFCULTY)) {
        //console.log('good lucky !!! sharePubKeyMining_:auth=<',auth,'>');
        //console.log('good lucky !!! sharePubKeyMining_:shareKey=<',shareKey,'>');
        self.sharedKeyMsgPreStage =  {	
          channel:'broadcast',	
          auth:auth,
          broadcast:shareKey	
        };	
        cb(true);
      } else {
        //console.log('bad lucky !!! sharePubKeyMining_:auth=<',auth,'>');
        //console.log('bad lucky !!! sharePubKeyMining_:shareKey=<',shareKey,'>');
        cb(false);
        self.sharePubKeyMining_(cb);
      }
    }); 
  }
  onShareKey_(shareKey,auth,assist) {
    if(!assist) {
      this.mineAssist_(shareKey,auth);
      return;
    }
    console.log('onShareKey_ shareKey =<' , shareKey ,'>');
    let self = this;
    this.verifyAssist_(auth,assist,() => {
      //console.log('onShareKey_ self.targetPubKeyPassword_ =<' , self.targetPubKeyPassword_ ,'>');
      //console.log('onShareKey_ typeof self.targetPubKeyCallback_ =<' , typeof self.targetPubKeyCallback_,'>');
      if(self.targetPubKeyPassword_ === shareKey.password.toString()) {
        if(typeof this.targetPubKeyCallback_ === 'function') {
          self.targetPubKeyCallback_(shareKey.pubkey);
          self.sharePubKeyCounter = 0;
        }
      }
    });
  }
  
  mineAssist_(shareKey,auth) {
    let self = this;
    this.crypto_.signAssist(auth,(assisted) => {
      console.log('onShareKey_ assisted =<' , assisted ,'>');
      if(assisted.hashSign.startsWith(self.SHARE_PUBKEY_DIFFCULTY)) {
        //console.log('good lucky !!! onShareKey_:assisted=<',assisted,'>');
        self.sharedKeyMsg =  {	
          channel:'broadcast',	
          auth:auth,
          assist:assisted,
          broadcast:shareKey	
        };
        self.sharePubKeyTimeOut_();
      } else {
        //console.log('bad lucky !!! onShareKey_:assisted=<',assisted,'>');
        self.onShareKey_(shareKey,auth);
      }
   })
  }
  verifyAssist_(auth,assist,cb) {
    //console.log('verifyAssist_ auth =<' , auth ,'>');
    //console.log('verifyAssist_ assist =<' , assist ,'>');
    if(!auth.hashSign.startsWith(this.SHARE_PUBKEY_DIFFCULTY)) {
      console.log('verifyAssist_ !!! bad hash auth =<' , auth ,'>');
      return;
    }
    if(!assist.hashSign.startsWith(this.SHARE_PUBKEY_DIFFCULTY)) {
      console.log('verifyAssist_ !!! bad hash assist =<' , assist ,'>');
      return;
    }
    if(auth.hash !== assist.orig.orig ) {
      console.log('verifyAssist_ !!! bad hash auth.hash =<' , auth.hash ,'>');
      console.log('verifyAssist_ !!! bad hash assist.orig.orig =<' , assist.orig.orig ,'>');
      return;
    }
    let self = this;
    this.crypto_.verifyAssist(assist,(result) => {
      console.log('verifyAssist_ result =<' , result ,'>');
      cb();
    });
  }  

}


module.exports = StarBianBroadcast;
