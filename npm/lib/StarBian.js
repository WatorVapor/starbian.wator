/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';

const StarBianInner = require('./star_bian_inner');
const StarBianCrypto = require('./star_bian_crypto.js');

class StarBian {
  /**
   * Create a new `StarBian`.
   *
   */
  constructor () {
    this.crypto_ = new StarBianCrypto();
    this.crypto_.onKeyReady = (priKey,pubKey,authedKey) => {
      this.onReady(priKey,pubKey,authedKey);
    };
  }
  /**
   * add authed public key.
   * @param {String} key 
   *
   */
  addAuthedKey (key) {
    this.crypto_.addAuthedKey(key);
  }
}

class StarBianPeer {
  /**
   * Create a new `StarBian`.
   *
   */
  constructor (keyChannel) {
    this.inner_ = new StarBianInner();
    this.keyChannel_ = keyChannel;
    this.inner_.onReady = (priKey,pubKey,authedKey) => {
      this.onReady(priKey,pubKey,authedKey);
    };
  }
  /**
   * publish a messege.
   *
   * @param {String} msg 
   * @param {String} channel 
   */
  publish(msg) {
    this.inner_.publish(msg,this.keyChannel_);
  }
  /**
   * subscribe.
   *
   * @param {Function} callback 
   */
  subscribe(callback) {
    this.inner_.subscribe(callback);
  }
}


class StarBianBroadcast {
  /**
   * Create a new `StarBianBroadcast`.
   *
   */
  constructor () {
    this.inner_ = new StarBianInner();
    this.inner_.onReady = (priKey,pubKey,authedKey) => {
      this.onReady(priKey,pubKey,authedKey);
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
}


module.exports = {
  StarBian:StarBian,
  Peer:StarBianPeer,
  Broadcast:StarBianBroadcast,
};
