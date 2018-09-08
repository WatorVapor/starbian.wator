/*!
 * starbian: a node.js star bian client
 * Copyright(c) 2017 Wato Vapor <watovapor@gmail.com>
 * MIT Licensed
 */

'use strict';

const StarBianP2p = require('./star_bian_p2p');

class StarBianRepeater {
  /**
   * Create a new `StarBianRepeater`.
   *
   */
  constructor () {
    this.p2p_ = new StarBianP2p();
    let self = this;
    this.p2p_.onReady = () => {
      self.p2p_.in('broadcast',(msg,channel,from) => {
        self._onP2PMsg(msg,channel,from)
      });
      if(typeof self.onReady === 'function') {
        self.onReady();
      }
    };
  }
  
  /**
   * pass through a messege.
   *
   * @param {String} msg 
   */
  passthrough(channel,msg) {
    //console.log('passthrough:msg =<',msg,'>');
    this.p2p_.out(channel ,msg);
  }
  /**
   * subscribe_passthrough.
   *
   * @param {String} channel 
   * @param {Function} callback 
   */
  subscribe_passthrough(channel,callback) {
    console.log('subscribe channel =<',channel,'>');
    this.p2p_.in(channel ,callback);
  }  
  /**
   * subscribe_passthrough_broadcast.
   *
   * @param {Function} callback 
   */
  subscribe_passthrough_broadcast(callback) {
    this.pt_bc_callback_ = callback;
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
    if(channel !== this.remoteChannel_) {
      console.warn('_onP2PMsg:: !!!not in my eye!!! channel=<',channel,'>');
      console.warn('_onP2PMsg:: !!!not in my eye!!! this.remoteChannel_=<',this.remoteChannel_,'>');
      console.warn('_onP2PMsg:: !!!not in my eye!!! msg=<',msg,'>');
      return;
    }
    if(typeof this.pt_bc_callback_ === 'function') {
      this.pt_bc_callback_(msg,channel,from);
    }
  }
}

module.exports = StarBianRepeater;
