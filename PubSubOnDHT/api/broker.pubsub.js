const TransferUDP = require('../src/transferUDP.js');
const DHTPeer = require('../src/peer.js');
const net = require('net');

class BrokerPubSub {
  constructor(config) {
    this.config_ = config;
    this.enterPubSub_();
    this.peer_ = new DHTPeer(this.config_.masterKey,this.config_.repos);
    this.brokerPeers_ = {};
  }
  
  setCluster(cluster) {
    this.cluster_ = cluster;
  }
  
  enterPubSub_() {
    const self = this;
    if(this.config_.pubsub.ipv4) {
      let host = this.config_.pubsub.ipv4.address;
      if(!host) {
        host = '0.0.0.0';
      }
      const port = this.config_.pubsub.ipv4.port;
      this.sock4_ = new TransferUDP(host,port,true);
      this.sock4_.onBindReady = ()=> {
        self.onListenPubSubReady_(4);
      }
      this.sock4_.onMsg = (msg,rinfo)=> {
        self.onMsgPubSub_(msg,rinfo);
      }
    }
    if(this.config_.pubsub.ipv6) {
      let host = this.config_.pubsub.ipv6.address;
      if(!host) {
        host = '::';
      }
      const port = this.config_.pubsub.ipv6.port;
      this.sock6_ = new TransferUDP(host,port,true);
      this.sock6_.onBindReady = ()=> {
        self.onListenPubSubReady_(6);
      }
      this.sock6_.onMsg = (msg,rinfo)=> {
        self.onMsgPubSub_(msg,rinfo);
      }
    }    
  }
  
  onListenPubSubReady_(family) {
    console.log('BrokerPubSub::onListenPubSubReady_::family:=<',family,'>');
  }

  
  onMsgPubSub_(msg,rinfo) {
    //console.log('BrokerPubSub::onMsgPubSub_::msg:=<',msg,'>');
    //console.log('BrokerPubSub::onMsgPubSub_::rinfo:=<',rinfo,'>');
    try {
      const msgJson = JSON.parse(msg);
      const isGood = this.peer_.verify(msgJson);
      //console.log('BrokerPubSub::onMsgPubSub_::isGood:=<',isGood,'>');
      if(isGood) {
        this.onGoodMsgPubSub_(msgJson,rinfo);
      }
    } catch(e) {
      console.log('BrokerPubSub::onMsgPubSub_::e:=<',e,'>');
    }
  }
  onGoodMsgPubSub_(msgJson,rinfo) {
    const rPeer = this.peer_.calcID(msgJson);
    //console.log('BrokerPubSub::onGoodMsgPubSub_::rPeer:=<',rPeer,'>');
    //console.log('BrokerPubSub::onGoodMsgPubSub_::msgJson:=<',msgJson,'>');
    if(msgJson.enter) {
      this.onEnterPubSubMsg_(msgJson.enter,rinfo,rPeer);
    } else {
      console.log('BrokerPubSub::onGoodMsgPubSub_::msgJson:=<',msgJson,'>');
    }
  }
  onEnterPubSubMsg_(enter,rinfo,rPeer) {
    //console.log('BrokerPubSub::onEnterPubSubMsg_::enter:=<',enter,'>');
    //console.log('BrokerPubSub::onEnterPubSubMsg_::rPeer:=<',rPeer,'>');
    //console.log('BrokerPubSub::onEnterPubSubMsg_::rinfo:=<',rinfo,'>');
    if(enter.role === 'pubsub') {
      const brokers = this.findSameVBroker_(rinfo.address);
      console.log('BrokerCluster::onEnterPubSubMsg_::brokers:=<',brokers,'>');
    }
  }
  
  findSameVBroker_(address) {
    console.log('BrokerCluster::findSameVBroker_::this.cluster_.clusterPeers_:=<',this.cluster_.clusterPeers_,'>');
    let filter = '';
    if(net.isIPv6(address)) {
      filter = 'v6_';
    }
    if(net.isIPv4(address)) {
      filter = 'v4_';
    }
    const goodBrokers = {};
    for(let peer in this.cluster_.clusterPeers_) {
      console.log('BrokerPubSub::onEnterPubSubMsg_::peer:=<',peer,'>');
      if(peer.startsWith(filter)) {
        goodBrokers[peer] = this.cluster_.clusterPeers_[peer];
      }
    }
    return goodBrokers;
  }

};
module.exports = BrokerPubSub;

