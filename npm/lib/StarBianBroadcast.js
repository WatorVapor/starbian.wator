/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';

const StarBianInner = require('./star_bian_inner');

class StarBianBroadcast {
  /**
   * Create a new `StarBianBroadcast`.
   *
   */
  constructor () {
    this.inner_ = new StarBianInner();
    this.inner_.onReady = (priKey,pubKey,authedKey) => {
      if(typeof this.onReady === 'function') {
        this.onReady(priKey,pubKey,authedKey);
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
}


module.exports = {
  Broadcast:StarBianBroadcast
};
