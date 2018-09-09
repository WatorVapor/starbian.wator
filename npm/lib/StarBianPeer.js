/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */
'use strict';

const StarBianInner = require('./star_bian_inner');
class StarBianPeer {
  /**
   * Create a new `StarBianPeer`.
   *
   */
  constructor (keyChannel) {
    this.inner_ = new StarBianInner(keyChannel);
    this.keyChannel_ = keyChannel;
    this.inner_.onReady = () => {
      if(typeof this.onReady === 'function') {
        this.onReady();
      }
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

  // private
  sendThough_(msg) {
    this.inner_.sendThough(msg,this.keyChannel_);
  }
}


module.exports = StarBianPeer;
