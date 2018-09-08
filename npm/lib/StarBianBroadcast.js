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
}


module.exports = StarBianBroadcast;
