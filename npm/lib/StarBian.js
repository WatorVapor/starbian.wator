/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';

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

module.exports = StarBian;
