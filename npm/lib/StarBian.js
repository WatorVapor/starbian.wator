/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const StarBianInner = require('./star_bian_inner');

class StarBian {
  /**
   * Create a new `StarBian`.
   *
   */
  constructor () {
    this.inner_ = new StarBianInner();
    this.inner_.onReady = (priKey,pubKey,authedKey) => {
      this.onReady(priKey,pubKey,authedKey);
    };
  }
  /**
   * add authed public key.
   * @param {String} key 
   *
   */
  addAuthedKey (key) {
    this.inner_.addAuthedKey(key);
  }
  /**
   * broadcast public key with one time password.
   *
   */
  broadcastPubKey (cb) {
    this.inner_.broadcastPubKey(cb);
  }
  
  /**
   * publish a messege.
   *
   * @param {String} msg 
   * @param {String} channel 
   */
  publish(msg,channel) {
    this.inner_.publish(msg,channel);
  }
  /**
   * subscribe.
   *
   * @param {Function} callback 
   */
  subscribe(callback) {
    this.inner_.subscribe(callback);
  }
  /**
   * subscribe_broadcast.
   *
   * @param {Function} callback 
   */
  subscribe_broadcast(callback) {
    this.inner_.subscribe_broadcast(callback);
  }
}

module.exports = StarBian;
