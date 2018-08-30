/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const StarBianInner = require('./star_bian_inner');

class StarBianRepeater {
  /**
   * Create a new `StarBianRepeater`.
   *
   */
  constructor () {
    this.inner_ = new StarBianInner();
    this.inner_.onReady = (priKey,pubKey,authedKey) => {
      this.onReady(priKey,pubKey,authedKey);
    };
  }
  /**
   * pass through a messege.
   *
   * @param {String} msg 
   */
  passthrough(channel,msg) {
    this.inner_.passthrough(channel,msg);
  }
  /**
   * subscribe_passthrough.
   *
   * @param {String} channel 
   * @param {Function} callback 
   */
  subscribe_passthrough(channel,callback) {
    this.inner_.subscribe_passthrough(channel ,callback);
  }  
  /**
   * subscribe_passthrough_broadcast.
   *
   * @param {Function} callback 
   */
  subscribe_passthrough_broadcast(callback) {
    this.inner_.subscribe_passthrough_broadcast(callback);
  }
}

module.exports = StarBianRepeater;
